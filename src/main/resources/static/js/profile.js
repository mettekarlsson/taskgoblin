const profileContent = document.getElementById("profile-content");

let currentProfile = null;

// Loads the profile from the backend when the page opens.
const loadProfile = async () => {
    try {
        const response = await apiFetch("/user/profile");

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        currentProfile = await response.json();

        renderProfileView();

    } catch (error) {
        profileContent.innerHTML = `
            <p class="profile-error">${error.message}</p>
        `;
    }
};

// Shows the normal profile view.
const renderProfileView = () => {
    profileContent.innerHTML = `
        <div class="profile-card">

            <div class="profile-row">
                <div>
                    <span class="profile-label">${t("name")}:</span>
                    <span class="profile-value">${currentProfile.name}</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditName()">
                    ${t("edit")}
                </button>
            </div>

            <div class="profile-row">
                <div>
                    <span class="profile-label">${t("email")}:</span>
                    <span class="profile-value">${currentProfile.email}</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditEmail()">
                    ${t("edit")}
                </button>
            </div>

            <div class="profile-row">
                <div>
                    <span class="profile-label">${t("password")}:</span>
                    <span class="profile-value">*******</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditPassword()">
                    ${t("edit")}
                </button>
            </div>

        </div>
    `;
};

// Shows an error message inside the edit card instead of using a popup.
const showProfileMessage = (message, type = "error") => {
    const messageElement = document.getElementById("profile-message");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className = `profile-message profile-message-${type}`;
};

// Renders the edit form for name.
const renderEditName = () => {
    profileContent.innerHTML = `
        <div class="profile-card">
            <label class="profile-label" for="name">${t("name")}:</label>

            <input
                id="name"
                class="profile-input"
                type="text"
                value="${currentProfile.name}"
            >

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updateName()">${t("save")}</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">${t("cancel")}</button>
            </div>
        </div>
    `;
};

// Renders the edit form for email.
// type="text" is used instead of type="email" to avoid the browser's default popup.
const renderEditEmail = () => {
    profileContent.innerHTML = `
        <div class="profile-card">
            <label class="profile-label" for="email">${t("email")}:</label>

            <input
                id="email"
                class="profile-input"
                type="text"
                value="${currentProfile.email}"
            >

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updateEmail()">${t("save")}</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">${t("cancel")}</button>
            </div>
        </div>
    `;
};

// Renders the edit form for password.
const renderEditPassword = () => {
    profileContent.innerHTML = `
        <div class="profile-card">
            <label class="profile-label" for="current-password">${t("currentPassword")}:</label>
            <input id="current-password" class="profile-input" type="password">

            <label class="profile-label" for="new-password">${t("newPassword")}:</label>
            <input id="new-password" class="profile-input" type="password">

            <label class="profile-label" for="confirm-new-password">${t("confirmPassword")}:</label>
            <input id="confirm-new-password" class="profile-input" type="password">

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updatePassword()">${t("save")}</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">${t("cancel")}</button>
            </div>
        </div>
    `;
};

// Simple frontend validation for full name.
// Backend validation still exists and protects the real data.
const isValidFullName = (name) => {
    const fullNameRegex = /^[\p{L}]+(?: [\p{L}]+)+$/u;
    return fullNameRegex.test(name);
};

// Simple frontend validation for email.
// Backend validation still exists and protects the real data.
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Updates only the name.
const updateName = async () => {
    const name = document.getElementById("name").value.trim();

    if (!isValidFullName(name)) {
        showProfileMessage(t("fullNameValidation"));
        return;
    }

    await updateProfile({ name });
};

// Updates only the email.
const updateEmail = async () => {
    const email = document.getElementById("email").value.trim().toLowerCase();

    if (!isValidEmail(email)) {
        showProfileMessage(t("emailValidation"));
        return;
    }

    await updateProfile({ email });
};

// Sends PATCH request for profile updates
const updateProfile = async (updatedProfile) => {
    try {
        const response = await apiFetch("/user/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProfile)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || t("failedToUpdateProfile"));
        }

        currentProfile = await response.json();

        renderProfileView();

    } catch (error) {
        showProfileMessage(error.message);
    }
};

// Updates the password.
const updatePassword = async () => {
    const currentPassword =
        document.getElementById("current-password").value;

    const newPassword =
        document.getElementById("new-password").value;

    const confirmNewPassword =
        document.getElementById("confirm-new-password").value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showProfileMessage(t("allPasswordFieldsRequired"));
        return;
    }

    if (newPassword.length < 8) {
        showProfileMessage(t("passwordMinLength"));
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showProfileMessage(t("passwordsDoNotMatch"));
        return;
    }

    try {
        const response = await apiFetch("/user/password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmNewPassword
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || t("failedToUpdatePassword"));
        }

        showProfileMessage(t("passwordChangedSuccessfully"), "success");

        setTimeout(() => {
            renderProfileView();
        }, 900);

    } catch (error) {
        showProfileMessage(error.message);
    }
};

const initPage = async () => {
    await loadProfile();
};