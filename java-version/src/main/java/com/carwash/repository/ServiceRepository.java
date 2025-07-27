package com.carwash.repository;

import com.carwash.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByActiveTrue();
    
    @Query("SELECT s FROM Service s WHERE s.active = true ORDER BY s.name")
    List<Service> findActiveServicesOrderByName();
    
    @Query("SELECT COUNT(s) FROM Service s WHERE s.active = true")
    long countActiveServices();
}