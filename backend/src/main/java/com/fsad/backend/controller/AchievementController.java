package com.fsad.backend.controller;

import com.fsad.backend.dto.AchievementRequest;
import com.fsad.backend.dto.MessageResponse;
import com.fsad.backend.entity.Achievement;
import com.fsad.backend.entity.AchievementStatus;
import com.fsad.backend.entity.User;
import com.fsad.backend.repository.AchievementRepository;
import com.fsad.backend.repository.UserRepository;
import com.fsad.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    // Student creates a new achievement
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> createAchievement(@RequestBody AchievementRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User student = userRepository.findById(userDetails.getId()).orElseThrow();

        User mentorUser = null;
        if (request.getMentorId() != null && !request.getMentorId().trim().isEmpty()) {
            mentorUser = userRepository.findByUniqueId(request.getMentorId().trim()).orElse(null);
            System.out.println("DEBUG CREATE - Searching for mentor unique ID: '" + request.getMentorId()
                    + "' -> Found DB ID: " + (mentorUser != null ? mentorUser.getId() : "NULL"));
        }

        Achievement achievement = Achievement.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .dateAchieved(request.getDateAchieved())
                .certificateUrl(request.getCertificateUrl())
                .mentor(mentorUser)
                .status(AchievementStatus.PENDING)
                .user(student)
                .build();

        achievementRepository.save(achievement);

        return ResponseEntity
                .ok(new MessageResponse("Achievement submitted successfully and is pending verification."));
    }

    // Student views their own achievements
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Achievement>> getMyAchievements(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(achievementRepository.findByUserId(userDetails.getId()));
    }

    @GetMapping("/debug-db")
    public ResponseEntity<?> debugDb() {
        return ResponseEntity.ok(achievementRepository.findAll());
    }

    // Mentor/Admin views pending achievements
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MENTOR') or hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<?> getPendingAchievements(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // If current user is a MENTOR, only show achievements explicitly shared with
            // their ID
            boolean isMentor = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MENTOR"));

            if (isMentor) {
                // Fetch directly from DB utilizing Long ID
                List<Achievement> filtered = achievementRepository.findByMentor_IdAndStatus(userDetails.getId(),
                        AchievementStatus.PENDING);

                System.out.println("DEBUG PENDING - Token Email: " + userDetails.getEmail() + " | Mentor DB ID: "
                        + userDetails.getId());
                System.out.println("DEBUG PENDING - Filtered count directly from DB: " + filtered.size());

                return ResponseEntity.ok(filtered);
            }

            // University admins see their university's pending; Super Admin sees all
            List<Achievement> pending = achievementRepository.findByStatus(AchievementStatus.PENDING);
            User currentUser = userRepository.findById(userDetails.getId()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.fsad.backend.entity.Role.UNIVERSITY_ADMIN) {
                Long uniId = currentUser.getUniversity() != null ? currentUser.getUniversity().getId() : null;
                pending = pending.stream()
                        .filter(a -> a.getMentor() != null && a.getMentor().getUniversity() != null 
                             && a.getMentor().getUniversity().getId().equals(uniId))
                        .collect(java.util.stream.Collectors.toList());
            }
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Error fetching pending: " + e.getMessage()));
        }
    }

    // Mentor/Admin views all achievements attached to them
    @GetMapping("/mentor/all")
    @PreAuthorize("hasRole('MENTOR') or hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<?> getAllMentorAchievements(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            boolean isMentor = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MENTOR"));

            if (isMentor) {
                // Return all achievements where mentor matches
                List<Achievement> allAssigned = achievementRepository.findByMentor_Id(userDetails.getId());
                return ResponseEntity.ok(allAssigned);
            }

            // University admins see their university's achievements; Super Admin sees all
            List<Achievement> allAchievements = achievementRepository.findAll();
            User currentUser = userRepository.findById(userDetails.getId()).orElse(null);
            if (currentUser != null && currentUser.getRole() == com.fsad.backend.entity.Role.UNIVERSITY_ADMIN) {
                Long uniId = currentUser.getUniversity() != null ? currentUser.getUniversity().getId() : null;
                allAchievements = allAchievements.stream()
                        .filter(a -> a.getMentor() != null && a.getMentor().getUniversity() != null 
                             && a.getMentor().getUniversity().getId().equals(uniId))
                        .collect(java.util.stream.Collectors.toList());
            }
            return ResponseEntity.ok(allAchievements);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error fetching achievements: " + e.getMessage()));
        }
    }

    @PutMapping("/verify-all")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<?> verifyAllPendingAchievements(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Achievement> pending = achievementRepository.findByMentor_IdAndStatus(userDetails.getId(),
                    AchievementStatus.PENDING);
            pending.forEach(a -> a.setStatus(AchievementStatus.VERIFIED));
            achievementRepository.saveAll(pending);
            return ResponseEntity.ok(new MessageResponse("Successfully verified " + pending.size() + " achievements."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Error verifying all: " + e.getMessage()));
        }
    }

    // Mentor/Admin verifies an achievement
    @PutMapping("/verify/{id}")
    @PreAuthorize("hasRole('MENTOR') or hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<?> verifyAchievement(@PathVariable("id") Long id, Authentication authentication) {
        Optional<Achievement> achievementOpt = achievementRepository.findById(id);
        if (achievementOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Achievement not found"));
        }

        Achievement achievement = achievementOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        boolean isAssignedMentor = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MENTOR")) &&
                achievement.getMentor() != null &&
                userDetails.getId().equals(achievement.getMentor().getId());

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_UNIVERSITY_ADMIN"));

        if (!isAssignedMentor && !isAdmin) {
            return ResponseEntity.status(403).body(new MessageResponse("Unauthorized to verify this achievement"));
        }

        achievement.setStatus(AchievementStatus.VERIFIED);
        achievementRepository.save(achievement);
        return ResponseEntity.ok(new MessageResponse("Achievement verified successfully"));
    }

    // Mentor/Admin rejects an achievement
    @PutMapping("/deny/{id}")
    @PreAuthorize("hasRole('MENTOR') or hasRole('UNIVERSITY_ADMIN')")
    public ResponseEntity<?> denyAchievement(@PathVariable("id") Long id, Authentication authentication) {
        Optional<Achievement> achievementOpt = achievementRepository.findById(id);
        if (achievementOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Achievement not found"));
        }

        Achievement achievement = achievementOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        boolean isAssignedMentor = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MENTOR")) &&
                achievement.getMentor() != null &&
                userDetails.getId().equals(achievement.getMentor().getId());

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_UNIVERSITY_ADMIN"));

        if (!isAssignedMentor && !isAdmin) {
            return ResponseEntity.status(403).body(new MessageResponse("Unauthorized to deny this achievement"));
        }

        achievement.setStatus(AchievementStatus.REJECTED);
        achievementRepository.save(achievement);
        return ResponseEntity.ok(new MessageResponse("Achievement rejected successfully"));
    }

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            java.io.File directory = new java.io.File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String uniqueFileName = java.util.UUID.randomUUID().toString() + "_" + originalFileName;

            java.nio.file.Path path = java.nio.file.Paths.get(UPLOAD_DIR + uniqueFileName);
            java.nio.file.Files.copy(file.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(new MessageResponse(uniqueFileName));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Could not upload the file: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<?> getCertificateFile(@PathVariable Long id, Authentication authentication) {
        Optional<Achievement> achievementOpt = achievementRepository.findById(id);
        if (achievementOpt.isEmpty() || achievementOpt.get().getCertificateUrl() == null) {
            return ResponseEntity.status(404).body(new MessageResponse("File not found"));
        }

        Achievement achievement = achievementOpt.get();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();

        boolean isOwner = achievement.getUser().getId().equals(currentUser.getId());
        boolean isAssignedMentor = currentUser.getRole() == com.fsad.backend.entity.Role.MENTOR &&
                achievement.getMentor() != null &&
                currentUser.getUniqueId().equals(achievement.getMentor().getUniqueId());
        boolean isUniAdmin = currentUser.getRole() == com.fsad.backend.entity.Role.UNIVERSITY_ADMIN || currentUser.getRole() == com.fsad.backend.entity.Role.ADMIN;
        boolean isSuperAdmin = currentUser.getRole() == com.fsad.backend.entity.Role.SUPER_ADMIN;

        if (!isOwner && !isAssignedMentor && !isUniAdmin && !isSuperAdmin) {
            return ResponseEntity.status(403).body(new MessageResponse("Unauthorized to access this file."));
        }

        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get(UPLOAD_DIR + achievement.getCertificateUrl());
            if (!java.nio.file.Files.exists(filePath)) {
                return ResponseEntity.status(404).body(new MessageResponse("File physically missing from server"));
            }

            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(
                    filePath.toUri());

            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Error processing file download."));
        }
    }
}
