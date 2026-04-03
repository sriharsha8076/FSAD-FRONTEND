package com.fsad.backend.service;

import com.fsad.backend.dto.DashboardResponse.*;
import com.fsad.backend.entity.AchievementStatus;
import com.fsad.backend.entity.Role;
import com.fsad.backend.repository.AchievementRepository;
import com.fsad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    private final String[] COLORS = { "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444" };

    private String getMonthName(Object monthNumberObj) {
        if (monthNumberObj == null)
            return "Unknown";
        try {
            int monthNumber = Integer.parseInt(monthNumberObj.toString());
            return Month.of(monthNumber).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        } catch (Exception e) {
            return "Unknown";
        }
    }

    private List<ChartDataDTO> mapToChartData(List<Object[]> queryResult, boolean isMonth) {
        int colorIdx = 0;
        List<ChartDataDTO> result = new java.util.ArrayList<>();
        for (Object[] row : queryResult) {
            String name = isMonth ? getMonthName(row[0]) : (row[0] != null ? row[0].toString() : "Unknown");
            long count = row[1] != null ? ((Number) row[1]).longValue() : 0;
            String color = COLORS[colorIdx % COLORS.length];
            colorIdx++;

            ChartDataDTO dto = ChartDataDTO.builder()
                    .name(name)
                    .value(count)
                    .color(color)
                    .build();

            if (isMonth) {
                dto.setMonth(name);
                dto.setAchievements(count);
                dto.setVerifications(count);
            }
            result.add(dto);
        }
        return result;
    }

    public StudentDashboardDTO getStudentDashboard(Long userId) {
        return StudentDashboardDTO.builder()
                .totalAchievements(achievementRepository.countByUserId(userId))
                .verifiedCount(achievementRepository.countByUserIdAndStatus(userId, AchievementStatus.VERIFIED))
                .pendingCount(achievementRepository.countByUserIdAndStatus(userId, AchievementStatus.PENDING))
                .rejectedCount(achievementRepository.countByUserIdAndStatus(userId, AchievementStatus.REJECTED))
                .categoryDistributionData(mapToChartData(achievementRepository.countCategoryByUserId(userId), false))
                .monthlyAchievementsData(mapToChartData(achievementRepository.countMonthlyByUserId(userId), true))
                .build();
    }

    public MentorDashboardDTO getMentorDashboard(Long mentorId) {
        return MentorDashboardDTO.builder()
                .totalAssignedStudents(achievementRepository.countDistinctStudentsByMentorId(mentorId))
                .totalSubmissions(achievementRepository.countByMentor_Id(mentorId))
                .pendingVerifications(
                        achievementRepository.countByMentor_IdAndStatus(mentorId, AchievementStatus.PENDING))
                .approvedCount(achievementRepository.countByMentor_IdAndStatus(mentorId, AchievementStatus.VERIFIED))
                .rejectedCount(achievementRepository.countByMentor_IdAndStatus(mentorId, AchievementStatus.REJECTED))
                .categoryData(mapToChartData(achievementRepository.countCategoryByMentorId(mentorId), false))
                .monthlyTrends(mapToChartData(achievementRepository.countMonthlyByMentorId(mentorId), true))
                .build();
    }

    public AdminDashboardDTO getAdminDashboard() {
        return AdminDashboardDTO.builder()
                .totalStudents(userRepository.countByRole(Role.STUDENT))
                .totalMentors(userRepository.countByRole(Role.MENTOR))
                .totalAchievements(achievementRepository.count())
                .totalPending(achievementRepository.countByStatus(AchievementStatus.PENDING))
                .totalApproved(achievementRepository.countByStatus(AchievementStatus.VERIFIED))
                .categoryDistributionData(mapToChartData(achievementRepository.countAllByCategory(), false))
                .monthlyAchievementsData(mapToChartData(achievementRepository.countAllMonthly(), true))
                .build();
    }
}
