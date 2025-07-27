package com.carwash;

import com.carwash.ui.CarwashMainApplication;
import javafx.application.Application;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

@SpringBootApplication
public class CarwashApplication {
    
    private static ConfigurableApplicationContext springContext;
    
    public static void main(String[] args) {
        // Configurar propiedades del sistema para JavaFX
        System.setProperty("javafx.platform", "desktop");
        System.setProperty("prism.lcdtext", "false");
        System.setProperty("prism.text", "t2k");
        
        // Iniciar Spring Boot en un hilo separado
        Thread springBootThread = new Thread(() -> {
            springContext = SpringApplication.run(CarwashApplication.class, args);
        });
        springBootThread.setDaemon(true);
        springBootThread.start();
        
        // Esperar a que Spring Boot se inicie
        try {
            Thread.sleep(3000); // Dar tiempo para que Spring Boot se inicie
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Iniciar la aplicación JavaFX
        Application.launch(CarwashMainApplication.class, args);
    }
    
    public static ConfigurableApplicationContext getSpringContext() {
        return springContext;
    }
}