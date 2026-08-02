package com.farmtohome.catalog.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.farmtohome.catalog.dto.delivery.DeliveryEstimateResponse;
import com.farmtohome.catalog.service.DeliveryEstimateService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = DeliveryEstimateController.class)
class DeliveryEstimateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DeliveryEstimateService deliveryEstimateService;

    @Test
    void shouldAcceptValidLocations() throws Exception {
        DeliveryEstimateResponse response = new DeliveryEstimateResponse();
        response.setDistanceKm(12.4);
        response.setTravelMinutes(28);
        response.setPreparationMinutes(15);
        response.setTotalDeliveryMinutes(43);
        response.setEstimatedDeliveryText("35-50 minutes");
        response.setEstimatedArrivalTime(LocalDateTime.now().plusMinutes(43));
        response.setFormattedArrivalTime("4:25 PM");
        response.setEncodedPolyline("abc");

        when(deliveryEstimateService.estimateDelivery(any())).thenReturn(response);

        mockMvc.perform(post("/api/delivery/estimate")
                .contentType(APPLICATION_JSON)
                .content(validPayload()))
            .andExpect(status().isOk());
    }

    @Test
    void shouldRejectInvalidLatitude() throws Exception {
        mockMvc.perform(post("/api/delivery/estimate")
                .contentType(APPLICATION_JSON)
                .content(validPayload().replace("17.440081", "197.440081")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidLongitude() throws Exception {
        mockMvc.perform(post("/api/delivery/estimate")
                .contentType(APPLICATION_JSON)
                .content(validPayload().replace("78.348915", "278.348915")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectMissingDestination() throws Exception {
        mockMvc.perform(post("/api/delivery/estimate")
                .contentType(APPLICATION_JSON)
                .content("""
                    {
                      "originLatitude": 17.385044,
                      "originLongitude": 78.486671,
                      "destinationLatitude": 17.440081,
                      "preparationMinutes": 15
                    }
                    """))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectNegativePreparationMinutes() throws Exception {
        mockMvc.perform(post("/api/delivery/estimate")
                .contentType(APPLICATION_JSON)
                .content(validPayload().replace("\"preparationMinutes\": 15", "\"preparationMinutes\": -1")))
            .andExpect(status().isBadRequest());
    }

    private String validPayload() {
        return """
            {
              "originLatitude": 17.385044,
              "originLongitude": 78.486671,
              "destinationLatitude": 17.440081,
              "destinationLongitude": 78.348915,
              "preparationMinutes": 15
            }
            """;
    }
}
