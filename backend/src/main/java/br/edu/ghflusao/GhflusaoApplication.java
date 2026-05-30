package br.edu.ghflusao;

import java.net.URI;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class GhflusaoApplication {

    public static void main(String[] args) {
        configureJdbcUrlFromRenderDatabaseUrl();
        SpringApplication.run(GhflusaoApplication.class, args);
    }

    static void configureJdbcUrlFromRenderDatabaseUrl() {
        if (hasText(System.getenv("POSTGRES_JDBC_URL")) || hasText(System.getProperty("POSTGRES_JDBC_URL"))) {
            return;
        }

        String databaseUrl = System.getenv("DATABASE_URL");
        if (!hasText(databaseUrl)) {
            return;
        }

        System.setProperty("POSTGRES_JDBC_URL", toJdbcPostgresUrl(databaseUrl));
    }

    static String toJdbcPostgresUrl(String databaseUrl) {
        URI uri = URI.create(databaseUrl);
        String scheme = uri.getScheme();
        if (!"postgresql".equalsIgnoreCase(scheme) && !"postgres".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("DATABASE_URL deve usar esquema postgresql:// ou postgres://.");
        }

        String host = uri.getHost();
        if (!hasText(host)) {
            throw new IllegalArgumentException("DATABASE_URL nao contem host valido.");
        }

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
        if (host.contains(":") && !host.startsWith("[")) {
            jdbcUrl.append('[').append(host).append(']');
        } else {
            jdbcUrl.append(host);
        }
        if (uri.getPort() > 0) {
            jdbcUrl.append(':').append(uri.getPort());
        }
        jdbcUrl.append(hasText(uri.getRawPath()) ? uri.getRawPath() : "/");
        if (hasText(uri.getRawQuery())) {
            jdbcUrl.append('?').append(uri.getRawQuery());
        }

        return jdbcUrl.toString();
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
