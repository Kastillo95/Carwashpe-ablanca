package com.carwash.ui.controller;

import com.carwash.service.AppointmentService;
import com.carwash.service.CarwashService;
import com.carwash.service.CustomerService;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.*;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class MainController {
    
    @FXML private BorderPane rootPane;
    @FXML private VBox sidebarMenu;
    @FXML private Label welcomeLabel;
    @FXML private Label todayDateLabel;
    @FXML private Label todayAppointmentsLabel;
    @FXML private Label totalCustomersLabel;
    @FXML private Label activeServicesLabel;
    
    // Botones del menú
    @FXML private Button dashboardBtn;
    @FXML private Button appointmentsBtn;
    @FXML private Button customersBtn;
    @FXML private Button servicesBtn;
    @FXML private Button inventoryBtn;
    @FXML private Button invoicesBtn;
    @FXML private Button reportsBtn;
    @FXML private Button settingsBtn;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CarwashService carwashService;
    
    @FXML
    public void initialize() {
        setupUI();
        loadDashboardData();
        showDashboard(); // Mostrar dashboard por defecto
    }
    
    private void setupUI() {
        // Configurar la fecha actual
        todayDateLabel.setText(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        
        // Configurar mensaje de bienvenida
        welcomeLabel.setText("¡Bienvenido al Sistema de Gestión Carwash Peña Blanca!");
        
        // Configurar eventos de los botones
        dashboardBtn.setOnAction(e -> showDashboard());
        appointmentsBtn.setOnAction(e -> showAppointments());
        customersBtn.setOnAction(e -> showCustomers());
        servicesBtn.setOnAction(e -> showServices());
        inventoryBtn.setOnAction(e -> showInventory());
        invoicesBtn.setOnAction(e -> showInvoices());
        reportsBtn.setOnAction(e -> showReports());
        settingsBtn.setOnAction(e -> showSettings());
        
        // Resaltar el botón activo
        setActiveButton(dashboardBtn);
    }
    
    private void loadDashboardData() {
        try {
            // Cargar estadísticas del dashboard
            long todayAppointments = appointmentService.getTodayAppointmentsCount();
            long totalCustomers = customerService.getActiveCustomersCount();
            long activeServices = carwashService.getActiveServicesCount();
            
            todayAppointmentsLabel.setText(String.valueOf(todayAppointments));
            totalCustomersLabel.setText(String.valueOf(totalCustomers));
            activeServicesLabel.setText(String.valueOf(activeServices));
            
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "No se pudieron cargar las estadísticas del dashboard", Alert.AlertType.ERROR);
        }
    }
    
    @FXML
    private void showDashboard() {
        loadView("/fxml/dashboard.fxml");
        setActiveButton(dashboardBtn);
        loadDashboardData();
    }
    
    @FXML
    private void showAppointments() {
        loadView("/fxml/appointments.fxml");
        setActiveButton(appointmentsBtn);
    }
    
    @FXML
    private void showCustomers() {
        loadView("/fxml/customers.fxml");
        setActiveButton(customersBtn);
    }
    
    @FXML
    private void showServices() {
        loadView("/fxml/services.fxml");
        setActiveButton(servicesBtn);
    }
    
    @FXML
    private void showInventory() {
        loadView("/fxml/inventory.fxml");
        setActiveButton(inventoryBtn);
    }
    
    @FXML
    private void showInvoices() {
        loadView("/fxml/invoices.fxml");
        setActiveButton(invoicesBtn);
    }
    
    @FXML
    private void showReports() {
        loadView("/fxml/reports.fxml");
        setActiveButton(reportsBtn);
    }
    
    @FXML
    private void showSettings() {
        loadView("/fxml/settings.fxml");
        setActiveButton(settingsBtn);
    }
    
    private void loadView(String fxmlPath) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
            rootPane.setCenter(loader.getRoot());
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Error", "No se pudo cargar la vista: " + fxmlPath, Alert.AlertType.ERROR);
        }
    }
    
    private void setActiveButton(Button activeButton) {
        // Remover clase activa de todos los botones
        dashboardBtn.getStyleClass().remove("active");
        appointmentsBtn.getStyleClass().remove("active");
        customersBtn.getStyleClass().remove("active");
        servicesBtn.getStyleClass().remove("active");
        inventoryBtn.getStyleClass().remove("active");
        invoicesBtn.getStyleClass().remove("active");
        reportsBtn.getStyleClass().remove("active");
        settingsBtn.getStyleClass().remove("active");
        
        // Agregar clase activa al botón seleccionado
        activeButton.getStyleClass().add("active");
    }
    
    private void showAlert(String title, String message, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}