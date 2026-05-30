package br.edu.ghflusao.bootstrap;

import br.edu.ghflusao.domain.UsuarioSistema;
import br.edu.ghflusao.enums.Perfil;
import br.edu.ghflusao.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private static final String ADMIN_SENHA = "1234";
    private static final String[] ADMIN_LOGINS = {"blankspace", "funnyValentine"};

    private final UsuarioSistemaRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-demo-admins:false}")
    private boolean bootstrapDemoAdmins;

    @Value("${app.initial-admin.enabled:false}")
    private boolean initialAdminEnabled;

    @Value("${app.initial-admin.login:}")
    private String initialAdminLogin;

    @Value("${app.initial-admin.password:}")
    private String initialAdminPassword;

    @Override
    public void run(String... args) {
        if (initialAdminEnabled) {
            upsertAdmin(initialAdminLogin, initialAdminPassword, "inicial");
        }

        if (!bootstrapDemoAdmins) {
            log.info("Bootstrap de administradores demo desativado.");
            return;
        }
        for (String login : ADMIN_LOGINS) {
            upsertAdmin(login, ADMIN_SENHA, "demo");
        }
    }

    private void upsertAdmin(String login, String senha, String origem) {
        if (login == null || login.isBlank()) {
            throw new IllegalStateException("Login do administrador " + origem + " nao pode ficar vazio.");
        }
        if (senha == null || senha.isBlank()) {
            throw new IllegalStateException("Senha do administrador " + origem + " nao pode ficar vazia.");
        }

        String normalizedLogin = login.trim();
        UsuarioSistema admin = repository.findByLogin(normalizedLogin).orElseGet(() -> {
            UsuarioSistema novoAdmin = new UsuarioSistema();
            novoAdmin.setLogin(normalizedLogin);
            return novoAdmin;
        });

        boolean novo = admin.getId() == null;
        boolean alterado = novo;

        if (admin.getPerfil() != Perfil.ADMIN) {
            admin.setPerfil(Perfil.ADMIN);
            alterado = true;
        }
        if (!admin.isAtivo()) {
            admin.setAtivo(true);
            alterado = true;
        }
        if (admin.getSenhaHash() == null || !passwordEncoder.matches(senha, admin.getSenhaHash())) {
            admin.setSenhaHash(passwordEncoder.encode(senha));
            alterado = true;
        }

        if (alterado) {
            repository.save(admin);
            log.info("Usuario ADM {} '{}' com perfil ADMIN.", novo ? "criado" : "atualizado", normalizedLogin);
        }
    }
}
