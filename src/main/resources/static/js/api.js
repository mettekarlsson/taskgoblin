async function getRandomQuote() {
    const response = await fetch("/api/quotes/random");

    if (!response.ok) {
        throw new Error("Failed to load quote");
    }

    return response.json();
}