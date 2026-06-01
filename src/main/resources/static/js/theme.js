const applyTheme = (theme) => {
    document.body.classList.toggle("dark-theme", theme === "dark");
};

const loadTheme = async () => {
    try {
        const response = await fetch("/user/settings");

        if (!response.ok) {
            return;
        }

        const settings = await response.json();
        applyTheme(settings.theme);

    } catch (error) {
        console.error("Failed to load theme", error);
    }
};

loadTheme();
