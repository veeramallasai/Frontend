package com.farmtohome.catalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.farmtohome.catalog.dto.delivery.DeliveryEstimateRequest;
import com.farmtohome.catalog.dto.delivery.DeliveryEstimateResponse;
import com.farmtohome.catalog.exception.DeliveryRouteNotFoundException;
import com.farmtohome.catalog.exception.GoogleRoutesApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class DeliveryEstimateService {

    private static final Pattern DURATION_PATTERN = Pattern.compile("^(\\d+)s$");
    private static final DateTimeFormatter ARRIVAL_TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");

    private final RestClient restClient;
    private final String routesApiKey;
    private final String routesApiUrl;

    public DeliveryEstimateService(
        RestClient.Builder restClientBuilder,
        @Value("${google.maps.routes-api-key:}") String routesApiKey,
        @Value("${google.maps.routes-url}") String routesApiUrl
    ) {
        this(restClientBuilder.build(), routesApiKey, routesApiUrl);
    }

    DeliveryEstimateService(RestClient restClient, String routesApiKey, String routesApiUrl) {
        this.restClient = restClient;
        this.routesApiKey = routesApiKey;
        this.routesApiUrl = routesApiUrl;
    }

    public DeliveryEstimateResponse estimateDelivery(DeliveryEstimateRequest request) {
        ensureRoutesApiKeyConfigured();

        JsonNode responseNode = fetchRouteFromGoogle(request);
        JsonNode route = extractPrimaryRoute(responseNode);

        int distanceMeters = route.path("distanceMeters").asInt(-1);
        String durationValue = route.path("duration").asText("");
        String encodedPolyline = route.path("polyline").path("encodedPolyline").asText("");

        if (distanceMeters < 0) {
            throw new GoogleRoutesApiException("Google Routes API returned an invalid distance value.");
        }

        int travelMinutes = durationToMinutes(durationValue);
        int preparationMinutes = request.getPreparationMinutes();
        int totalDeliveryMinutes = travelMinutes + preparationMinutes;
        LocalDateTime estimatedArrival = LocalDateTime.now().plusMinutes(totalDeliveryMinutes);

        DeliveryEstimateResponse response = new DeliveryEstimateResponse();
        response.setDistanceKm(metersToKilometers(distanceMeters));
        response.setTravelMinutes(travelMinutes);
        response.setPreparationMinutes(preparationMinutes);
        response.setTotalDeliveryMinutes(totalDeliveryMinutes);
        response.setEstimatedDeliveryText(buildEstimatedRange(totalDeliveryMinutes));
        response.setEstimatedArrivalTime(estimatedArrival);
        response.setFormattedArrivalTime(estimatedArrival.format(ARRIVAL_TIME_FORMATTER));
        response.setEncodedPolyline(encodedPolyline);
        return response;
    }

    public int getPreparationMinutesForItemCount(int itemCount) {
        if (itemCount <= 5) {
            return 10;
        }
        if (itemCount <= 10) {
            return 15;
        }
        return 20;
    }

    JsonNode fetchRouteFromGoogle(DeliveryEstimateRequest request) {
        Map<String, Object> requestBody = Map.of(
            "origin", Map.of(
                "location", Map.of(
                    "latLng", Map.of(
                        "latitude", request.getOriginLatitude(),
                        "longitude", request.getOriginLongitude()
                    )
                )
            ),
            "destination", Map.of(
                "location", Map.of(
                    "latLng", Map.of(
                        "latitude", request.getDestinationLatitude(),
                        "longitude", request.getDestinationLongitude()
                    )
                )
            ),
            "travelMode", "DRIVE",
            "routingPreference", "TRAFFIC_AWARE",
            "languageCode", "en-IN",
            "units", "METRIC",
            "computeAlternativeRoutes", false
        );

        try {
            return restClient.post()
                .uri(routesApiUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("X-Goog-Api-Key", routesApiKey)
                .header("X-Goog-FieldMask", "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline")
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);
        } catch (RestClientException ex) {
            throw new GoogleRoutesApiException("Failed to fetch route from Google Routes API.", ex);
        }
    }

    JsonNode extractPrimaryRoute(JsonNode responseNode) {
        if (responseNode == null || !responseNode.has("routes") || !responseNode.get("routes").isArray()) {
            throw new GoogleRoutesApiException("Google Routes API returned an unexpected response format.");
        }

        JsonNode routes = responseNode.get("routes");
        if (routes.isEmpty()) {
            throw new DeliveryRouteNotFoundException("A valid delivery route could not be calculated.");
        }

        return routes.get(0);
    }

    int durationToMinutes(String durationValue) {
        Matcher matcher = DURATION_PATTERN.matcher(String.valueOf(durationValue));
        if (!matcher.matches()) {
            throw new GoogleRoutesApiException("Google Routes API returned a malformed duration value.");
        }

        long seconds = Long.parseLong(matcher.group(1));
        return (int) Math.ceil(seconds / 60.0);
    }

    Double metersToKilometers(int distanceMeters) {
        return BigDecimal.valueOf(distanceMeters)
            .divide(BigDecimal.valueOf(1000), 1, RoundingMode.HALF_UP)
            .doubleValue();
    }

    String buildEstimatedRange(int totalMinutes) {
        int minRange = ((Math.max(totalMinutes - 5, 1)) / 5) * 5;
        int maxRange = ((totalMinutes + 9) / 10) * 10;
        if (minRange >= maxRange) {
            maxRange = minRange + 10;
        }
        return minRange + "-" + maxRange + " minutes";
    }

    private void ensureRoutesApiKeyConfigured() {
        if (!StringUtils.hasText(routesApiKey)) {
            throw new GoogleRoutesApiException("Google Routes API key is not configured on the server.");
        }
    }
}
