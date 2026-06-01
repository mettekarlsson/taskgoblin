const handleRegister = async () => {
    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim().toLowerCase();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("register-message");

    try {
        await register(name, email, password);

        localStorage.setItem(
            "registrationSuccess",
            "true"
        );

        window.location.href = "/login.html";

    } catch (error) {
        message.textContent = error.message;
    }
};