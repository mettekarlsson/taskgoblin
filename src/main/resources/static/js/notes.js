const notesGrid = document.getElementById("notes-grid");

const DEFAULT_NOTE_COLOR = "#F8F3F7";

let selectedColor = DEFAULT_NOTE_COLOR;

let currentNotes = [];

let noteToDeleteId = null;

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
        const response = await fetch("/notes");

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
                ? "No notes match your search."
                : "No notes yet."
        }
        </p>
    `;

        return;
    }

    notesGrid.innerHTML = notes.map(note => `
<article 
    class="note-card"
    onclick="openNote(${note.id})"
    style="
        background: ${note.color || DEFAULT_NOTE_COLOR};
        --note-bg: ${note.color || DEFAULT_NOTE_COLOR};
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
        Edit note
    </button>

    <button onclick="openDeleteModal(event, ${note.id})">
        Delete note
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
    `).join("");
};

const openNote = async (noteId) => {
    try {
        const response = await fetch(`/notes/${noteId}`);

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
    notesGrid.innerHTML = `
        <section
            class="note-detail-card"
            style="
                background: ${note.color || DEFAULT_NOTE_COLOR};
                --note-bg: ${note.color || DEFAULT_NOTE_COLOR};
            "
        >

            <div class="note-detail-header">

                <button
                    class="note-cancel-btn"
                    onclick="closeNoteDetail()"
                >
                    ← Back
                </button>

<button
    class="note-save-btn"
    onclick="renderEditNoteForm(null, ${note.id})"
>
    Edit
</button>

            </div>

            ${note.title ? `<h2>${note.title}</h2>` : ""}

            <p>${note.content}</p>
<div class="note-detail-footer">

    <div class="note-detail-meta">

        <span>
            Created:
            ${formatDetailDate(note.createdAt)}
        </span>

        <span>
            Updated:
            ${formatDetailDate(
        note.lastInteractedAt || note.createdAt
    )}
        </span>

    </div>

<button
    class="note-delete-btn"
    onclick="openDeleteModal(null, ${note.id})"
>
    Delete
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

            <h2>New note</h2>

            <label for="note-title">Title</label>
            <input id="note-title" class="note-input" type="text">

            <label for="note-content">Content</label>
            <textarea id="note-content" class="note-textarea"></textarea>

<label>Color</label>

<div class="note-color-options">

    <button type="button"
            class="note-color-chip selected"
            data-color="#F8F3F7">
        Default
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
                    Save
                </button>

                <button class="note-cancel-btn" onclick="renderNotes(currentNotes)">
                    Cancel
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

            <h2>Edit note</h2>

            <label for="note-title">Title</label>
            <input 
                id="note-title" 
                class="note-input" 
                type="text"
                value="${note.title || ""}"
            >

            <label for="note-content">Content</label>
            <textarea id="note-content" class="note-textarea">${note.content}</textarea>

            <label>Color</label>

            <div class="note-color-options">

                <button type="button"
        class="note-color-chip ${selectedColor === "#F8F3F7" ? "selected" : ""}"
        data-color="#F8F3F7">
    Default
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
                    Save
                </button>

                <button class="note-cancel-btn" onclick="renderNotes(currentNotes)">
                    Cancel
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
        showNoteMessage("Content cannot be empty.");
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
        showNoteMessage("Content cannot be empty.");
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
        const response = await fetch(url, {
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
        const response = await fetch(`/notes/${noteId}`, {
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
        return "Today";
    }

    if (diffInDays === 1) {
        return "Yesterday";
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
loadNotes();