package com.asl.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {

            // CORS configuration for frontend React app
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true); // important for session cookies
            }

            // Serve uploaded files from "uploads" folder
            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                String uploadPath = "file:" + System.getProperty("user.dir") + "/uploads/";
                registry.addResourceHandler("/uploads/")
                        .addResourceLocations(uploadPath);
            }
        };
    }
}
