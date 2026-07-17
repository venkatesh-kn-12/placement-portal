package com.placement.portal.repository;

import com.placement.portal.model.SkillEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SkillEvidenceRepository extends JpaRepository<SkillEvidence, Long> {
    List<SkillEvidence> findByStudentIdAndSkillIdAndCreatedAtAfter(Long studentId, Long skillId, LocalDateTime since);
    List<SkillEvidence> findByStudentId(Long studentId);
    List<SkillEvidence> findByDerivedRatingIsNull();
}