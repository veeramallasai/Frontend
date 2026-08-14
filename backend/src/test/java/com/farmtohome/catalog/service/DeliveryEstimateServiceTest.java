package com.farmtohome.catalog.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.farmtohome.catalog.dto.delivery.DeliveryEstimateRequest;
import com.farmtohome.catalog.dto.delivery.DeliveryEstimateResponse;
import com.farmtohome.catalog.exception.DeliveryRouteNotFoundException;
import com.farmtohome.catalog.exception.GoogleRoutesApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class DeliveryEstimateServiceTest {

    private static final String ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

    private DeliveryEstimateService service;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        service = new DeliveryEstimateService(restClientBuilder, "test-routes-key", ROUTES_URL);
    }

    @Test
    void estimateDeliveryShouldReturnExpectedValuesForValidLocations() {
        String responseBody = """
            {
              "routes": [
                {
                  "distanceMeters": 12400,
                  "duration": "1680s",
                  "polyline": {
                    "encodedPolyline": "abc123"
                  }
                }
              ]
            }
            """;

        mockServer.expect(requestTo(ROUTES_URL))
            .andExpect(method(HttpMethod.POST))
            .andExpect(header("X-Goog-Api-Key", "test-routes-key"))
            .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        DeliveryEstimateResponse response = service.estimateDelivery(baseRequest());

        assertThat(response.getDistanceKm()).isEqualTo(12.4);
        assertThat(response.getTravelMinutes()).isEqualTo(28);
        assertThat(response.getPreparationMinutes()).isEqualTo(15);
        assertThat(response.getTotalDeliveryMinutes()).isEqualTo(43);
        assertThat(response.getEstimatedDeliveryText()).isEqualTo("35-50 minutes");
        assertThat(response.getFormattedArrivalTime()).isNotBlank();
        assertThat(response.getEncodedPolyline()).isEqualTo("abc123");

        mockServer.verify();
    }

    @Test
    void estimateDeliveryShouldHandleGoogleRoutesApiFailure() {
        mockServer.expect(requestTo(ROUTES_URL))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withServerError());

        assertThatThrownBy(() -> service.estimateDelivery(baseRequest()))
            .isInstanceOf(GoogleRoutesApiException.class)
            .hasMessageContaining("Failed to fetch route");
    }

    @Test
    void estimateDeliveryShouldHandleEmptyRoutes() {
        mockServer.expect(requestTo(ROUTES_URL))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withSuccess("{\"routes\":[]}", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.estimateDelivery(baseRequest()))
            .isInstanceOf(DeliveryRouteNotFoundException.class)
            .hasMessageContaining("valid delivery route");
    }

    @Test
    void estimateDeliveryShouldHandleMalformedDuration() {
        String responseBody = """
            {
              "routes": [
                {
                  "distanceMeters": 1000,
                  "duration": "P1D",
                  "polyline": {
                    "encodedPolyline": "abc123"
                  }
                }
              ]
            }
            """;

        mockServer.expect(requestTo(ROUTES_URL))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.estimateDelivery(baseRequest()))
            .isInstanceOf(GoogleRoutesApiException.class)
            .hasMessageContaining("malformed duration");
    }

    @Test
    void durationToMinutesShouldUseCeilingConversion() {
        assertThat(service.durationToMinutes("61s")).isEqualTo(2);
    }

    @Test
    void metersToKilometersShouldConvertDistanceCorrectly() {
        assertThat(service.metersToKilometers(15550)).isEqualTo(15.6);
    }

    @Test
    void buildEstimatedRangeShouldReturnReasonableRange() {
        assertThat(service.buildEstimatedRange(43)).isEqualTo("35-50 minutes");
    }

    @Test
    void getPreparationMinutesForItemCountShouldRespectSizeRules() {
        assertThat(service.getPreparationMinutesForItemCount(3)).isEqualTo(10);
        assertThat(service.getPreparationMinutesForItemCount(8)).isEqualTo(15);
        assertThat(service.getPreparationMinutesForItemCount(11)).isEqualTo(20);
    }

    @Test
    void estimateDeliveryShouldFailWhenApiKeyIsMissing() {
        DeliveryEstimateService missingKeyService = new DeliveryEstimateService(RestClient.builder(), "", ROUTES_URL);

        assertThatThrownBy(() -> missingKeyService.estimateDelivery(baseRequest()))
            .isInstanceOf(GoogleRoutesApiException.class)
            .hasMessageContaining("not configured");
    }

    private DeliveryEstimateRequest baseRequest() {
        DeliveryEstimateRequest request = new DeliveryEstimateRequest();
        request.setOriginLatitude(17.385044);
        request.setOriginLongitude(78.486671);
        request.setDestinationLatitude(17.440081);
        request.setDestinationLongitude(78.348915);
        request.setPreparationMinutes(15);
        return request;
    }
}
