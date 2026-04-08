package com.fsad.backend.controller;

import com.fsad.backend.entity.Achievement;
import com.fsad.backend.entity.User;
import com.fsad.backend.repository.AchievementRepository;
import com.fsad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/university")
@RequiredArgsConstructor
public class UniversityController {

        private final UserRepository userRepository;
        private final AchievementRepository achievementRepository;

        @GetMapping("/{id}/certificates")
        @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
        public ResponseEntity<List<Achievement>> getUniversityCertificates(@PathVariable Long id) {
                // Find all mentors associated with this university
                List<User> mentors = userRepository.findAll().stream()
                                .filter(u -> "MENTOR".equalsIgnoreCase(u.getRole().name())
                                                && u.getUniversity() != null
                                                && u.getUniversity().getId().equals(id))
                                .collect(Collectors.toList());

                List<String> mentorIds = mentors.stream()
                                .map(User::getUniqueId)
                                .collect(Collectors.toList());

                if (mentorIds.isEmpty()) {
                        return ResponseEntity.ok(new ArrayList<>());
                }

                List<Achievement> achievements = achievementRepository.findByMentorUniqueIdIn(mentorIds);
                return ResponseEntity.ok(achievements);
        }

        @GetMapping("/{id}/mentor-stats")
        @PreAuthorize("hasRole('UNIVERSITY_ADMIN')")
        public ResponseEntity<List<Map<String, Object>>> getMentorStats(@PathVariable Long id) {
                List<User> mentors = userRepository.findAll().stream()
                                .filter(u -> "MENTOR".equalsIgnoreCase(u.getRole().name())
                                                && u.getUniversity() != null
                                                && u.getUniversity().getId().equals(id))
                                .collect(Collectors.toList());

                List<String> mentorIds = mentors.stream()
                                .map(User::getUniqueId)
                                .collect(Collectors.toList());

                if (mentorIds.isEmpty()) {
                        return ResponseEntity.ok(new ArrayList<>());
                }

                List<Achievement> achievements = achievementRepository.findByMentorUniqueIdIn(mentorIds);

                List<Map<String, Object>> response = new ArrayList<>();

                for (User mentor : mentors) {
                        long total = achievements.stream()
                                        .filter(a -> a.getMentor() != null
                                                        && mentor.getUniqueId().equals(a.getMentor().getUniqueId()))
                                        .count();

                        long approved = achievements.stream()
                                        .filter(a -> a.getMentor() != null
                                                        && mentor.getUniqueId().equals(a.getMentor().getUniqueId())
                                                        && "VERIFIED".equals(a.getStatus().name()))
                                        .count();

                        long rejected = achievements.stream()
                                        .filter(a -> a.getMentor() != null
                                                        && mentor.getUniqueId().equals(a.getMentor().getUniqueId())
                                                        && "REJECTED".equals(a.getStatus().name()))
                                        .count();

                        double approvalRate = total == 0 ? 0.0 : ((double) approved / total) * 100.0;
                        boolean flagged = approvalRate > 95.0 && total > 5; // Flagged only if they have approved a
                                                                            // suspicious
                                                                            // amount (e.g. > 5 total limits noise)

                        Map<String, Object> stat = new HashMap<>();
                        stat.put("mentorName", mentor.getName());
                        stat.put("mentorUniqueId", mentor.getUniqueId());
                        stat.put("totalCertificates", total);
                        stat.put("approvedCount", approved);
                        stat.put("rejectedCount", rejected);
                        stat.put("approvalRate", Math.round(approvalRate * 100.0) / 100.0);
                        stat.put("flagged", flagged);
                        response.add(stat);
                }

                return ResponseEntity.ok(response);
        }
}
