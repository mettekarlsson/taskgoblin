const handleRegister = async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirm-password").value;

    // Check that the password and confirmation match.
    if (password !== confirmPassword) {

        document.getElementById("confirm-password-error").textContent =
            "Passwords do not match";

        return;
    }

    // Clear previous error messages before a new submission.
    document.getElementById("name-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("password-error").textContent = "";

    try {

        await register(name, email, password);

        localStorage.setItem(
            "registrationSuccess",
            "true"
        );

        window.location.href = "/login.html";

    } catch (error) {

        const errors = error.message.split(", ");

        errors.forEach(errorMessage => {

            const [field, message] =
                errorMessage.split(": ");

            const errorElement =
                document.getElementById(`${field}-error`);

            if (errorElement) {
                errorElement.textContent = message;
            }
        });
    }
};

document
    .getElementById("register-form")
    .addEventListener("submit", handleRegister);