
const listsGrid = document.getElementById("lists-grid");
const DEFAULT_LIST_COLOR = "#EEE5D9";

const LIST_COLORS = [
    "#EEE5D9",
    "#FFF8DD",
    "#E8F5E9",
    "#DCE7F4",
    "#FDE2E4",
    "#EDE0EF"
];
const renderListColorChips = () => {
    return LIST_COLORS.map(color => `
        <button
            type="button"
            class="list-color-chip ${selectedListColor === color ? "selected" : ""}"
            data-color="${color}"
        >
            ${color === DEFAULT_LIST_COLOR ? "Default" : ""}
        </button>
    `).join("");
};

document.addEventListener("click", (event) => {
    const chip = event.target.closest(".list-color-chip");

    if (!chip) {
        return;
    }

    document
        .querySelectorAll(".list-color-chip")
        .forEach(chip =>
            chip.classList.remove("selected")
        );

    chip.classList.add("selected");

    selectedListColor = chip.dataset.color;
});

let selectedListColor = DEFAULT_LIST_COLOR;
let selectedListIcon = "clipboard";

let currentLists = [];

let listToDeleteId = null;

const loadLists = async () => {
    try {
        const response = await apiFetch("/lists");

        if (!response.ok) {
            throw new Error("Failed to load lists");
        }

        currentLists = await response.json();

        currentLists.sort((a, b) => {

            if (a.pinned !== b.pinned) {
                return b.pinned - a.pinned;
            }

            return new Date(b.lastInteractedAt || b.createdAt)
                - new Date(a.lastInteractedAt || a.createdAt);
        });

        await renderLists(currentLists);

    } catch (error) {
        listsGrid.innerHTML = `
            <p class="lists-error">${error.message}</p>
        `;
    }
};

const renderLists = async (lists, searchQuery = "") => {
    document.querySelector(".lists-header").style.display = "flex";

    if (lists.length === 0) {
        listsGrid.innerHTML = `
            <p class="lists-empty">
                ${searchQuery ? "No lists match your search." : "No lists yet."}
            </p>
        `;

        return;
    }

    const cards = await Promise.all(
        lists.map(async list => {

            const tasks = await loadTasksForList(list.id);

            const listIcon =
                getListIconEmoji(list.icon);

            const listColor =
                list.color || DEFAULT_LIST_COLOR;

            const previewTasks = tasks
                .slice(0, 4)
                .map(task => `
                    <div class="list-task-preview ${task.status === "DONE" ? "done" : ""}">
                        ${task.status === "DONE" ? "✓" : "○"} ${task.title}
                    </div>
                `)
                .join("");

            return `
<article
    class="list-card"
    onclick="openList(${list.id})"
    style="
        background: ${listColor};
    "
>

<button
    class="list-pin-btn ${list.pinned ? "pinned" : ""}"
    onclick="toggleListPinned(event, ${list.id})"
>
    📌
</button>



    <div class="list-card-title">

    <span class="list-card-icon">
        ${listIcon}
    </span>

    <h2>${list.name}</h2>

</div>

</div>

<div class="list-tasks-preview">
    ${
                previewTasks ||
                `<p class="list-task-preview">No tasks yet</p>`
            }
</div>

<div class="list-meta">
    ${tasks.length} tasks
    ${list.isRecurring ? " · recurring" : ""}
</div>

<div class="list-footer">

    <span class="list-date">
        ${formatListDate(list.lastInteractedAt || list.createdAt)}
    </span>

<button
    class="list-trash-btn"
    onclick="openDeleteListModal(event, ${list.id})"
    aria-label="Delete list"
>
    <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 7H20" />
        <path d="M10 11V17" />
        <path d="M14 11V17" />
        <path d="M6 7L7 21H17L18 7" />
        <path d="M9 7V4H15V7" />
    </svg>
</button>

</div>

</article>
`;
        })
    );

    listsGrid.innerHTML = cards.join("");
};

const toggleListMenu = (event, listId) => {
    event.stopPropagation();

    document.querySelectorAll(".list-action-menu").forEach(menu => {
        if (menu.id !== `list-menu-${listId}`) {
            menu.classList.remove("open");
        }
    });

    document
        .getElementById(`list-menu-${listId}`)
        .classList.toggle("open");
};

