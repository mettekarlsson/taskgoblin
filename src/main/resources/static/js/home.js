async function getRandomQuote() {
    const response = await apiFetch("/api/quotes/random");

    if (!response.ok) {
        throw new Error("Failed to load quote");
    }

    return response.json();
}

const loadRandomQuote = async () => {
    try {
        const quote = await getRandomQuote();
        showQuote(quote);
    } catch (error) {
        console.error("Quote error:", error);
    }
};

const showQuote = (quote) => {
    const quoteText = document.getElementById("quote-text");
    const quoteAuthor = document.getElementById("quote-author");

    quoteText.textContent = `"${quote.saying}"`;

    if (quote.author && quote.author.trim() !== "") {
        quoteAuthor.textContent = `— ${quote.author}`;
        quoteAuthor.style.display = "block";
    } else {
        quoteAuthor.style.display = "none";
    }
};

loadRandomQuote();