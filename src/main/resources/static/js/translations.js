const translations = {
    en: {
        home: "Home",
        profile: "Profile",
        settings: "Settings",
        tasks: "To-Do",
        lists: "Lists",
        notes: "Notes",
        calendar: "Calendar",
        logout: "Logout",

        logoutTitle: "Log out?",
        logoutMessage: "Are you sure you want to log out?",

        name: "Name",
        email: "E-mail",
        password: "Password",
        currentPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm password",

        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        back: "Back",
        delete: "Delete",

        fullNameValidation: "Full name must contain only letters and include first and last name",
        emailValidation: "Email must be valid",
        failedToUpdateProfile: "Failed to update profile",
        allPasswordFieldsRequired: "All password fields are required",
        passwordMinLength: "Password must be at least 8 characters",
        passwordsDoNotMatch: "New passwords do not match",
        failedToUpdatePassword: "Failed to update password",
        passwordChangedSuccessfully: "Password changed successfully",

        defaultReminder: "Default reminder",
        off: "Off",
        oneHour: "1 hour",
        oneDay: "1 day",
        notifications: "Notifications",
        theme: "Theme",
        language: "Language",
        light: "Light",
        dark: "Dark",
        enabled: "Enabled",
        disabled: "Disabled",

        newNote: "New note",
        editNote: "Edit note",
        deleteNote: "Delete note",
        searchNotes: "Search notes...",
        noNotesYet: "No notes yet.",
        noNotesMatchSearch: "No notes match your search.",
        contentCannotBeEmpty: "Content cannot be empty.",

        deleteNoteTitle: "Delete note?",
        deleteNoteMessage: "This action cannot be undone.",

        currentSettings: "Current settings",
        loadingSettings: "Loading settings...",

        // TASK
        noTasksYet: "No tasks yet.",
        failedToLoadTasks: "Failed to load tasks",
        status: "Status",
        priority: "Priority",

        addTask: "Add task",
        add: "Add",
        taskTitleRequired: "Task title is required",
        failedToCreateTask: "Failed to create task",
    },

    sv: {
        home: "Hem",
        profile: "Profil",
        settings: "Inställningar",
        tasks: "To-Do",
        lists: "Checklistor",
        notes: "Anteckningar",
        calendar: "Kalender",
        logout: "Logga ut",

        logoutTitle: "Logga ut?",
        logoutMessage: "Är du säker på att du vill logga ut?",

        name: "Namn",
        email: "E-post",
        password: "Lösenord",
        currentPassword: "Nuvarande lösenord",
        newPassword: "Nytt lösenord",
        confirmPassword: "Bekräfta lösenord",

        edit: "Redigera",
        save: "Spara",
        cancel: "Avbryt",
        back: "Tillbaka",
        delete: "Radera",

        fullNameValidation: "Fullständigt namn får bara innehålla bokstäver och måste innehålla både för- och efternamn",
        emailValidation: "E-postadressen måste vara giltig",
        failedToUpdateProfile: "Kunde inte uppdatera profilen",
        allPasswordFieldsRequired: "Alla lösenordsfält måste fyllas i",
        passwordMinLength: "Lösenordet måste vara minst 8 tecken",
        passwordsDoNotMatch: "De nya lösenorden matchar inte",
        failedToUpdatePassword: "Kunde inte uppdatera lösenordet",
        passwordChangedSuccessfully: "Lösenordet har ändrats",

        defaultReminder: "Förvald påminnelse",
        off: "Av",
        oneHour: "1 timme",
        oneDay: "1 dag",
        notifications: "Notiser",
        theme: "Tema",
        language: "Språk",
        light: "Ljust",
        dark: "Mörkt",
        enabled: "På",
        disabled: "Av",

        newNote: "Ny anteckning",
        editNote: "Redigera anteckning",
        deleteNote: "Ta bort anteckning",
        searchNotes: "Sök anteckningar...",
        noNotesYet: "Inga anteckningar ännu.",
        noNotesMatchSearch: "Inga anteckningar matchar sökningen.",
        contentCannotBeEmpty: "Innehåll får inte vara tomt.",

        deleteNoteTitle: "Ta bort anteckning?",
        deleteNoteMessage: "Den här åtgärden kan inte ångras.",

        currentSettings: "Nuvarande inställningar",
        loadingSettings: "Laddar inställningar...",

        // TASK
        noTasksYet: "Inga uppgifter ännu.",
        failedToLoadTasks: "Kunde inte ladda uppgifter",
        status: "Status",
        priority: "Prioritet",

        addTask: "Lägg till uppgift",
        add: "Lägg till",
        taskTitleRequired: "Uppgiftens titel krävs",
        failedToCreateTask: "Kunde inte skapa uppgift",


    }
};

const t = (key) => {
    const language =
        currentSettings?.language || "en";

    return translations[language]?.[key] || key;
};

const translatePage = () => {
    document
        .querySelectorAll("[data-translate]")
        .forEach(element => {
            element.textContent =
                t(element.dataset.translate);
        });

    // Task
    document
        .querySelectorAll("[data-translate-placeholder]")
        .forEach(element => {

            element.placeholder =
                t(element.dataset.translatePlaceholder);

        });

};



