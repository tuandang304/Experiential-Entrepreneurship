package com.aima.service;

import com.aima.dto.request.IntrospectRequest;
import com.aima.dto.request.LoginRequest;
import com.aima.dto.request.LogoutRequest;
import com.aima.dto.response.AuthenticationResponse;
import com.aima.dto.response.IntrospectResponse;
import com.aima.entity.User;
import com.nimbusds.jose.JOSEException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(LoginRequest request, HttpServletResponse response);
    IntrospectResponse introspect(IntrospectRequest request);
    void logout(LogoutRequest request, HttpServletRequest httpRequest, HttpServletResponse response)
            throws ParseException, JOSEException;
    AuthenticationResponse refreshToken(HttpServletRequest httpRequest, HttpServletResponse response);
    AuthenticationResponse generateTokenForOAuth2User(User user);
    boolean isAccountLocked(String identifier);
}
