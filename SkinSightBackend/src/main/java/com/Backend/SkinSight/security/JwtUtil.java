package com.Backend.SkinSight.security;

import com.Backend.SkinSight.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private long expirationMs;

    private Key getSigningKey(){
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(User user){
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId",user.getId())
                .claim("role",user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis()+expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token){
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token){
        return extractAllClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token){
        return extractAllClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token,String email){
        try {
            String tokenEmail=extractEmail(token);
            return tokenEmail.equals(email) && !isTokenExpired(token);
        }
        catch (Exception e){
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

}
