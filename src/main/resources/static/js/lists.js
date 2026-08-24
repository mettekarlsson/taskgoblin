
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
            ${color === DEFAULT_LIST_COLOR ? t("defaultColor") : ""}
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

let currentListFilter = "all";

let listToDeleteId = null;

const setListFilter = (filter) => {

    currentListFilter = filter;

    document
        .querySelectorAll(".list-filter")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        });

    renderLists(currentLists);
};

const isListOverdue = (list) => {
    if (!list.dueAt || list.status === "DONE") {
        return false;
    }

    const dueDate = new Date(list.dueAt);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
};

const isListDueToday = (list) => {
    if (!list.dueAt || list.status === "DONE") {
        return false;
    }

    const dueDate = new Date(list.dueAt);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate.getTime() === today.getTime();
};

const isListUpcoming = (list) => {
    if (!list.dueAt || list.status === "DONE") {
        return false;
    }

    const dueDate = new Date(list.dueAt);
    const tomorrow = new Date();

    dueDate.setHours(0, 0, 0, 0);

    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return dueDate >= tomorrow;
};

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
                ${searchQuery ? t("noListsMatchSearch") : t("noListsYet")}
            </p>
        `;

        return;
    }

    let filteredLists = lists;

    if (currentListFilter === "today") {
        filteredLists = lists.filter(isListDueToday);
    }

    if (currentListFilter === "overdue") {
        filteredLists = lists.filter(isListOverdue);
    }

    if (currentListFilter === "upcoming") {
        filteredLists = lists.filter(isListUpcoming);
    }

    if (currentListFilter === "completed") {
        filteredLists = lists.filter(
            list => list.status === "DONE"
        );
    }

    const cards = await Promise.all(
        filteredLists.map(async list => {

            const tasks = await loadTasksForList(list.id);

            const listIcon =
                getListIconEmoji(list.icon);

            const listColor =
                list.color || DEFAULT_LIST_COLOR;

            const overdueDays =
                getOverdueDays(list.dueAt);

            const listCompleted =
                isCurrentOccurrenceCompleted(list);

            const previewTasks = tasks
                .slice(0, 4)
                .map(task => `
                    <div class="list-task-preview ${task.status === "DONE" ? "done" : ""}">
                        ${task.status === "DONE" ? "✓" : "○"} ${task.title}
                    </div>
                `)
                .join("");
            const hasMoreTasks =
                tasks.length > 4;

            return `
<article
    class="list-card ${listCompleted ? "completed" : ""}"
    onclick="openList(${list.id})"
    style="background: ${listColor};"
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
                `<p class="list-task-preview">${t("noTasksYet")}</p>`
            }

    ${
                tasks.length > 4
                    ? `
                <div
                    class="list-tasks-fade"
                    style="--list-color: ${listColor};"
                ></div>
            `
                    : ""
            }
</div>

${
                overdueDays > 0
                    ? `
            <div class="list-overdue">
                ⚠ ${overdueDays} ${
                        overdueDays === 1
                            ? t("dayOverdue")
                            : t("daysOverdue")
                    }
            </div>
        `
                    : ""
            }

${
                list.dueAt && overdueDays === 0
                    ? `
            <div class="${
                        listCompleted && list.isRecurring
                            ? "list-completed-status"
                            : "list-due-status"
                    }">
                ${
                        listCompleted && list.isRecurring
                            ? `${t("nextOccurrence")} ${formatListDate(list.dueAt)}`
                            : formatUpcomingDueDate(list.dueAt)
                    }
            </div>
        `
                    : ""
            }

<div class="list-footer">

    <div class="list-footer-info">
        <span>
            ${tasks.length} ${t("tasksCount")}
        </span>

        ${
                list.isRecurring
                    ? `
                    <span>
                        ↻ ${formatRecurrence(
                        list.frequency,
                        list.intervalValue
                    )}
                    </span>
                `
                    : ""
            }
    </div>
    
    <div class="list-footer-actions">

        <button
    class="list-complete-check ${listCompleted ? "checked" : ""}"
    onclick="${
                listCompleted && list.isRecurring
                    ? `undoListCompletionFromOverview(event, ${list.id})`
                    : `completeListFromOverview(event, ${list.id})`
            }"
    aria-label="${
                listCompleted && list.isRecurring
                    ? t("undoCompletion")
                    : t("completeList")
            }"