const toggleListPinned = async (event, listId) => {
    event.stopPropagation();

    const list =
        currentLists.find(list => list.id === listId);

    await sendListRequest(
        `/lists/${listId}`,
        "PUT",
        {
            pinned: !list.pinned
        }
    );
};

const sendListRequest = async (
    url,
    method,
    listData
) => {

    try {

        const response =
            await apiFetch(url, {
                method,
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(
                    listData
                )
            });

        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(
                error.message
                ||
                "Failed to save list"
            );
        }

        await loadLists();

    } catch (error) {

        listsGrid.innerHTML = `
            <p class="lists-error">
                ${error.message}
            </p>
        `;
    }
};

const openList = async (listId) => {
    try {

        const listResponse =
            await apiFetch(`/lists/${listId}`);

        const tasksResponse =
            await apiFetch(`/lists/${listId}/tasks`);

        if (
            !listResponse.ok
            ||
            !tasksResponse.ok
        ) {
            throw new Error("Failed to load list");
        }

        const list =
            await listResponse.json();

        const tasks =
            await tasksResponse.json();

        renderSingleList(
            list,
            tasks
        );

    } catch (error) {

        listsGrid.innerHTML = `
            <p class="lists-error">
                ${error.message}
            </p>
        `;
    }
};

const renderSingleList = (list, tasks) => {

    document.querySelector(".lists-header").style.display = "none";

    const listIcon =
        getListIconEmoji(list.icon);

    const listColor =
        list.color || DEFAULT_LIST_COLOR;

    const sortedTasks = [...tasks].sort((a, b) => {

        const aCompleted =
            a.status === "DONE" || isToday(a.lastCompletedAt);

        const bCompleted =
            b.status === "DONE" || isToday(b.lastCompletedAt);

        return aCompleted - bCompleted;
    });

    listsGrid.innerHTML = `
<section class="list-detail-card" data-list-id="${list.id}" style="background: ${listColor};">

    <div class="list-detail-header">

        <button
            class="list-cancel-btn"
            onclick="closeListDetail()"
        >
            ← Back
        </button>

        <button
            class="list-save-btn"
            onclick="renderEditListForm(null, ${list.id})"
        >
            Edit
        </button>

    </div>

    <div class="list-detail-title">

        <span class="list-card-icon">
            ${listIcon}
        </span>

        <h2>${list.name}</h2>

    </div>

    <div class="list-detail-tasks">

        ${
        tasks.length
            ? sortedTasks.map(task => {
                const completedToday =
                    isToday(task.lastCompletedAt);

                const isDone =
                    task.status === "DONE";

                const isVisuallyCompleted =
                    isDone || completedToday;

                return `
    <div class="list-detail-task ${isVisuallyCompleted ? "done" : ""}">

        <button
            class="list-task-check ${isVisuallyCompleted ? "checked" : ""}"
            onclick="toggleTaskComplete(event, ${task.id}, '${task.status}')"
            aria-label="Complete task"
        >
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 13L10 18L19 7" />
            </svg>
        </button>

        <div class="list-task-content">

            <span class="list-task-title">
                ${task.title}
            </span>

            ${
                    task.isRecurring && task.lastCompletedAt
                        ? `<span class="list-task-badge">
                        Senast klar ${formatListDate(task.lastCompletedAt)}
                    </span>`
                        : ""
                }

        </div>

    </div>
`;
            }).join("")
            : `<p class="list-task-preview">No tasks yet</p>`
    }

    </div>

    <button
        class="list-add-task-btn"
        onclick="renderCreateTaskInListForm(${list.id})"
    >
        + Task
    </button>

    <div id="create-task-in-list-container"></div>

    <div class="list-detail-footer">

        <div class="list-detail-meta">

            <span>
                Created:
                ${formatListDate(list.createdAt)}
            </span>

            <span>
                Updated:
                ${formatListDate(
        list.lastInteractedAt || list.createdAt
    )}
            </span>

        </div>

        <button
            class="list-delete-btn"
            onclick="openDeleteListModal(null, ${list.id})"
        >
            Delete
        </button>

    </div>

</section>
`;
};

//Helper
const isToday = (dateString) => {
    if (!dateString) {
        return false;
    }

    const date = new Date(dateString);
    const today = new Date();

    return date.toDateString() === today.toDateString();
};

