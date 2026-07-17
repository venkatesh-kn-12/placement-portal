package com.placement.portal.repository;

import com.placement.portal.model.StudentCourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentCourseProgressRepository extends JpaRepository<StudentCourseProgress, Long> {
    Optional<StudentCourseProgress> findByStudentIdAndCourseId(Long studentId, String courseId);
    List<StudentCourseProgress> findByStudentId(Long studentId);
}