>
    ${listCompleted ? "✓" : ""}
</button>

        <button
            class="list-trash-btn"
            onclick="openDeleteListModal(event, ${list.id})"
            aria-label="${t("deleteList")}"
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

</div>

</article>
`;
        })
    );

    listsGrid.innerHTML = cards.join("");
};

const toggleListPinned = async (event, listId) => {
    event.stopPropagation();

    const list =
        currentLists.find(list => list.id === listId);

    if (!list) {
        return;
    }

    try {
        const response = await apiFetch(
            `/lists/${listId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pinned: !list.pinned
                })
            }
        );

        if (!response.ok) {
            throw new Error(t("failedToUpdateList"));
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
                t("failedToSaveList")
            );
        }

        await loadLists();

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
            throw new Error(t("failedToLoadList"));
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

    const listCompleted =
        isCurrentOccurrenceCompleted(list);

    const sortedTasks = [...tasks].sort((a, b) => {
        const aCompleted =
            a.status === "DONE";

        const bCompleted =
            b.status === "DONE";

        return aCompleted - bCompleted;
    });

    listsGrid.innerHTML = `
<section class="list-detail-card" data-list-id="${list.id}" style="background: ${listColor};">

    <div class="list-detail-header">

        <button
            class="list-cancel-btn"
            onclick="closeListDetail()"
        >
            ← ${t("back")}
        </button>

        <button
            class="list-save-btn"
            onclick="renderEditListForm(null, ${list.id})"
        >
            ${t("edit")}
        </button>

    </div>

    <div class="list-detail-title">

        <span class="list-card-icon">
            ${listIcon}
        </span>

        <h2>${list.name}</h2>

    </div>
<div class="list-detail-schedule">
    ${formatListSchedule(list)}
</div>
    <div class="list-detail-tasks">

        ${
        tasks.length
            ? sortedTasks.map(task => {
                const isVisuallyCompleted =
                    task.status === "DONE";
                return `
    <div class="list-detail-task ${isVisuallyCompleted ? "done" : ""}">

        <button
            class="list-task-check ${isVisuallyCompleted ? "checked" : ""}"
            onclick="toggleTaskComplete(event, ${task.id}, '${task.status}')"
            aria-label="${t("completeTask")}"
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
                        ${t("lastCompleted")} ${formatListDate(task.lastCompletedAt)}
                    </span>`
                        : ""
                }

        </div>

    </div>
`;
            }).join("")
            : `<p class="list-task-preview">${t("noTasksYet")}</p>`
    }

    </div>

    <button
        class="list-add-task-btn"
        onclick="renderCreateTaskInListForm(${list.id})"
    >
        ${t("addTask")}
    </button>

    <div id="create-task-in-list-container"></div>
    
    <button
    class="list-complete-btn"
    onclick="${
        listCompleted && list.isRecurring
            ? `undoListCompletion(${list.id})`
            : `completeList(${list.id})`
    }"
>
    ${
        listCompleted && list.isRecurring
            ? t("undoCompletion")
            : t("completeList")
    }
</button>

    <div class="list-detail-footer">

        <div class="list-detail-meta">

            <span>
                ${t("created")}:
                ${formatListDate(list.createdAt)}
            </span>

            <span>
                ${t("updated")}:
                ${formatListDate(
        list.lastInteractedAt || list.createdAt
    )}
            </span>

        </div>

        <button
            class="list-delete-btn"
            onclick="openDeleteListModal(null, ${list.id})"
        >
            ${t("delete")}
        </button>

    </div>

