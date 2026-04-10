package com.example.tp1.controller;

import com.example.tp1.dto.AuthResponse;
import com.example.tp1.dto.LoginRequest;
import com.example.tp1.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        String token = authService.login(req.getUsername(), req.getPassword());
        if (token != null) {
            return ResponseEntity.ok(new AuthResponse(true, token, req.getUsername()));
        }
        return ResponseEntity.status(401).body(new AuthResponse(false, null, null));
    }
}
