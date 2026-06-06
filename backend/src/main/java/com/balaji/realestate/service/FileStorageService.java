package com.balaji.realestate.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(@Value("${file.upload-dir:uploads}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir);
        if (!Files.exists(this.uploadDir)) {
            Files.createDirectories(this.uploadDir);
        }
    }

    public List<String> storeFiles(MultipartFile[] files) throws IOException {
        List<String> saved = new ArrayList<>();
        if (files == null) return saved;
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String name = UUID.randomUUID().toString() + ext;
            Path target = uploadDir.resolve(name);
            file.transferTo(target.toFile());
            saved.add(name);
        }
        return saved;
    }

    public File loadFile(String filename) {
        return uploadDir.resolve(filename).toFile();
    }
}
