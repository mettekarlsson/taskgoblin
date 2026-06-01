let currentSettings = null;

const loadAppSettings = async () => {
    try {
        const response = await apiFetch("/user/settings");

        if (!response.ok) {
            throw new Error("Failed to load app settings");
        }

        currentSettings = await response.json();

        applyTheme(currentSettings.theme);
        translatePage();

    } catch (error) {
        console.error(error.message);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadAppSettings();

    if (typeof initPage === "function") {
        initPage();
    }
});