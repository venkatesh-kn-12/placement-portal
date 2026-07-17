package com.placement.portal.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class AlertService {

    @Scheduled(cron = "0 0 6 * * ?") // daily at 6 AM
    public void generateAlerts() {
        // Logic: find students with match < 50% for upcoming companies
        // Insert Alert entities into DB
    }
}