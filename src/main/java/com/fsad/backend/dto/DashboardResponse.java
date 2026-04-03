package com.fsad.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

public class DashboardResponse {

    @Data
    @Builder
    public static class ChartDataDTO {
        private String name;
        private Long value;
        private String color;
        private Long verifications;
        private String month;
        private Long achievements;
        private Long students;
    }

    @Data
    @Builder
    public static class StudentDashboardDTO {
        private long totalAchievements;
        private long verifiedCount;
        private long pendingCount;
        private long rejectedCount;
        private List<ChartDataDTO> categoryDistributionData;
        private List<ChartDataDTO> monthlyAchievementsData;
    }

    @Data
    @Builder
    public static class MentorDashboardDTO {
        private long totalAssignedStudents;
        private long totalSubmissions;
        private long pendingVerifications;
        private long approvedCount;
        private long rejectedCount;
        private List<ChartDataDTO> categoryData;
        private List<ChartDataDTO> monthlyTrends;
    }

    @Data
    @Builder
    public static class AdminDashboardDTO {
        private long totalStudents;
        private long totalMentors;
        private long totalAchievements;
        private long totalPending;
        private long totalApproved;
        private List<ChartDataDTO> categoryDistributionData;
        private List<ChartDataDTO> monthlyAchievementsData;
    }
}
