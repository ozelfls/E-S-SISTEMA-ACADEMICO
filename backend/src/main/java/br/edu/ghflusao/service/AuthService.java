package br.edu.ghflusao.service;

import br.edu.ghflusao.domain.UsuarioSistema;
import br.edu.ghflusao.dto.request.LoginRequestDTO;
import br.edu.ghflusao.dto.response.LoginResponseDTO;
import br.edu.ghflusao.exception.BusinessException;
import br.edu.ghflusao.repository.UsuarioSistemaRepository;
import br.edu.ghflusao.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO request) {
        UsuarioSistema user = usuarioSistemaRepository.findByLogin(request.login())
                .orElseThrow(() -> new BusinessException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.senha(), user.getSenhaHash())) {
            throw new BusinessException("Credenciais inválidas.");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponseDTO(token, user.getPerfil(), user.getPessoaId(), user.getLogin());
    }
}
