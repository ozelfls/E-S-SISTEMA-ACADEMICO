package br.edu.ghflusao.bootstrap;

import br.edu.ghflusao.domain.UsuarioSistema;
import br.edu.ghflusao.enums.Perfil;
import br.edu.ghflusao.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private static final String ADMIN_LOGIN = "blankspace";
    private static final String ADMIN_SENHA = "1234";

    private final UsuarioSistemaRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (repository.findByLogin(ADMIN_LOGIN).isPresent()) {
            return;
        }
        UsuarioSistema admin = new UsuarioSistema();
        admin.setLogin(ADMIN_LOGIN);
        admin.setSenhaHash(passwordEncoder.encode(ADMIN_SENHA));
        admin.setPerfil(Perfil.ADMIN);
        admin.setAtivo(true);
        repository.save(admin);
        log.info("Usuário ADM '{}' criado com perfil ADMIN.", ADMIN_LOGIN);
    }
}
