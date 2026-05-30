const settingsCard =
    document.getElementById("settings-card");

let currentSettings = null;

const loadSettings = async () => {
    try {

        const response =
            await fetch("/user/settings");

        if (!response.ok) {
            throw new Error("Failed to load settings");
        }

        currentSettings =
            await response.json();

        renderSettings(currentSettings);

    } catch (error) {

        settingsCard.innerHTML = `
            <p class="settings-error">
                ${error.message}
            </p>
        `;

    }
};

const renderSettings = (settings) => {

    settingsCard.innerHTML = `

        <div class="settings-row">
            <span class="settings-label">
                Default reminder
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
        Off
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
        1 hour
    </option>

    <option value="1440"
        ${settings.defaultReminderMinutes === 1440 ? "selected" : ""}>
        1 day
    </option>

</select>
        </div>

        <div class="settings-row">
            <span class="settings-label">
                Notifications
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
                Theme
            </span>

            <select
                class="settings-select"
                onchange="updateSingleSetting({
                    theme: this.value
                })"
            >
                <option value="light"
                    ${settings.theme === "light" ? "selected" : ""}>
                    Light
                </option>

                <option value="dark"
                    ${settings.theme === "dark" ? "selected" : ""}>
                    Dark
                </option>
            </select>
        </div>

        <div class="settings-row">
            <span class="settings-label">
                Language
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
        renderSettings(currentSettings);

    } catch (error) {
        alert(error.message);
    }
};

loadSettings();