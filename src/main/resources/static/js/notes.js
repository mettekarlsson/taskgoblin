const notesGrid = document.getElementById("notes-grid");

const DEFAULT_NOTE_COLOR = "#EEE5D9";

let selectedColor = DEFAULT_NOTE_COLOR;

let currentNotes = [];

let noteToDeleteId = null;

const getNoteColor = (color) => {

    if (!document.body.classList.contains("dark-theme")) {
        return color;
    }

    switch (color) {

        case "#EEE5D9":
            return "#2B2E22";

        case "#FFF8DD":
            return "#5A5330";

        case "#E8F5E9":
            return "#344536";

        case "#DCE7F4":
            return "#34465A";

        case "#FDE2E4":
            return "#5A3C40";

        case "#EDE0EF":
            return "#4D3B55";

        default:
            return color;
    }

};

document.addEventListener("click", (event) => {

    const chip = event.target.closest(".note-color-chip");

    if (!chip) {
        return;
    }

    document
        .querySelectorAll(".note-color-chip")
        .forEach(chip =>
            chip.classList.remove("selected")
        );

    chip.classList.add("selected");

    selectedColor = chip.dataset.color;

});

const loadNotes = async () => {
    try {
        const response = await apiFetch("/notes");

        if (!response.ok) {
            throw new Error("Failed to load notes");
        }

        currentNotes = await response.json();

        currentNotes.sort((a, b) => {

            // Pinned notes always come first
            if (a.pinned !== b.pinned) {
                return b.pinned - a.pinned;
            }

            // Then sort by most recently interacted with
            return new Date(b.lastInteractedAt)
                - new Date(a.lastInteractedAt);

        });

        renderNotes(currentNotes);

    } catch (error) {
        notesGrid.innerHTML = `
            <p class="notes-error">${error.message}</p>
        `;
    }
};

const renderNotes = (notes, searchQuery = "") => {
    document.querySelector(".notes-header").style.display = "flex";

    if (notes.length === 0) {

        notesGrid.innerHTML = `
        <p class="notes-empty">
            ${
            searchQuery
                ? t("noNotesMatchSearch")
                : t("noNotesYet")
        }
        </p>
    `;

        return;
    }

    notesGrid.innerHTML = notes.map(note => {

        const noteColor =
            getNoteColor(note.color || DEFAULT_NOTE_COLOR);

        return `
<article 
    class="note-card"
    onclick="openNote(${note.id})"
 style="
    background: ${noteColor};
    --note-bg: ${noteColor};
"
>

<button
    class="note-pin-btn ${note.pinned ? "pinned" : ""}"
    onclick="togglePinned(event, ${note.id})"
>
    📌
</button>

<div class="note-action-menu" id="note-menu-${note.id}">
    <button onclick="renderEditNoteForm(event, ${note.id})">
        ${t("editNote")}
    </button>

    <button onclick="openDeleteModal(event, ${note.id})">
        ${t("deleteNote")}
    </button>
</div>

            ${note.title ? `<h2>${note.title}</h2>` : ""}

            <p>${note.content}</p>

<div class="note-footer">

    <span class="note-date">
        ${formatNoteDate(note.lastInteractedAt || note.createdAt)}
    </span>

    <button
        class="note-menu-btn"
        onclick="toggleNoteMenu(event, ${note.id})"
    >
        ⋮
    </button>

</div>

        </article>
     `;
    }).join("");
};

const openNote = async (noteId) => {
    try {
        const response = await apiFetch(`/notes/${noteId}`);

        if (!response.ok) {
            throw new Error("Failed to load note");
        }

        const note = await response.json();

        renderSingleNote(note);

    } catch (error) {
        notesGrid.innerHTML = `
            <p class="notes-error">${error.message}</p>
        `;
    }
};

const toggleSearch = () => {

    const searchView =
        document.getElementById("notes-search-view");

    const searchInput =
        document.getElementById("notes-search");

    const isOpen =
        searchView.classList.contains("open");

    if (isOpen) {
        closeSearch();
        return;
    }

    document.querySelector(".notes-header").style.display = "none";

    searchView.classList.add("open");

    searchInput.value = "";
    searchInput.focus();

    renderNotes(currentNotes);
};
const closeSearch = () => {

    document
        .getElementById("notes-search-view")
        .classList.remove("open");

    document
        .querySelector(".notes-header")
        .style.display = "flex";

    document
        .getElementById("notes-search")
        .value = "";

    renderNotes(currentNotes);

};

