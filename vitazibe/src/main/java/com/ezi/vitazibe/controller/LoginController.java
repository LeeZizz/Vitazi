package com.ezi.vitazibe.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
public class LoginController {

//    @GetMapping("/google")
//    public ResponseEntity<String> loginGoogle() {
//        return ResponseEntity.ok("Login google successful");
//    }
//
//    @GetMapping("/facebook")
//    public ResponseEntity<String> loginFacebook() {
//        return ResponseEntity.ok("Login facebook successful");
//    }

    @RequestMapping("/userInformation")
    public Principal user(Principal principal) {
        return principal;
    }

    @RequestMapping("/")
    public String home() {
        return "Welcome to Vitazi";
    }
}
