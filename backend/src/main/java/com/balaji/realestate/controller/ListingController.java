package com.balaji.realestate.controller;

import com.balaji.realestate.model.Listing;
import com.balaji.realestate.repository.ListingRepository;
import com.balaji.realestate.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    private final ListingRepository listingRepository;
    private final FileStorageService storageService;

    public ListingController(ListingRepository listingRepository, FileStorageService storageService) {
        this.listingRepository = listingRepository;
        this.storageService = storageService;
    }

    @GetMapping
    public List<Listing> all() {
        return listingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> get(@PathVariable Long id) {
        Optional<Listing> l = listingRepository.findById(id);
        return l.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Listing> create(@RequestBody Listing listing) {
        Listing saved = listingRepository.save(listing);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping(path = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhotos(@PathVariable Long id, @RequestPart("files") MultipartFile[] files) throws IOException {
        Optional<Listing> l = listingRepository.findById(id);
        if (l.isEmpty()) return ResponseEntity.notFound().build();
        List<String> saved = storageService.storeFiles(files);
        Listing listing = l.get();
        listing.getPhotos().addAll(saved);
        listingRepository.save(listing);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/media/{filename}")
    public ResponseEntity<byte[]> serveMedia(@PathVariable String filename) throws IOException {
        File f = storageService.loadFile(filename);
        if (!f.exists()) return ResponseEntity.notFound().build();
        byte[] bytes = Files.readAllBytes(f.toPath());
        HttpHeaders headers = new HttpHeaders();
        String ct = Files.probeContentType(f.toPath());
        headers.setContentType(MediaType.parseMediaType(ct == null ? "application/octet-stream" : ct));
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
