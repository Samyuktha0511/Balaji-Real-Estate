package com.balaji.realestate.controller;

import com.balaji.realestate.model.Listing;
import com.balaji.realestate.repository.ListingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppBotController {

    private final ListingRepository listingRepository;

    public WhatsAppBotController(ListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    /**
     * Verification endpoint for WhatsApp Cloud API setup
     */
    @GetMapping("/webhook")
    public String verifyWebhook(@RequestParam("hub.mode") String mode,
                                @RequestParam("hub.verify_token") String token,
                                @RequestParam("hub.challenge") String challenge) {
        // You'd check your secret token here
        return challenge;
    }

    /**
     * Receives messages from WhatsApp
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleIncomingMessage(@RequestBody Map<String, Object> payload) {
        // 1. Extract message text (Complexity depends on WhatsApp API structure)
        // 2. Simple parser logic: 
        //    If text contains "New Plot", start a state machine or parse structured text
        
        // Example of a very basic manual parsing:
        // String text = extractTextFromPayload(payload);
        // Listing listing = parseListingFromText(text);
        // listingRepository.save(listing);

        return ResponseEntity.ok().build();
    }

    // Private helper methods would go here to handle 
    // Media downloads and Text parsing
}