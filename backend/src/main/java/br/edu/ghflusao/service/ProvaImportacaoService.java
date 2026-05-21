package br.edu.ghflusao.service;

import br.edu.ghflusao.dto.response.ProvaImportacaoDTO;
import br.edu.ghflusao.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
public class ProvaImportacaoService {

    private static final Pattern QUESTAO_INICIO = Pattern.compile("^(\\d+[\\).:-]|quest[aã]o\\s+\\d+[:.-]?).*", Pattern.CASE_INSENSITIVE);
    private static final Pattern ALTERNATIVA = Pattern.compile("^[A-E][\\).:-]\\s+.*", Pattern.CASE_INSENSITIVE);

    public ProvaImportacaoDTO importar(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BusinessException("Envie um arquivo de prova.");
        }
        String nome = arquivo.getOriginalFilename() == null ? "prova" : arquivo.getOriginalFilename();
        String texto = extrairTexto(arquivo, nome);
        List<ProvaImportacaoDTO.QuestaoImportada> questoes = parseQuestoes(texto);
        if (questoes.isEmpty()) {
            throw new BusinessException("Nao consegui identificar questoes no arquivo. Use questoes numeradas, como 1., 2., 3.");
        }
        return new ProvaImportacaoDTO(limparExtensao(nome), "", questoes);
    }

    private String extrairTexto(MultipartFile arquivo, String nome) {
        try {
            byte[] bytes = arquivo.getBytes();
            String lower = nome.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".docx")) {
                return extrairDocx(bytes);
            }
            if (lower.endsWith(".pdf")) {
                return extrairPdfSimples(bytes);
            }
            if (lower.endsWith(".doc")) {
                String texto = textoImprimivel(bytes);
                if (texto.length() < 40) {
                    throw new BusinessException("Arquivo .doc antigo nao teve texto legivel. Exporte para PDF/DOCX ou cole o texto da prova.");
                }
                return texto;
            }
            return new String(bytes, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new BusinessException("Nao foi possivel ler o arquivo enviado.");
        }
    }

    private String extrairDocx(byte[] bytes) throws IOException {
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    String xml = new String(zip.readAllBytes(), StandardCharsets.UTF_8);
                    return xml
                            .replaceAll("<w:tab\\s*/>", " ")
                            .replaceAll("</w:p>", "\n")
                            .replaceAll("<[^>]+>", "")
                            .replace("&amp;", "&")
                            .replace("&lt;", "<")
                            .replace("&gt;", ">")
                            .replace("&quot;", "\"")
                            .replace("&apos;", "'")
                            .trim();
                }
            }
        }
        throw new BusinessException("Nao encontrei texto no arquivo Word enviado.");
    }

    private String extrairPdfSimples(byte[] bytes) {
        String texto = textoImprimivel(bytes);
        texto = texto.replace("\\n", "\n").replace("\\r", "\n");
        texto = texto.replaceAll("\\s{3,}", "\n");
        if (texto.length() < 40) {
            throw new BusinessException("Nao consegui extrair texto deste PDF. Envie um PDF com texto selecionavel ou cole o texto da prova.");
        }
        return texto;
    }

    private String textoImprimivel(byte[] bytes) {
        String raw = new String(bytes, StandardCharsets.ISO_8859_1);
        return raw
                .replaceAll("[^\\x09\\x0A\\x0D\\x20-\\x7EÀ-ÿ]", " ")
                .replaceAll("\\s{3,}", "\n")
                .trim();
    }

    private List<ProvaImportacaoDTO.QuestaoImportada> parseQuestoes(String texto) {
        String[] linhas = texto.replace("\r", "").split("\n");
        List<List<String>> blocos = new ArrayList<>();
        List<String> atual = new ArrayList<>();

        for (String linhaOriginal : linhas) {
            String linha = linhaOriginal.trim();
            if (linha.isBlank()) {
                continue;
            }
            if (QUESTAO_INICIO.matcher(linha).matches() && !atual.isEmpty()) {
                blocos.add(atual);
                atual = new ArrayList<>();
            }
            atual.add(linha);
        }
        if (!atual.isEmpty()) {
            blocos.add(atual);
        }

        List<ProvaImportacaoDTO.QuestaoImportada> questoes = new ArrayList<>();
        for (int i = 0; i < blocos.size(); i++) {
            List<String> bloco = blocos.get(i);
            String primeira = bloco.get(0)
                    .replaceFirst("(?i)^(\\d+[\\).:-]\\s*|quest[aã]o\\s+\\d+[:.-]?\\s*)", "")
                    .trim();
            List<String> alternativas = bloco.stream()
                    .filter(linha -> ALTERNATIVA.matcher(linha).matches())
                    .map(linha -> linha.replaceFirst("(?i)^[A-E][\\).:-]\\s+", "").trim())
                    .toList();
            String resposta = bloco.stream()
                    .filter(linha -> linha.toLowerCase(Locale.ROOT).matches("^(resposta|gabarito)[:.-].*"))
                    .findFirst()
                    .map(linha -> linha.replaceFirst("(?i)^(resposta|gabarito)[:.-]\\s*", "").trim())
                    .orElse("");
            String tipo = alternativas.isEmpty() ? "Discursiva" : "Objetiva";
            String enunciado = primeira.isBlank() ? "Questao " + (i + 1) : primeira;
            questoes.add(new ProvaImportacaoDTO.QuestaoImportada(tipo, enunciado, 1.0, alternativas, resposta));
        }
        return questoes;
    }

    private String limparExtensao(String nome) {
        return nome.replaceFirst("\\.[^.]+$", "");
    }
}
