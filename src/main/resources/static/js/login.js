const handleLogin = async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const errorElement =
        document.getElementById("login-message");

    try {

        await login(email, password);

        window.location.href = "/index.html";

    } catch (error) {

        errorElement.textContent =
            error.message;

    }

};

document
    .getElementById("login-form")
    .addEventListener("submit", handleLogin);

const successMessage =
    document.getElementById("login-message");

if (
    localStorage.getItem("registrationSuccess")
) {

    successMessage.textContent =
        "Account created successfully. You can now log in.";

    successMessage.classList.add("success");

    localStorage.removeItem(
        "registrationSuccess"
    );
}

if (
    localStorage.getItem("accountDeleted")
) {

    successMessage.textContent =
        "Your account has been deleted.";

    successMessage.classList.add("success");

    localStorage.removeItem(
        "accountDeleted"
    );
}