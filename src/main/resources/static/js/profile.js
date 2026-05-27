const profileContent = document.getElementById("profile-content");

let currentProfile = null;

// Loads the profile from the backend when the page opens.
const loadProfile = async () => {
    try {
        const response = await fetch("/user/profile");

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
                    <span class="profile-label">Name:</span>
                    <span class="profile-value">${currentProfile.name}</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditName()">
                    Edit
                </button>
            </div>

            <div class="profile-row">
                <div>
                    <span class="profile-label">E-mail:</span>
                    <span class="profile-value">${currentProfile.email}</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditEmail()">
                    Edit
                </button>
            </div>

            <div class="profile-row">
                <div>
                    <span class="profile-label">Password:</span>
                    <span class="profile-value">*******</span>
                </div>

                <button class="profile-edit-btn" onclick="renderEditPassword()">
                    Edit
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
            <label class="profile-label" for="name">Name:</label>

            <input
                id="name"
                class="profile-input"
                type="text"
                value="${currentProfile.name}"
            >

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updateName()">Save</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">Cancel</button>
            </div>
        </div>
    `;
};

// Renders the edit form for email.
// type="text" is used instead of type="email" to avoid the browser's default popup.
const renderEditEmail = () => {
    profileContent.innerHTML = `
        <div class="profile-card">
            <label class="profile-label" for="email">E-mail:</label>

            <input
                id="email"
                class="profile-input"
                type="text"
                value="${currentProfile.email}"
            >

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updateEmail()">Save</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">Cancel</button>
            </div>
        </div>
    `;
};

// Renders the edit form for password.
const renderEditPassword = () => {
    profileContent.innerHTML = `
        <div class="profile-card">
            <label class="profile-label" for="current-password">Current password:</label>
            <input id="current-password" class="profile-input" type="password">

            <label class="profile-label" for="new-password">New password:</label>
            <input id="new-password" class="profile-input" type="password">

            <label class="profile-label" for="confirm-new-password">Confirm new password:</label>
            <input id="confirm-new-password" class="profile-input" type="password">

            <p id="profile-message" class="profile-message"></p>

            <div class="profile-actions">
                <button class="profile-save-btn" onclick="updatePassword()">Save</button>
                <button class="profile-cancel-btn" onclick="renderProfileView()">Cancel</button>
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
        showProfileMessage(
            "Full name must contain only letters and include first and last name"
        );
        return;
    }

    await updateProfile({ name });
};

// Updates only the email.
const updateEmail = async () => {
    const email = document.getElementById("email").value.trim().toLowerCase();

    if (!isValidEmail(email)) {
        showProfileMessage("Email must be valid");
        return;
    }

    await updateProfile({ email });
};

// Sends PATCH request for profile updates.
const updateProfile = async (updatedProfile) => {
    try {
        const response = await fetch("/user/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProfile)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update profile");
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
        showProfileMessage("All password fields are required");
        return;
    }

    if (newPassword.length < 8) {
        showProfileMessage("Password must be at least 8 characters");
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showProfileMessage("New passwords do not match");
        return;
    }

    try {
        const response = await fetch("/user/password", {
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
            throw new Error(error.message || "Failed to update password");
        }

        showProfileMessage("Password changed successfully", "success");

        setTimeout(() => {
            renderProfileView();
        }, 900);

    } catch (error) {
        showProfileMessage(error.message);
    }
};

loadProfile();