const toggleNoteMenu = (event, noteId) => {
    event.stopPropagation();

    document.querySelectorAll(".note-action-menu").forEach(menu => {
        if (menu.id !== `note-menu-${noteId}`) {
            menu.classList.remove("open");
        }
    });

    document
        .getElementById(`note-menu-${noteId}`)
        .classList.toggle("open");
};

document.addEventListener("click", (event) => {

    document.querySelectorAll(".note-action-menu").forEach(menu => {
        menu.classList.remove("open");
    });

    const searchView =
        document.getElementById("notes-search-view");

    const searchInput =
        document.getElementById("notes-search");

    if (
        searchView.classList.contains("open")
        &&
        !searchInput.contains(event.target)
        &&
        !event.target.closest(".notes-search-btn")
    ) {
        closeSearch();
    }

});

const togglePinned = async (event, noteId) => {
    event.stopPropagation();

    const note = currentNotes.find(note => note.id === noteId);

    await sendNoteRequest(`/notes/${noteId}`, "PATCH", {
        pinned: !note.pinned
    });
};

const renderSingleNote = (note) => {
    document.querySelector(".notes-header").style.display = "none";

    const noteColor =
        getNoteColor(note.color || DEFAULT_NOTE_COLOR);

    notesGrid.innerHTML = `
<section
    class="note-detail-card"
    style="
        background: ${noteColor};
        --note-bg: ${noteColor};
    "
>

            <div class="note-detail-header">

                <button
                    class="note-cancel-btn"
                    onclick="closeNoteDetail()"
                >
                    ← ${t("back")}
                </button>

<button
    class="note-save-btn"
    onclick="renderEditNoteForm(null, ${note.id})"
>
    ${t("edit")}
</button>

            </div>

            ${note.title ? `<h2>${note.title}</h2>` : ""}

            <p>${note.content}</p>
<div class="note-detail-footer">

    <div class="note-detail-meta">

        <span>
            ${t("created")}:
            ${formatDetailDate(note.createdAt)}
        </span>

        <span>
            ${t("updated")}:
            ${formatDetailDate(
        note.lastInteractedAt || note.createdAt
    )}
        </span>

    </div>

<button
    class="note-delete-btn"
    onclick="openDeleteModal(null, ${note.id})"
>
    ${t("delete")}
</button>

</div>

        </section>
    `;
};


const formatDetailDate = (dateString) => {

    if (!dateString) {
        return "";
    }

    return new Date(dateString).toLocaleString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

};

const closeNoteDetail = () => {
    renderNotes(currentNotes);
};

const renderCreateNoteForm = () => {
    document.querySelector(".notes-header").style.display = "none";

    selectedColor = DEFAULT_NOTE_COLOR;

    notesGrid.innerHTML = `
        <section class="note-form-card">

            <h2>${t("newNote")}</h2>

           <label for="note-title">${t("title")}</label>
            <input id="note-title" class="note-input" type="text">

            <label for="note-content">${t("content")}</label>
            <textarea id="note-content" class="note-textarea"></textarea>

<label>${t("color")}</label>

<div class="note-color-options">

    <button type="button"
            class="note-color-chip selected"
            data-color="#EEE5D9">
        ${t("defaultColor")}
    </button>

    <button type="button"
            class="note-color-chip"
            data-color="#FFF8DD"></button>

    <button type="button"
            class="note-color-chip"
            data-color="#E8F5E9"></button>

    <button type="button"
            class="note-color-chip"
            data-color="#DCE7F4"></button>

    <button type="button"
            class="note-color-chip"
            data-color="#FDE2E4"></button>

    <button type="button"
            class="note-color-chip"
            data-color="#EDE0EF"></button>

</div>

            <p id="note-message" class="note-message"></p>

            <div class="note-form-actions">
    <button class="note-save-btn" onclick="createNote()">
        ${t("save")}
    </button>

<button class="note-cancel-btn" onclick="history.back()">
    ${t("cancel")}
</button>
</div>

        </section>
    `;
};

