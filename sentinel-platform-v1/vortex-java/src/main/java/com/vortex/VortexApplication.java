package com.vortex;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // Add this

@SpringBootApplication
@EnableAsync 
public class VortexApplication {
    public static void main(String[] args) {
        SpringApplication.run(VortexApplication.class, args);
    }
}