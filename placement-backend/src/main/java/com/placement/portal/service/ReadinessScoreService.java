package com.placement.portal.service;

import com.placement.portal.model.*;
import com.placement.portal.repository.*;
import java.time.LocalDateTime;
import com.placement.portal.model.CompanyRequirement;
import com.placement.portal.model.SkillEvidence;
import com.placement.portal.repository.CompanyRequirementRepository;
import com.placement.portal.repository.SkillEvidenceRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReadinessScoreService {

    private final SkillEvidenceRepository evidenceRepo;
    private final CompanyRequirementRepository requirementRepo;

    public ReadinessScoreService(SkillEvidenceRepository evidenceRepo,
                                 CompanyRequirementRepository requirementRepo) {
        this.evidenceRepo = evidenceRepo;
        this.requirementRepo = requirementRepo;
    }

    // Get current rating for a student and skill (avg last 90 days)
    public Double getCurrentSkillRating(Long studentId, Long skillId) {
        List<SkillEvidence> evidences = evidenceRepo.findByStudentIdAndSkillIdAndCreatedAtAfter(
                studentId, skillId, LocalDateTime.now().minusDays(90));
        if (evidences.isEmpty()) return 0.0;
        return evidences.stream()
                .filter(e -> e.getDerivedRating() != null)
                .mapToDouble(SkillEvidence::getDerivedRating)
                .average()
                .orElse(0.0);
    }

    // Compute company match % for a student
    public double computeCompanyMatch(Long studentId, Long companyId) {
        List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(companyId);
        double totalWeight = 0;
        double weightedScore = 0;
        for (CompanyRequirement req : requirements) {
            double studentRating = getCurrentSkillRating(studentId, req.getSkill().getId());
            double ratio = Math.min(studentRating / req.getMinRating(), 1.0);
            weightedScore += ratio * req.getWeightage();
            totalWeight += req.getWeightage();
        }
        if (totalWeight == 0) return 0;
        return (weightedScore / totalWeight) * 100;
    }

    // Get detailed gaps
    public List<SkillGap> getSkillGaps(Long studentId, Long companyId) {
        List<CompanyRequirement> requirements = requirementRepo.findByCompanyId(companyId);
        List<SkillGap> gaps = new ArrayList<>();
        for (CompanyRequirement req : requirements) {
            double current = getCurrentSkillRating(studentId, req.getSkill().getId());
            if (current < req.getMinRating()) {
                gaps.add(new SkillGap(req.getSkill().getName(), current, req.getMinRating()));
            }
        }
        return gaps;
    }
    public static class SkillGap {
    private String skillName;
    private Double currentRating;
    private Double requiredRating;
    public SkillGap(String skillName, Double currentRating, Double requiredRating) {
        this.skillName = skillName;
        this.currentRating = currentRating;
        this.requiredRating = requiredRating;
    }
    // getters
    public String getSkillName() { return skillName; }
    public Double getCurrentRating() { return currentRating; }
    public Double getRequiredRating() { return requiredRating; }
}
}