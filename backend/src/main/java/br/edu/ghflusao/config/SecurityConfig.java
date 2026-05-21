package br.edu.ghflusao.config;

import br.edu.ghflusao.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'"))
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                        .contentTypeOptions(Customizer.withDefaults())
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/actuator/health").permitAll()
                        .requestMatchers("/alunos/**").hasAnyRole("SECRETARIA", "ALUNO", "COORDENADOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/turmas/**").hasAnyRole("ALUNO", "PROFESSOR", "COORDENADOR", "SECRETARIA", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/disciplinas/*/turmas").hasAnyRole("COORDENADOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/disciplinas/**").hasAnyRole("ALUNO", "PROFESSOR", "COORDENADOR", "SECRETARIA", "DIRETOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/professores/**").hasAnyRole("COORDENADOR", "DIRETOR", "SECRETARIA", "ADMIN")
                        .requestMatchers("/cursos/**").hasAnyRole("DIRETOR", "COORDENADOR", "SECRETARIA", "PROFESSOR", "ALUNO", "ADMIN")
                        .requestMatchers("/provas/**").hasAnyRole("PROFESSOR", "COORDENADOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/resultados/**").hasAnyRole("PROFESSOR", "COORDENADOR", "DIRETOR", "ADMIN")
                        .requestMatchers("/resultados/**").hasAnyRole("PROFESSOR", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(corsConfig.asList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authManager(org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
