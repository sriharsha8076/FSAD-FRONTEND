package com.fsad.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AchievementRequest {
    private String title;
    private String description;
    private String category;
    private LocalDate dateAchieved;
    private String certificateUrl;
    private String mentorId;
}
