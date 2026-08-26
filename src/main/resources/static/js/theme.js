const applyTheme = (theme) => {
    document.body.classList.toggle(
        "dark-theme",
        theme === "dark"
    );
};