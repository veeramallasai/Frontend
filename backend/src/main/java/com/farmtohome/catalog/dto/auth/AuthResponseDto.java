package com.farmtohome.catalog.dto.auth;

import com.farmtohome.catalog.security.UserAccountPrincipal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {

    private Long userId;
    private Long id;
    private String name;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String phone;
    private String email;
    private String role;
    private String token;
    private String accessToken;

    public static AuthResponseDto fromPrincipal(UserAccountPrincipal principal, String token) {
        String fullName = principal.getFullName();
        String role = principal.getRole().name().toLowerCase();

        return AuthResponseDto.builder()
            .userId(principal.getId())
            .id(principal.getId())
            .name(fullName)
            .firstName(principal.getFirstName())
            .lastName(principal.getLastName())
            .phoneNumber(principal.getPhoneNumber())
            .phone(principal.getPhoneNumber())
            .email(principal.getEmail())
            .role(role)
            .token(token)
            .accessToken(token)
            .build();
    }

    public static AuthResponseDto fromPrincipal(UserAccountPrincipal principal) {
        return fromPrincipal(principal, null);
    }
}