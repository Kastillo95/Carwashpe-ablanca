package com.carwash.repository;

import com.carwash.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByPhone(String phone);
    
    List<Customer> findByActiveTrue();
    
    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "c.phone LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("query") String query);
    
    @Query("SELECT c FROM Customer c WHERE c.active = true ORDER BY c.totalSpent DESC")
    List<Customer> findTopCustomersBySpending();
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.active = true")
    long countActiveCustomers();
}