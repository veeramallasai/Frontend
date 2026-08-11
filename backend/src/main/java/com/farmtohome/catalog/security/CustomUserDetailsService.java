package com.farmtohome.catalog.security;

import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String loginValue = identifier == null ? "" : identifier.trim();
        log.info("[AUTH] User lookup started, identifier={}", loginValue);

        UserAccount userAccount = userRepository.findByEmailIgnoreCase(loginValue)
            .or(() -> userRepository.findByPhoneNumber(loginValue))
            .orElseThrow(() -> {
                log.warn("[AUTH] User lookup failed, identifier={}", loginValue);
                return new UsernameNotFoundException("Invalid email/phone number or password.");
            });

        log.info("[AUTH] User found, identifier={}, role={}", loginValue, userAccount.getRole());
        return UserAccountPrincipal.from(userAccount);
    }
}