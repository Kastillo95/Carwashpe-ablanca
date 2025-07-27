package com.carwash.service;

import com.carwash.model.Service;
import com.carwash.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CarwashService {
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    public List<Service> getAllActiveServices() {
        return serviceRepository.findActiveServicesOrderByName();
    }
    
    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }
    
    public Service saveService(Service service) {
        return serviceRepository.save(service);
    }
    
    public void deleteService(Long id) {
        Optional<Service> service = serviceRepository.findById(id);
        if (service.isPresent()) {
            Service s = service.get();
            s.setActive(false);
            serviceRepository.save(s);
        }
    }
    
    public long getActiveServicesCount() {
        return serviceRepository.countActiveServices();
    }
}