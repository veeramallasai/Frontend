package com.farmtohome.catalog.service.auth;

import com.farmtohome.catalog.dto.auth.AuthResponseDto;
import com.farmtohome.catalog.dto.auth.LoginRequestDto;
import java.security.Principal;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto request);

    AuthResponseDto currentUser(Principal principal);
}