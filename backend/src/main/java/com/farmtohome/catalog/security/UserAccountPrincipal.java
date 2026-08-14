package com.farmtohome.catalog.security;

import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import java.util.Collection;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
@RequiredArgsConstructor
public class UserAccountPrincipal implements UserDetails {

    private final Long id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phoneNumber;
    private final String password;
    private final UserRole role;

    public static UserAccountPrincipal from(UserAccount userAccount) {
        return new UserAccountPrincipal(
            userAccount.getId(),
            userAccount.getFirstName(),
            userAccount.getLastName(),
            userAccount.getEmail(),
            userAccount.getPhoneNumber(),
            userAccount.getPassword(),
            userAccount.getRole()
        );
    }

    public String getFullName() {
        if (lastName == null || lastName.isBlank()) {
            return firstName;
        }

        return firstName + " " + lastName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}