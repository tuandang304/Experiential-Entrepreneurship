package com.aima.service;

import com.aima.entity.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import java.text.ParseException;

public interface JwtService {
    String generateAccessToken(User user);

    String generateRefreshToken(User user, String jti);

    JWTClaimsSet parseClaims(String token) throws JOSEException, ParseException;
}
