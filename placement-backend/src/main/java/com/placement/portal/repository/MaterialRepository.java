package com.placement.portal.repository;

import com.placement.portal.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourseId(String courseId);
    List<Material> findByCompanyId(Long companyId);
}
