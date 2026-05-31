const settingsCard =
    document.getElementById("settings-card");

const renderSettings = (settings) => {

    settingsCard.innerHTML = `

        <div class="settings-row">
            <span class="settings-label">
                 ${t("defaultReminder")}
            </span>

            <select
    class="settings-select"
    onchange="updateSingleSetting({
        defaultReminderMinutes:
            Number(this.value)
    })"
>

    <option value="0"
        ${settings.defaultReminderMinutes === 0 ? "selected" : ""}>
        ${t("off")}
    </option>

    <option value="5"
        ${settings.defaultReminderMinutes === 5 ? "selected" : ""}>
        5 min
    </option>

    <option value="15"
        ${settings.defaultReminderMinutes === 15 ? "selected" : ""}>
        15 min
    </option>

    <option value="30"
        ${settings.defaultReminderMinutes === 30 ? "selected" : ""}>
        30 min
    </option>

    <option value="60"
        ${settings.defaultReminderMinutes === 60 ? "selected" : ""}>
         ${t("oneHour")}
    </option>

    <option value="1440"
        ${settings.defaultReminderMinutes === 1440 ? "selected" : ""}>
        ${t("oneDay")}
    </option>

</select>
        </div>

        <div class="settings-row">
            <span class="settings-label">
                ${t("notifications")}
            </span>

            <button
                class="settings-switch ${settings.notificationsEnabled ? "on" : ""}"
                onclick="updateSingleSetting({
                    notificationsEnabled: ${!settings.notificationsEnabled}
                })"
            >
                <span></span>
            </button>
        </div>

        <div class="settings-row">
            <span class="settings-label">
                ${t("theme")}
            </span>

            <select
                class="settings-select"
                onchange="updateSingleSetting({
                    theme: this.value
                })"
            >
                <option value="light"
                    ${settings.theme === "light" ? "selected" : ""}>
                    ${t("light")}
                </option>

                <option value="dark"
                    ${settings.theme === "dark" ? "selected" : ""}>
                    ${t("dark")}
                </option>
            </select>
        </div>

        <div class="settings-row">
            <span class="settings-label">
                ${t("language")}
            </span>

            <select
                class="settings-select"
                onchange="updateSingleSetting({
                    language: this.value
                })"
            >
<option value="sv"
    ${settings.language === "sv" ? "selected" : ""}>
    Svenska
</option>

<option value="en"
    ${settings.language === "en" ? "selected" : ""}>
    English
</option>
            </select>
        </div>

    `;
};
const updateSingleSetting = async (settingData) => {
    try {
        const response = await fetch("/user/settings", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settingData)
        });

        if (!response.ok) {
            throw new Error("Failed to update settings");
        }

        currentSettings = await response.json();

        if (settingData.theme !== undefined) {
            applyTheme(currentSettings.theme);
        }

        renderSettings(currentSettings);
        translatePage();

    } catch (error) {
        alert(error.message);
    }
};

const initPage = () => {
    renderSettings(currentSettings);
};