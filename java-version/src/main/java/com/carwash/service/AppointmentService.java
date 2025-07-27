package com.carwash.service;

import com.carwash.model.Appointment;
import com.carwash.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public List<Appointment> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByDateOrderByTime(date);
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public Appointment saveAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
    
    public List<Appointment> getAppointmentsBetweenDates(LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findAppointmentsBetweenDates(startDate, endDate);
    }
    
    public long getTodayAppointmentsCount() {
        return appointmentRepository.countActiveAppointmentsByDate(LocalDate.now());
    }
    
    public List<Appointment> getAppointmentsByStatus(LocalDate date, Appointment.AppointmentStatus status) {
        return appointmentRepository.findByDateAndStatus(date, status);
    }
}