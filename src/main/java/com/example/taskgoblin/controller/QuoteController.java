package com.example.taskgoblin.controller;

import com.example.taskgoblin.model.Quote;
import com.example.taskgoblin.service.QuoteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
// Marks this class as a REST controller.
// Spring automatically converts returned objects into JSON.

@RequestMapping("/api/quotes")
// Base URL for all endpoints in this controller.

public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping("/random")
    // Handles GET requests to:
    // /api/quotes/random
    public Quote getRandomQuote() {
        // Calls the service layer to fetch a random quote
        // from the database and returns it as JSON.
        return quoteService.getRandomQuote();
    }
}