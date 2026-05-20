document.addEventListener("DOMContentLoaded", () => {
    loadRandomQuote();
});

const loadRandomQuote = () => {

    fetch("/api/quotes/random")
        .then(response => response.json())
        .then(quote => showQuote(quote))
        .catch(error =>
            console.error("Quote error:", error));
};

const showQuote = (quote) => {

    const quoteText =
        document.getElementById("quote-text");

    const quoteAuthor =
        document.getElementById("quote-author");

    quoteText.textContent =
        `"${quote.saying}"`;

    if (quote.author &&
        quote.author.trim() !== "") {

        quoteAuthor.textContent =
            `— ${quote.author}`;

        quoteAuthor.style.display = "block";

    } else {

        quoteAuthor.style.display = "none";
    }
};