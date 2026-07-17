package com.placement.portal.repository;

import com.placement.portal.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findAllByVisitDateAfter(LocalDate date);
}