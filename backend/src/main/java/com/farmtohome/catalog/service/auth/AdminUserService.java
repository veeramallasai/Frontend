package com.farmtohome.catalog.service.auth;

import com.farmtohome.catalog.dto.auth.AdminUserDto;
import com.farmtohome.catalog.entity.UserAccount;
import com.farmtohome.catalog.enums.UserRole;
import com.farmtohome.catalog.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserDto> getCustomers() {
        List<UserAccount> allUsers = userRepository.findAll();
        List<AdminUserDto> result = new ArrayList<>();
        for (UserAccount user : allUsers) {
            if (user.getRole() == null || user.getRole() == UserRole.CUSTOMER) {
                result.add(mapToDto(user));
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers() {
        List<UserAccount> users = userRepository.findAll();
        List<AdminUserDto> result = new ArrayList<>();
        for (UserAccount user : users) {
            result.add(mapToDto(user));
        }
        return result;
    }

    private AdminUserDto mapToDto(UserAccount user) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(user.getId());
        String fullName = (user.getFirstName() != null ? user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "") : user.getEmail()).trim();
        dto.setName(fullName);
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhoneNumber());
        dto.setRole(user.getRole() != null ? user.getRole().name() : "CUSTOMER");
        dto.setStatus("Active");
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
