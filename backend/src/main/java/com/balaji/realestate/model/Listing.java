package com.balaji.realestate.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String address;
    private BigDecimal price;
    private String area; // measurements

    @Column(length = 2000)
    private String description;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private String status;

    private Instant createdAt = Instant.now();

    @ElementCollection
    @CollectionTable(name = "listing_photos", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "photo")
    private List<String> photos = new ArrayList<>();


    @ElementCollection
    @CollectionTable(name = "listing_docs", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "doc")
    private List<String> documents = new ArrayList<>();
}
