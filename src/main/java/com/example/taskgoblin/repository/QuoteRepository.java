package com.example.taskgoblin.repository;

import com.example.taskgoblin.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    @Query(value = "SELECT * FROM quotes ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Quote findRandomQuote();
}

// Native SQL is used here instead of JPQL because
// ORDER BY RAND() and LIMIT are MySQL-specific syntax
// that are not directly supported in JPQL.