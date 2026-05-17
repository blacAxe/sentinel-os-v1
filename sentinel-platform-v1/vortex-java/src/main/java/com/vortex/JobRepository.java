package com.vortex;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepository extends JpaRepository<VortexJob, Long> {

    List<VortexJob> findByResult(String result);

    List<VortexJob> findBySeverity(String severity);

    List<VortexJob> findByStatus(String status);
}