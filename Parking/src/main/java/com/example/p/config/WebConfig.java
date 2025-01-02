package com.example.p.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Allows all endpoints
                .allowedOrigins("http://waytest.quantasip.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allows specific HTTP methods
                .allowedHeaders("*")  // Allows all headers
                .allowCredentials(true);  // Allows credentials (if needed)
    }
}
