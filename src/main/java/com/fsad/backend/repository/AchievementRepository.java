package com.fsad.backend.repository;

import com.fsad.backend.entity.Achievement;
import com.fsad.backend.entity.AchievementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByUserId(Long userId);

    List<Achievement> findByStatus(AchievementStatus status);

    List<Achievement> findByMentorUniqueIdIn(List<String> mentorIds);

    List<Achievement> findByMentor_Id(Long mentorId);

    List<Achievement> findByMentor_IdAndStatus(Long mentorId, AchievementStatus status);

    // --- Optimized count queries for Dashboards ---

    // Student Dashboard
    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, AchievementStatus status);

    @Query("SELECT a.category, COUNT(a) FROM Achievement a WHERE a.user.id = :userId GROUP BY a.category")
    List<Object[]> countCategoryByUserId(@Param("userId") Long userId);

    @Query("SELECT MONTH(a.dateAchieved), COUNT(a) FROM Achievement a WHERE a.user.id = :userId GROUP BY MONTH(a.dateAchieved)")
    List<Object[]> countMonthlyByUserId(@Param("userId") Long userId);

    // Mentor Dashboard
    long countByMentor_Id(Long mentorId);

    long countByMentor_IdAndStatus(Long mentorId, AchievementStatus status);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Achievement a WHERE a.mentor.id = :mentorId")
    long countDistinctStudentsByMentorId(@Param("mentorId") Long mentorId);

    @Query("SELECT a.category, COUNT(a) FROM Achievement a WHERE a.mentor.id = :mentorId GROUP BY a.category")
    List<Object[]> countCategoryByMentorId(@Param("mentorId") Long mentorId);

    @Query("SELECT MONTH(a.dateAchieved), COUNT(a) FROM Achievement a WHERE a.mentor.id = :mentorId GROUP BY MONTH(a.dateAchieved)")
    List<Object[]> countMonthlyByMentorId(@Param("mentorId") Long mentorId);

    // Admin Dashboard
    long countByStatus(AchievementStatus status);

    @Query("SELECT a.category, COUNT(a) FROM Achievement a GROUP BY a.category")
    List<Object[]> countAllByCategory();

    @Query("SELECT MONTH(a.dateAchieved), COUNT(a) FROM Achievement a GROUP BY MONTH(a.dateAchieved)")
    List<Object[]> countAllMonthly();
}
