package br.edu.ghflusao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class GhflusaoApplication {

    public static void main(String[] args) {
        SpringApplication.run(GhflusaoApplication.class, args);
    }
}
