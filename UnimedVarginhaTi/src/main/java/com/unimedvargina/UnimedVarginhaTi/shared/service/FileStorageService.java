package com.unimedvargina.UnimedVarginhaTi.shared.service;

import com.unimedvargina.UnimedVarginhaTi.shared.exception.BusinessRuleException;
import com.unimedvargina.UnimedVarginhaTi.shared.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.YearMonth;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    public String storeFile(MultipartFile file, String moduleFolder) {

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = StringUtils.getFilenameExtension(originalFilename);

        if (originalFilename.contains("..")) {
            throw new RuntimeException("Security: the name file has path invalid: " + originalFilename);
        }

        String safeFileName = UUID.randomUUID().toString() + (extension != null ? "." + extension : "");

        YearMonth currentYearMonth = YearMonth.now();
        String yearMonthPath = currentYearMonth.getYear() + "/" + String.format("%02d", currentYearMonth.getMonthValue());
        String partitionFolder = moduleFolder + "/" + yearMonthPath;

        try {
            Path targetFolder = this.fileStorageLocation.resolve(partitionFolder);

            Files.createDirectories(targetFolder);

            Path targetLocation = targetFolder.resolve(safeFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/" + partitionFolder + "/" + safeFileName;

        } catch (IOException ex) {
            throw new RuntimeException("Error save the file " + safeFileName + " in server.", ex);
        }
    }

    /**
     * Abre um arquivo dentro da pasta de uploads.
     *
     * <p>O caminho e normalizado e conferido contra a raiz: um "../" no parametro
     * nao alcanca nada fora dali. Antes essa recusa virava 500, como se fosse falha
     * do servidor -- agora sai como erro do pedido, que e o que ela e.
     */
    public Resource loadFileAsResource(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new BusinessRuleException("Informe o caminho do arquivo.");
        }

        String caminho = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        Path filePath = this.fileStorageLocation.resolve(caminho).normalize();

        if (!filePath.startsWith(this.fileStorageLocation)) {
            throw new BusinessRuleException("Caminho de arquivo inválido.");
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
        } catch (java.net.MalformedURLException e) {
            throw new BusinessRuleException("Caminho de arquivo inválido.");
        }

        throw new ResourceNotFoundException("Arquivo não encontrado: " + caminho);
    }
}
