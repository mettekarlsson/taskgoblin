// Wait until the entire HTML page has loaded
// before running any JavaScript.
document.addEventListener("DOMContentLoaded", () => {
    // Start loading a random quote from the backend.
    loadRandomQuote();
});

// Function that fetches a random quote
// from the Spring Boot backend.
const loadRandomQuote = () => {
    // Send a GET request to:
    // http://localhost:8080/api/quotes/random
    fetch("/api/quotes/random")
        // The backend response arrives as JSON.
        // response.json() converts the JSON into
        // a JavaScript object we can use.
        .then(response => response.json())
        // When the quote object is ready,
        // send it to the showQuote() function.
        .then(quote => showQuote(quote))
        // If something goes wrong,
        // print the error in the console.
        .catch(error =>
            console.error("Quote error:", error));
};

// Function that displays the quote on the page.
const showQuote = (quote) => {

    // Find the HTML element with:
    // id="quote-text"
    const quoteText =
        document.getElementById("quote-text");
    // Find the HTML element with:
    // id="quote-author"
    const quoteAuthor =
        document.getElementById("quote-author");
    // Insert the quote text into the page.
    quoteText.textContent =
        `"${quote.saying}"`;
    // Check if the quote has an author.
    // Some quotes have author = null.
    if (quote.author &&
        quote.author.trim() !== "") {
        // Display the author name.
        quoteAuthor.textContent =
            `— ${quote.author}`;
        // Make sure the author element is visible.
        quoteAuthor.style.display = "block";

    } else {
        // Hide the author element completely
        // if there is no author.
        quoteAuthor.style.display = "none";
    }
};