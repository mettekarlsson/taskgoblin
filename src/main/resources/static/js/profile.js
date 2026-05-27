const profileContent =
    document.getElementById("profile-content");

const loadProfile = async () => {

    try {

        const response =
            await fetch("/user/profile");

        if (!response.ok) {
            throw new Error("Failed to load profile");
        }

        const profile = await response.json();

        profileContent.innerHTML = `
            <h2>${profile.name}</h2>

            <p>Email: ${profile.email}</p>
        `;

    } catch (error) {

        profileContent.innerHTML = `
            <p>${error.message}</p>
        `;
    }
};

loadProfile();