package com.placement.portal.repository;

import com.placement.portal.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByCourseId(String courseId);
    List<QuizQuestion> findBySkillId(Long skillId);
    java.util.Optional<QuizQuestion> findByQuestion(String question);
}
