package com.example.taskgoblin.service;

import com.example.taskgoblin.model.Quote;
import com.example.taskgoblin.repository.QuoteRepository;
import org.springframework.stereotype.Service;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;

    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    public Quote getRandomQuote() {
        return quoteRepository.findRandomQuote();
    }
}