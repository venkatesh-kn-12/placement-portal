package com.placement.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.io.File;
import java.nio.file.Files;

@SpringBootApplication
@EnableScheduling
public class PlacementPortalApplication {
    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(PlacementPortalApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("placement-backend/.env");
        }
        if (envFile.exists()) {
            try {
                Files.lines(envFile.toPath())
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .forEach(line -> {
                        int delimiterIndex = line.indexOf('=');
                        if (delimiterIndex > 0) {
                            String key = line.substring(0, delimiterIndex).trim();
                            String value = line.substring(delimiterIndex + 1).trim();
                            // If value is quoted, strip quotes
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            System.setProperty(key, value);
                        }
                    });
            } catch (Exception e) {
                System.err.println("Failed to load .env file: " + e.getMessage());
            }
        }
    }
}