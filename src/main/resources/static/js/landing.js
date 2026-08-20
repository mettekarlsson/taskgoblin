// Check if a login token exists
const token = localStorage.getItem("token");

// Redirect logged-in users to the home page
if (token) {
    window.location.href = "/index.html";
}