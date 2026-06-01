const login = async (email, password) => {

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    if (!response.ok) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const token =
        await response.text();

    localStorage.setItem(
        "token",
        token
    );

};

const register = async (name, email, password) => {
    const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    if (!response.ok) {
        throw new Error("Could not create account");
    }
};

const openLogoutModal = () => {

    document
        .getElementById("logout-modal")
        .classList.add("open");

};

const closeLogoutModal = () => {

    document
        .getElementById("logout-modal")
        .classList.remove("open");

};

const logout = () => {

    localStorage.removeItem("token");

    window.location.href =
        "/login.html";

};

const apiFetch = async (url, options = {}) => {

    const token =
        localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",

            ...(token && {
                Authorization: `Bearer ${token}`
            }),

            ...options.headers
        }
    });

    if (
        response.status === 401
        ||
        response.status === 403
    ) {

        localStorage.removeItem("token");

        window.location.href =
            "/login.html";

        return;
    }

    return response;

};