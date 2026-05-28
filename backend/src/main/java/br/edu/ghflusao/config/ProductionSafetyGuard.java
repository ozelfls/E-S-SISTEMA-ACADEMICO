package br.edu.ghflusao.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Base64;

@Component
public class ProductionSafetyGuard implements ApplicationRunner {

    private final Environment environment;
    private final boolean bootstrapDemoAdmins;
    private final String jwtSecret;
    private final String databasePassword;

    public ProductionSafetyGuard(
            Environment environment,
            @Value("${app.bootstrap-demo-admins:false}") boolean bootstrapDemoAdmins,
            @Value("${jwt.secret:}") String jwtSecret,
            @Value("${spring.datasource.password:}") String databasePassword
    ) {
        this.environment = environment;
        this.bootstrapDemoAdmins = bootstrapDemoAdmins;
        this.jwtSecret = jwtSecret;
        this.databasePassword = databasePassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean prod = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (!prod) {
            return;
        }
        boolean demoSeed = Arrays.asList(environment.getActiveProfiles()).contains("postgres-demo");
        if (demoSeed) {
            throw new IllegalStateException("Profile postgres-demo nao pode ser usado junto com prod.");
        }
        if (bootstrapDemoAdmins) {
            throw new IllegalStateException("BOOTSTRAP_DEMO_ADMINS deve ficar false em prod.");
        }
        if (isUnsafeJwtSecret()) {
            throw new IllegalStateException("JWT_SECRET de prod deve ser base64 forte com pelo menos 32 bytes.");
        }
        if (isUnsafeDatabasePassword()) {
            throw new IllegalStateException("POSTGRES_PASSWORD de prod deve ser trocado antes do deploy.");
        }
    }

    private boolean isUnsafeJwtSecret() {
        if (jwtSecret == null || jwtSecret.isBlank() || "troque_o_jwt_secret_base64".equals(jwtSecret)) {
            return true;
        }
        try {
            return Base64.getDecoder().decode(jwtSecret).length < 32;
        } catch (IllegalArgumentException ex) {
            return true;
        }
    }

    private boolean isUnsafeDatabasePassword() {
        return databasePassword == null
                || databasePassword.isBlank()
                || "troque_a_senha_do_postgres".equals(databasePassword);
    }
}
