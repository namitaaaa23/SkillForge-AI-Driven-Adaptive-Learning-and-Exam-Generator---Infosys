package com.skillforge.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.model:gemini-pro}")
    private String model;
    
    public String getApiKey() {
        return apiKey;
    }
    
    public String getModel() {
        return model;
    }
}