</section>
`;
};

//Helper

const getCurrentLocale = () => {
    return currentSettings?.language === "sv"
        ? "sv-SE"
        : "en-GB";
};

const formatDueDate = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
        Math.round(
            (dueDate - today) /
            (1000 * 60 * 60 * 24)
        );

    if (diff === 0) {
        return t("dueToday");
    }

    if (diff === 1) {
        return t("dueTomorrow");
    }

    if (diff < 0) {
        const daysOverdue = Math.abs(diff);

        return `${daysOverdue} ${
            daysOverdue === 1
                ? t("dayOverdue")
                : t("daysOverdue")
        }`;
    }

    return `${t("due")} ${formatListDate(dateString)}`;
};

const formatUpcomingDueDate = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
        Math.round(
            (dueDate - today) /
            (1000 * 60 * 60 * 24)
        );

    if (diff === 0) {
        return t("today");
    }

    if (diff === 1) {
        return t("tomorrow");
    }

    return formatListDate(dateString);
};

const getOverdueDays = (dateString) => {
    if (!dateString) {
        return 0;
    }

    const dueDate = new Date(dateString);
    const today = new Date();

    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
        Math.floor(
            (today - dueDate) /
            (1000 * 60 * 60 * 24)
        );

    return diff > 0
        ? diff
        : 0;
};

const formatListSchedule = (list) => {
    const parts = [];

    if (list.isRecurring) {
        parts.push(`↻ ${formatRecurrence(list.frequency, list.intervalValue)}`);
    }

    if (list.dueAt) {
        parts.push(formatDueDate(list.dueAt));
    }

    return parts.join(" · ");
};

const formatRecurrence = (frequency, intervalValue) => {

    if (intervalValue === 1) {
        switch (frequency) {
            case "DAILY":
                return t("daily");

            case "WEEKLY":
                return t("weekly");

            case "MONTHLY":
                return t("monthly");

            case "YEARLY":
                return t("yearly");

            default:
                return "";
        }
    }

    let key;

    switch (frequency) {
        case "DAILY":
            key = "everyNDays";
            break;

        case "WEEKLY":
            key = "everyNWeeks";
            break;

        case "MONTHLY":
            key = "everyNMonths";
            break;

        case "YEARLY":
            key = "everyNYears";
            break;

        default:
            return "";
    }

    return t(key).replace("{n}", intervalValue);
};

const isCurrentOccurrenceCompleted = (list) => {
    return list.status === "DONE";
};

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
            throw new Error(t("failedToUpdateTask"));
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

const completeList = async (listId, reopenDetail = true) => {
    try {
        const response = await apiFetch(
            `/lists/${listId}/complete`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw new Error(t("failedToCompleteList"));
        }

        await loadLists();

        if (reopenDetail) {
            await openList(listId);
        }

    } catch (error) {
        listsGrid.innerHTML = `
            <p class="lists-error">
                ${error.message}
            </p>
        `;
    }
};

const undoListCompletion = async (listId) => {
    try {
        const response = await apiFetch(
            `/lists/${listId}/undo-complete`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw new Error(t("failedToUndoListCompletion"));
        }

        await loadLists();
        await openList(listId);

    } catch (error) {
        listsGrid.innerHTML = `
            <p class="lists-error">
                ${error.message}
            </p>
        `;
    }
};

const completeListFromOverview = async (event, listId) => {
    event.preventDefault();
    event.stopPropagation();

    await completeList(listId, false);
};
const undoListCompletionFromOverview = async (event, listId) => {
    event.preventDefault();
    event.stopPropagation();

    try {
        const response = await apiFetch(
            `/lists/${listId}/undo-complete`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            throw new Error(t("failedToUndoListCompletion"));
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
const renderCreateTaskInListForm = (listId) => {
    document.getElementById("create-task-in-list-container").innerHTML = `
        <section class="list-task-form">

            <label for="list-task-title">${t("title")}</label>

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
                    ${t("save")}
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="document.getElementById('create-task-in-list-container').innerHTML = ''"
                >
                    ${t("cancel")}
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
                t("failedToDeleteList")
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

            <h2>${t("addList")}</h2>

            <label for="list-name">${t("name")}</label>
            <input id="list-name" class="list-input" type="text">

            <label>${t("color")}</label>

            <div class="list-color-options">
                ${renderListColorChips()}
            </div>

            <label>${t("icon")}</label>

            <button
                type="button"
                id="selected-list-icon-btn"
                class="list-icon-picker-btn"
                onclick="toggleIconPicker()"
            >
               ${getListIconEmoji(selectedListIcon)} ${t("chooseIcon")}
            </button>

            <div
                id="list-icon-picker"
                class="list-icon-picker"
            >
                ${renderIconOptions()}
            </div>

            <label for="list-due-at">${t("dueDate")}</label>
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
                ${t("recurringList")}
            </label>

            <div
                id="list-recurring-options"
                class="list-recurring-options"
            >

               <label for="list-interval-value">
    ${t("repeatEvery")}
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
                        <option value="DAILY">${t("day")}</option>
