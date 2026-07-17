package com.placement.portal.repository;

import com.placement.portal.model.StudentCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentCertificateRepository extends JpaRepository<StudentCertificate, Long> {
    List<StudentCertificate> findByStudentId(Long studentId);
    List<StudentCertificate> findByStatus(String status);
}