const renderEditNoteForm = (event, noteId) => {
    if (event) {
        event.stopPropagation();
    }

    const note = currentNotes.find(note => note.id === noteId);

    selectedColor = note.color || DEFAULT_NOTE_COLOR;

    notesGrid.innerHTML = `
        <section class="note-form-card">

            <h2>${t("editNote")}</h2>

            <label for="note-title">${t("title")}</label>
            <input 
                id="note-title" 
                class="note-input" 
                type="text"
                value="${note.title || ""}"
            >

            <label for="note-content">${t("content")}</label>
            <textarea id="note-content" class="note-textarea">${note.content}</textarea>

            <label>${t("color")}</label>

            <div class="note-color-options">

                <button type="button"
        class="note-color-chip ${selectedColor === "#EEE5D9" ? "selected" : ""}"
        data-color="#EEE5D9">
    ${t("defaultColor")}
</button>

<button type="button"
        class="note-color-chip ${selectedColor === "#FFF8DD" ? "selected" : ""}"
        data-color="#FFF8DD"></button>

<button type="button"
        class="note-color-chip ${selectedColor === "#E8F5E9" ? "selected" : ""}"
        data-color="#E8F5E9"></button>

<button type="button"
        class="note-color-chip ${selectedColor === "#DCE7F4" ? "selected" : ""}"
        data-color="#DCE7F4"></button>

<button type="button"
        class="note-color-chip ${selectedColor === "#FDE2E4" ? "selected" : ""}"
        data-color="#FDE2E4"></button>

<button type="button"
        class="note-color-chip ${selectedColor === "#EDE0EF" ? "selected" : ""}"
        data-color="#EDE0EF"></button>
            </div>

            <p id="note-message" class="note-message"></p>

            <div class="note-form-actions">
    <button class="note-save-btn" onclick="updateNote(${note.id})">
        ${t("save")}
    </button>

    <button class="note-cancel-btn" onclick="renderNotes(currentNotes)">
        ${t("cancel")}
    </button>
</div>

        </section>
    `;
};

const createNote = async () => {
    const title = document.getElementById("note-title").value.trim();
    const content = document.getElementById("note-content").value.trim();
    const color = selectedColor;

    if (!content) {
        showNoteMessage(t("contentCannotBeEmpty"));
        return;
    }

    await sendNoteRequest("/notes", "POST", {
        title,
        content,
        color
    });
};

const updateNote = async (noteId) => {
    const title = document.getElementById("note-title").value.trim();
    const content = document.getElementById("note-content").value.trim();
    const color = selectedColor;

    if (!content) {
        showNoteMessage(t("contentCannotBeEmpty"));
        return;
    }

    await sendNoteRequest(`/notes/${noteId}`, "PATCH", {
        title,
        content,
        color
    });
};

const sendNoteRequest = async (url, method, noteData) => {
    try {
        const response = await apiFetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save note");
        }

        await loadNotes();

        // Returns to the page where quick add was opened.
        const quickAdd =
            new URLSearchParams(window.location.search)
                .get("quickAdd");

        const returnTo =
            new URLSearchParams(window.location.search)
                .get("returnTo");

        if (quickAdd === "true" && returnTo) {
            window.location.href = returnTo;
        }

    } catch (error) {
        showNoteMessage(error.message);
    }
};

const openDeleteModal = (event, noteId) => {
    if (event) {
        event.stopPropagation();
    }

    noteToDeleteId = noteId;

    document
        .getElementById("delete-note-modal")
        .classList.add("open");
};
const closeDeleteModal = () => {
    noteToDeleteId = null;

    document
        .getElementById("delete-note-modal")
        .classList.remove("open");
};

const confirmDeleteNote = async () => {
    if (!noteToDeleteId) {
        return;
    }

    await deleteNote(noteToDeleteId);

    closeDeleteModal();
};

const deleteNote = async (noteId) => {
    try {
        const response = await apiFetch(`/notes/${noteId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete note");
        }

        await loadNotes();

    } catch (error) {
        notesGrid.innerHTML = `
            <p class="notes-error">${error.message}</p>
        `;
    }
};

const showNoteMessage = (message) => {
    const messageElement = document.getElementById("note-message");

    if (messageElement) {
        messageElement.textContent = message;
    }
};

const formatNoteDate = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);
    const today = new Date();

    const diffInMs = today - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return t("today");
    }

    if (diffInDays === 1) {
        return t("yesterday");
    }

    return date.toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};
const searchInput =
    document.getElementById("notes-search");

if (searchInput) {

    searchInput.addEventListener("input", (event) => {

        const query =
            event.target.value.toLowerCase();

        const filteredNotes =
            currentNotes.filter(note =>
                (note.title || "")
                    .toLowerCase()
                    .includes(query)
                ||
                note.content
                    .toLowerCase()
                    .includes(query)
            );

        renderNotes(filteredNotes, query);

    });

    searchInput.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape"
        ) {
            closeSearch();
        }

    });

}

// Runs automatically when the page loads.
const initPage = async () => {

    // Reloads notes from backend.
    await loadNotes();

    // Opens the create note form when triggered from the quick add menu.
    const quickAdd =
        new URLSearchParams(window.location.search)
            .get("quickAdd");

    if (quickAdd === "true") {
        renderCreateNoteForm();
    }

};
