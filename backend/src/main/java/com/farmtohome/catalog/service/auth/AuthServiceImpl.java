package com.farmtohome.catalog.service.auth;

import com.farmtohome.catalog.dto.auth.AuthResponseDto;
import com.farmtohome.catalog.dto.auth.LoginRequestDto;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.repository.UserRepository;
import com.farmtohome.catalog.security.JwtService;
import com.farmtohome.catalog.security.UserAccountPrincipal;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequestDto request) {
        String identifier = request.getIdentifier() == null ? "" : request.getIdentifier().trim();

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        UserAccountPrincipal principal = (UserAccountPrincipal) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return AuthResponseDto.fromPrincipal(principal, token);
    }

    @Override
    public AuthResponseDto currentUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new AuthenticationCredentialsNotFoundException("Unauthorized");
        }

        String email = principal.getName().trim();
        UserAccount userAccount = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Unauthorized"));

        return AuthResponseDto.fromPrincipal(UserAccountPrincipal.from(userAccount));
    }
}