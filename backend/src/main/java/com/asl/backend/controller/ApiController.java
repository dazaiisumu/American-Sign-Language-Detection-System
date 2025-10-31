package com.asl.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")  // base path for all endpoints in this controller
public class ApiController {

    @GetMapping("/test")
    public String test() {
        return "Backend is running!";
    }
}
