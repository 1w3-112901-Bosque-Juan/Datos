package com.example.tp1.controller;

import com.example.tp1.dto.AuthResponse;
import com.example.tp1.dto.LoginRequest;
import com.example.tp1.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

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

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody LoginRequest req) {
        boolean ok = authService.register(req.getUsername(), req.getPassword());
        if (ok) return ResponseEntity.status(201).build();
        return ResponseEntity.status(409).build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(name = "X-Session-Token", required = false) String token) {
        if (token != null) {
            authService.logout(token);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }
}