const toggleTaskComplete = async (event, taskId, status) => {
    event.stopPropagation();

    const endpoint =
        status === "DONE"
            ? `/tasks/${taskId}/reopen`
            : `/tasks/${taskId}/complete`;

    try {
        const response = await apiFetch(endpoint, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        const openListId =
            document
                .querySelector(".list-detail-card")
                .dataset
                .listId;

        await openList(openListId);

    } catch (error) {
        listsGrid.innerHTML = `
            <p class="lists-error">${error.message}</p>
        `;
    }
};

const renderCreateTaskInListForm = (listId) => {
    document.getElementById("create-task-in-list-container").innerHTML = `
        <section class="list-task-form">

            <label for="list-task-title">Task title</label>

            <input
                id="list-task-title"
                class="list-input"
                type="text"
            >

            <p id="list-message" class="list-message"></p>

            <div class="list-form-actions">

                <button
                    class="list-save-btn"
                    onclick="createTaskInList(${listId})"
                >
                    Save
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="document.getElementById('create-task-in-list-container').innerHTML = ''"
                >
                    Cancel
                </button>

            </div>

        </section>
    `;
};

const closeListDetail = () => {
    renderLists(currentLists);
};

const deleteList = async (listId) => {

    try {

        const response =
            await apiFetch(
                `/lists/${listId}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to delete list"
            );
        }

        await loadLists();

    } catch (error) {

        listsGrid.innerHTML = `
            <p class="lists-error">
                ${error.message}
            </p>
        `;
    }
};

const openDeleteListModal = (
    event,
    listId
) => {

    if (event) {
        event.stopPropagation();
    }

    listToDeleteId = listId;

    document
        .getElementById("delete-list-modal")
        .classList.add("open");
};

const closeDeleteListModal = () => {

    listToDeleteId = null;

    document
        .getElementById("delete-list-modal")
        .classList.remove("open");
};

const confirmDeleteList = async () => {

    if (!listToDeleteId) {
        return;
    }

    await deleteList(listToDeleteId);

    closeDeleteListModal();
};

const loadTasksForList = async (listId) => {
    try {
        const response = await apiFetch(`/lists/${listId}/tasks`);

        if (!response.ok) {
            return [];
        }

        return await response.json();

    } catch (error) {
        return [];
    }
};

const toggleListSearch = () => {
    const searchView =
        document.getElementById("lists-search-view");

    const searchInput =
        document.getElementById("lists-search");

    const isOpen =
        searchView.classList.contains("open");

    if (isOpen) {
        closeListSearch();
        return;
    }

    document.querySelector(".lists-header").style.display = "none";

    searchView.classList.add("open");

    searchInput.value = "";
    searchInput.focus();

    renderLists(currentLists);
};

const closeListSearch = () => {
    document
        .getElementById("lists-search-view")
        .classList.remove("open");

    document
        .querySelector(".lists-header")
        .style.display = "flex";

    document
        .getElementById("lists-search")
        .value = "";

    renderLists(currentLists);
};

const renderCreateListForm = () => {
    document.querySelector(".lists-header").style.display = "none";

    selectedListColor = DEFAULT_LIST_COLOR;
    selectedListIcon = "clipboard";

    listsGrid.innerHTML = `
        <section class="list-form-card">

            <h2>Add list</h2>

            <label for="list-name">Name</label>
            <input id="list-name" class="list-input" type="text">

            <label>Color</label>

            <div class="list-color-options">
                ${renderListColorChips()}
            </div>

            <label>Icon</label>

            <button
                type="button"
                id="selected-list-icon-btn"
                class="list-icon-picker-btn"
                onclick="toggleIconPicker()"
            >
               ${getListIconEmoji(selectedListIcon)} Choose icon
            </button>

            <div
                id="list-icon-picker"
                class="list-icon-picker"
            >
                ${renderIconOptions()}
            </div>

            <label for="list-due-at">Due date</label>
            <input
    id="list-due-at"
    class="list-input"
    type="date"
>

            <label class="list-checkbox-row">
                <input
                    id="list-is-recurring"
                    type="checkbox"
                    onchange="toggleRecurringOptions()"
                >
                Recurring list
            </label>

            <div
                id="list-recurring-options"
                class="list-recurring-options"
            >

                <label for="list-interval-value">
                    Repeat every
                </label>

                <div class="list-recurring-row">

                    <input
                        id="list-interval-value"
                        class="list-input"
                        type="number"
                        min="1"
                        value="1"
                    >

                    <select
                        id="list-frequency"
                        class="list-input"
                    >
                        <option value="DAILY">Day</option>
                        <option value="WEEKLY">Week</option>
                        <option value="MONTHLY">Month</option>
                        <option value="YEARLY">Year</option>
                    </select>

                </div>

            </div>

            <p id="list-message" class="list-message"></p>

            <div class="list-form-actions">

                <button
                    class="list-save-btn"
                    onclick="createList()"
                >
                    Save
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="renderLists(currentLists)"
                >
                    Cancel
                </button>

            </div>

        </section>
    `;
};

const renderEditListForm = (event, listId) => {
    if (event) {
        event.stopPropagation();
    }

    const list =
        currentLists.find(list => list.id === listId);

    if (!list) {
        return;
    }

    document.querySelector(".lists-header").style.display = "none";

    selectedListColor =
        list.color || DEFAULT_LIST_COLOR;

    selectedListIcon =
        list.icon || "clipboard";

    listsGrid.innerHTML = `
        <section class="list-form-card">

            <h2>Edit list</h2>

            <label for="list-name">Name</label>
            <input
                id="list-name"
                class="list-input"
                type="text"
                value="${list.name || ""}"
            >

            <label>Color</label>

            <div class="list-color-options">
                ${renderListColorChips()}
            </div>

            <label>Icon</label>

            <button
                type="button"
                id="selected-list-icon-btn"
                class="list-icon-picker-btn"
                onclick="toggleIconPicker()"
            >
                ${getListIconEmoji(selectedListIcon)} Choose icon
            </button>

            <div
                id="list-icon-picker"
                class="list-icon-picker"
            >
                ${renderIconOptions()}
            </div>

            <label for="list-due-at">Due date</label>
            <input
                id="list-due-at"
                class="list-input"
                type="date"
                value="${formatDateInputValue(list.dueAt)}"
            >

            <label class="list-checkbox-row">
                <input
                    id="list-is-recurring"
                    type="checkbox"
                    onchange="toggleRecurringOptions()"
                    ${list.isRecurring ? "checked" : ""}
                >
                Recurring list
            </label>

            <div
                id="list-recurring-options"
                class="list-recurring-options ${list.isRecurring ? "open" : ""}"
            >

                <label for="list-interval-value">
                    Repeat every
                </label>

                <div class="list-recurring-row">

                    <input
                        id="list-interval-value"
                        class="list-input"
                        type="number"
                        min="1"
                        value="${list.intervalValue || 1}"
                    >

                    <select
                        id="list-frequency"
                        class="list-input"
                    >
                        <option value="DAILY" ${list.frequency === "DAILY" ? "selected" : ""}>
                            Day
                        </option>

                        <option value="WEEKLY" ${list.frequency === "WEEKLY" ? "selected" : ""}>
                            Week
                        </option>

                        <option value="MONTHLY" ${list.frequency === "MONTHLY" ? "selected" : ""}>
                            Month
                        </option>

                        <option value="YEARLY" ${list.frequency === "YEARLY" ? "selected" : ""}>
                            Year
                        </option>
                    </select>

                </div>

            </div>

            <p id="list-message" class="list-message"></p>

            <div class="list-form-actions">

                <button
                    class="list-save-btn"
                    onclick="updateList(${list.id})"
                >
                    Save
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="openList(${list.id})"
                >
                    Cancel
                </button>

            </div>

        </section>
    `;
};

const updateList = async (listId) => {
    const name =
        document.getElementById("list-name").value.trim();

    const dueDate =
        document.getElementById("list-due-at").value;

    const dueAt =
        dueDate
            ? `${dueDate}T00:00:00`
            : null;

    const isRecurring =
        document.getElementById("list-is-recurring").checked;

    const frequency =
        isRecurring
            ? document.getElementById("list-frequency").value
            : null;

    const intervalValue =
        isRecurring
            ? Number(document.getElementById("list-interval-value").value)
            : null;

    if (!name) {
        document.getElementById("list-message").textContent =
            "List name cannot be empty";
        return;
    }

    if (isRecurring && !dueAt) {
        document.getElementById("list-message").textContent =
            "Recurring lists need a due date";
        return;
    }

    const listData = {
        name,
        color: selectedListColor,
        icon: selectedListIcon,
        dueAt,
        isRecurring,
        frequency,
        intervalValue
    };

    try {
        const response = await apiFetch(`/lists/${listId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(listData)
        });

        if (!response.ok) {
            const error = await response.json();

            throw new Error(
                error.message || "Failed to update list"
            );
        }

        await loadLists();
        await openList(listId);

    } catch (error) {
        document.getElementById("list-message").textContent =
            error.message;
    }
};

const LIST_ICONS = [
    { value: "clipboard", emoji: "📋" },
    { value: "star", emoji: "⭐" },
    { value: "fitness", emoji: "🏋️" },
    { value: "kitchen", emoji: "🍳" },
    { value: "cleaning", emoji: "🧹" },
    { value: "shopping", emoji: "🛒" },
    { value: "work", emoji: "💼" },
    { value: "study", emoji: "📚" },
    { value: "home", emoji: "🏠" }
];

const getListIconEmoji = (value) => {
    const icon =
        LIST_ICONS.find(icon => icon.value === value);

    return icon ? icon.emoji : "📋";
};

const renderIconOptions = () => {
    return LIST_ICONS.map(icon => `
        <button
            type="button"
            class="list-icon-chip ${
        selectedListIcon === icon.value
            ? "selected"
            : ""
    }"
            onclick="selectListIcon('${icon.value}')"
        >
            ${icon.emoji}
        </button>
    `).join("");
};

const toggleIconPicker = () => {
    document
        .getElementById("list-icon-picker")
        .classList.toggle("open");
};
const selectListIcon = (value) => {

    selectedListIcon = value;

    const selected =
        LIST_ICONS.find(
            icon => icon.value === value
        );

    document
        .getElementById(
            "selected-list-icon-btn"
        )
        .textContent =
        `${selected.emoji} Choose icon`;

    document
        .getElementById(
            "list-icon-picker"
        )
        .innerHTML =
        renderIconOptions();

    document
        .getElementById(
            "list-icon-picker"
        )
        .classList.remove("open");
};

const toggleRecurringOptions = () => {
    const isRecurring =
        document.getElementById("list-is-recurring").checked;

    document
        .getElementById("list-recurring-options")
        .classList.toggle("open", isRecurring);
};

const createList = async () => {
    const name =
        document.getElementById("list-name").value.trim();

    const dueDate =
        document.getElementById("list-due-at").value;

    const dueAt =
        dueDate
            ? `${dueDate}T00:00:00`
            : null;

    const isRecurring =
        document.getElementById("list-is-recurring").checked;

    const frequency =
        isRecurring
            ? document.getElementById("list-frequency").value
            : null;

    const intervalValue =
        isRecurring
            ? Number(document.getElementById("list-interval-value").value)
            : null;

    if (!name) {
        document.getElementById("list-message").textContent =
            "List name cannot be empty";
        return;
    }

    if (isRecurring && !dueAt) {
        document.getElementById("list-message").textContent =
            "Recurring lists need a due date";
        return;
    }

    const listData = {
        name,
        color: selectedListColor,
        icon: selectedListIcon,
        dueAt
    };

    if (isRecurring) {
        listData.isRecurring = true;
        listData.frequency = frequency;
        listData.intervalValue = intervalValue;
    }

    await sendListRequest("/lists", "POST", listData);
};

const createTaskInList = async (listId) => {
    const title =
        document
            .getElementById("list-task-title")
            .value
            .trim();

    if (!title) {
        document.getElementById("list-message").textContent =
            "Task title cannot be empty";
        return;
    }

    try {
        const response = await apiFetch(`/lists/${listId}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create task");
        }

        await openList(listId);

    } catch (error) {
        document.getElementById("list-message").textContent =
            error.message;
    }
};

const formatDateInputValue = (dateString) => {
    if (!dateString) {
        return "";
    }

    return dateString.split("T")[0];
};

const formatListDate = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);
    const today = new Date();

    const diffInMs = today - date;
    const diffInDays =
        Math.floor(diffInMs / (1000 * 60 * 60 * 24));

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
    document.getElementById("lists-search");

if (searchInput) {

    searchInput.addEventListener("input", async (event) => {

        const query =
            event.target.value.toLowerCase();

        const filteredLists =
            currentLists.filter(list =>
                (list.name || "")
                    .toLowerCase()
                    .includes(query)
            );

        await renderLists(filteredLists, query);
    });

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeListSearch();
        }
    });
}

loadLists();