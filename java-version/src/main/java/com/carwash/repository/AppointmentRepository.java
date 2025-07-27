package com.carwash.repository;

import com.carwash.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByDate(LocalDate date);
    
    List<Appointment> findByDateOrderByTime(LocalDate date);
    
    @Query("SELECT a FROM Appointment a WHERE a.date = :date AND a.status = :status")
    List<Appointment> findByDateAndStatus(@Param("date") LocalDate date, 
                                         @Param("status") Appointment.AppointmentStatus status);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.date = :date")
    long countAppointmentsByDate(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Appointment a WHERE a.date BETWEEN :startDate AND :endDate ORDER BY a.date, a.time")
    List<Appointment> findAppointmentsBetweenDates(@Param("startDate") LocalDate startDate, 
                                                  @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.date = :date AND a.status != 'CANCELLED'")
    long countActiveAppointmentsByDate(@Param("date") LocalDate date);
}