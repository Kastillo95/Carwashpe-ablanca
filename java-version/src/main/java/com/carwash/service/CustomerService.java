package com.carwash.service;

import com.carwash.model.Customer;
import com.carwash.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class CustomerService {
    
    @Autowired
    private CustomerRepository customerRepository;
    
    public List<Customer> getAllActiveCustomers() {
        return customerRepository.findByActiveTrue();
    }
    
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }
    
    public Optional<Customer> getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone);
    }
    
    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
    
    public List<Customer> searchCustomers(String query) {
        return customerRepository.searchCustomers(query);
    }
    
    public List<Customer> getTopCustomers() {
        return customerRepository.findTopCustomersBySpending();
    }
    
    public void updateCustomerSpent(Long customerId, BigDecimal amount) {
        Optional<Customer> customerOpt = customerRepository.findById(customerId);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            customer.setTotalSpent(customer.getTotalSpent().add(amount));
            customer.setLastVisit(LocalDateTime.now());
            customerRepository.save(customer);
        }
    }
    
    public long getActiveCustomersCount() {
        return customerRepository.countActiveCustomers();
    }
}