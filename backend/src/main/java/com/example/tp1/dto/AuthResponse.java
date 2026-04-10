package com.example.tp1.dto;

public class AuthResponse {
    private boolean authenticated;
    private String sessionToken; // simple token stored in Redis
    private String username;

    public AuthResponse(boolean authenticated, String sessionToken, String username) {
        this.authenticated = authenticated;
        this.sessionToken = sessionToken;
        this.username = username;
    }

    public boolean isAuthenticated() { return authenticated; }
    public String getSessionToken() { return sessionToken; }
    public String getUsername() { return username; }
}
