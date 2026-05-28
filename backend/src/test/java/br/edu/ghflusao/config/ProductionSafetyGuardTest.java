package br.edu.ghflusao.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductionSafetyGuardTest {

    @Test
    void permiteAmbienteDemoForaDeProd() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("spring.profiles.active", "dev,postgres-demo");
        environment.setActiveProfiles("dev", "postgres-demo");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, true, "troque_o_jwt_secret_base64", "troque_a_senha_do_postgres");

        assertDoesNotThrow(() -> guard.run(null));
    }

    @Test
    void bloqueiaProfileDemoEmProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod", "postgres-demo");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, false, strongSecret(), strongPassword());

        assertThrows(IllegalStateException.class, () -> guard.run(null));
    }

    @Test
    void bloqueiaBootstrapDemoEmProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, true, strongSecret(), strongPassword());

        assertThrows(IllegalStateException.class, () -> guard.run(null));
    }

    @Test
    void bloqueiaJwtPlaceholderEmProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, false, "troque_o_jwt_secret_base64", strongPassword());

        assertThrows(IllegalStateException.class, () -> guard.run(null));
    }

    @Test
    void bloqueiaSenhaPostgresPlaceholderEmProd() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, false, strongSecret(), "troque_a_senha_do_postgres");

        assertThrows(IllegalStateException.class, () -> guard.run(null));
    }

    @Test
    void permiteProdComConfiguracaoSegura() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        ProductionSafetyGuard guard = new ProductionSafetyGuard(environment, false, strongSecret(), strongPassword());

        assertDoesNotThrow(() -> guard.run(null));
    }

    private String strongSecret() {
        return Base64.getEncoder().encodeToString("01234567890123456789012345678901".getBytes());
    }

    private String strongPassword() {
        return "senha-postgres-forte";
    }
}
