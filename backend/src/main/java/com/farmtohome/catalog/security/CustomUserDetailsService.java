package com.farmtohome.catalog.security;

import com.farmtohome.catalog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String loginValue = identifier == null ? "" : identifier.trim();

        return userRepository.findByEmailIgnoreCase(loginValue)
            .or(() -> userRepository.findByPhoneNumber(loginValue))
            .map(UserAccountPrincipal::from)
            .orElseThrow(() -> new UsernameNotFoundException("Invalid email/phone number or password."));
    }
}