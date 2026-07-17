package com.placement.portal.repository;

import com.placement.portal.model.CompanyRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyRequirementRepository extends JpaRepository<CompanyRequirement, Long> {
    List<CompanyRequirement> findByCompanyId(Long companyId);
}