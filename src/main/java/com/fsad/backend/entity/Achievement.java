package com.fsad.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "achievements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String category; // e.g., Academic, Sports, Extracurricular

    private LocalDate dateAchieved;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AchievementStatus status;

    private String certificateUrl; // Link to uploaded certificate or proof

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password" })
    private User user; // The student who claimed the achievement

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_user_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler", "password",
            "university" })
    private User mentor; // The mentor this is shared with, if any
}
