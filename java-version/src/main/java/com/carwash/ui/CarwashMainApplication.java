package com.carwash.ui;

import com.carwash.CarwashApplication;
import com.carwash.ui.controller.MainController;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;

public class CarwashMainApplication extends Application {
    
    private ConfigurableApplicationContext springContext;
    
    @Override
    public void init() throws Exception {
        // Obtener el contexto de Spring Boot
        springContext = CarwashApplication.getSpringContext();
    }
    
    @Override
    public void start(Stage primaryStage) throws IOException {
        try {
            // Configurar el stage principal
            primaryStage.setTitle("Carwash Peña Blanca - Sistema de Gestión");
            primaryStage.setMinWidth(1200);
            primaryStage.setMinHeight(800);
            
            // Cargar el icono
            try {
                Image icon = new Image(getClass().getResourceAsStream("/icons/carwash-icon.png"));
                primaryStage.getIcons().add(icon);
            } catch (Exception e) {
                System.out.println("No se pudo cargar el icono de la aplicación");
            }
            
            // Cargar la vista principal
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/fxml/main.fxml"));
            
            // Configurar el controlador con Spring
            loader.setControllerFactory(springContext::getBean);
            
            Scene scene = new Scene(loader.getRoot());
            
            // Cargar el CSS
            try {
                String css = getClass().getResource("/css/styles.css").toExternalForm();
                scene.getStylesheets().add(css);
            } catch (Exception e) {
                System.out.println("No se pudo cargar el archivo CSS");
            }
            
            primaryStage.setScene(scene);
            primaryStage.show();
            
            // Configurar el cierre de la aplicación
            primaryStage.setOnCloseRequest(event -> {
                System.exit(0);
            });
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error iniciando la aplicación JavaFX: " + e.getMessage());
        }
    }
    
    @Override
    public void stop() throws Exception {
        // Cerrar el contexto de Spring
        if (springContext != null) {
            springContext.close();
        }
    }
}