<option value="WEEKLY">${t("week")}</option>
<option value="MONTHLY">${t("month")}</option>
<option value="YEARLY">${t("year")}</option>
                    </select>

                </div>

            </div>

            <p id="list-message" class="list-message"></p>

            <div class="list-form-actions">

                <button
                    class="list-save-btn"
                    onclick="createList()"
                >
                    ${t("save")}
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="renderLists(currentLists)"
                >
                    ${t("cancel")}
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

            <h2>${t("editList")}</h2>

            <label for="list-name">${t("name")}</label>
            <input
                id="list-name"
                class="list-input"
                type="text"
                value="${list.name || ""}"
            >

            <label>${t("color")}</label>

            <div class="list-color-options">
                ${renderListColorChips()}
            </div>

            <label>${t("icon")}</label>

            <button
                type="button"
                id="selected-list-icon-btn"
                class="list-icon-picker-btn"
                onclick="toggleIconPicker()"
            >
                ${getListIconEmoji(selectedListIcon)} ${t("chooseIcon")}
            </button>

            <div
                id="list-icon-picker"
                class="list-icon-picker"
            >
                ${renderIconOptions()}
            </div>

            <label for="list-due-at">${t("dueDate")}</label>
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
                ${t("recurringList")}
            </label>

            <div
                id="list-recurring-options"
                class="list-recurring-options ${list.isRecurring ? "open" : ""}"
            >

                <label for="list-interval-value">
                    ${t("repeatEvery")}
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
                            ${t("day")}
                        </option>

                        <option value="WEEKLY" ${list.frequency === "WEEKLY" ? "selected" : ""}>
                            ${t("week")}
                        </option>

                        <option value="MONTHLY" ${list.frequency === "MONTHLY" ? "selected" : ""}>
                            ${t("month")}
                        </option>

                        <option value="YEARLY" ${list.frequency === "YEARLY" ? "selected" : ""}>
                            ${t("year")}
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
                    ${t("save")}
                </button>

                <button
                    class="list-cancel-btn"
                    onclick="openList(${list.id})"
                >
                    ${t("cancel")}
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
            t("listNameCannotBeEmpty");
        return;
    }

    if (isRecurring && !dueAt) {
        document.getElementById("list-message").textContent =
            t("recurringListNeedsDueDate");
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
                error.message || t("failedToUpdateList")
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
        `${selected.emoji} ${t("chooseIcon")}`;

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
            t("listNameCannotBeEmpty");
        return;
    }

    if (isRecurring && !dueAt) {
        document.getElementById("list-message").textContent =
            t("recurringListNeedsDueDate");
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
            t("taskTitleCannotBeEmpty");
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
            throw new Error(t("failedToCreateTask"));
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
        return t("today");
    }

    if (diffInDays === 1) {
        return t("yesterday");
    }

    return date.toLocaleDateString(getCurrentLocale(), {
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

// Runs automatically when the page loads.
const initListsPage = async () => {

    // Reloads lists from backend.
    await loadLists();

    // Opens the create list form when triggered from the quick add menu.
    const quickAdd =
        new URLSearchParams(window.location.search)
            .get("quickAdd");

    if (quickAdd === "true") {
        renderCreateListForm();
    }

};

initListsPage();