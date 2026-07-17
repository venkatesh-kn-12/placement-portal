package com.placement.portal.repository;

import com.placement.portal.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, String> {
    List<Lesson> findByCourseId(String courseId);
}
