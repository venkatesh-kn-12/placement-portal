package com.placement.portal.repository;

import com.placement.portal.model.StudentProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentProjectRepository extends JpaRepository<StudentProject, Long> {
    List<StudentProject> findByStudentId(Long studentId);
    List<StudentProject> findByRatingIsNull();
}
