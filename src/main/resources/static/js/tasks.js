const taskContent =
    document.getElementById("task-content");

let currentTasks = [];

let currentTaskFilter = "all";

let taskToDeleteId = null;

const setTaskFilter = (filter) => {

    currentTaskFilter = filter;

    document
        .querySelectorAll(".task-filter")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        });

    const searchInput =
        document.getElementById("tasks-search");

    const query =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const filteredTasks =
        currentTasks.filter(task =>
            (task.title || "")
                .toLowerCase()
                .includes(query)
        );

    renderTasks(filteredTasks);
};

// Formats backend date into readable text.
const formatDate = (dateString) => {

    if (!dateString) {
        return t("noDueDate");
    }

    const date =
        new Date(dateString);

    const today =
        new Date();

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff =
        Math.round(
            (date - today) /
            (1000 * 60 * 60 * 24)
        );

    if (diff === 0) {
        return t("today");
    }

    if (diff === 1) {
        return t("tomorrow");
    }

    if (diff === -1) {
        return t("yesterday");
    }

    return date.toLocaleDateString(
        currentSettings?.language === "sv"
            ? "sv-SE"
            : "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
};

const getStartOfToday = () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
};


const getStartOfTomorrow = () => {

    const tomorrow = getStartOfToday();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return tomorrow;
};

const sortTasksByDueDate = (tasks) => {

    return [...tasks].sort((a, b) => {

        if (!a.dueAt && !b.dueAt) {
            return 0;
        }

        if (!a.dueAt) {
            return 1;
        }

        if (!b.dueAt) {
            return -1;
        }

        return new Date(a.dueAt) - new Date(b.dueAt);
    });
};

const isTaskOverdue = (task) => {

    if (!task.dueAt) {
        return false;
    }

    const dueDate =
        new Date(task.dueAt);

    return dueDate < getStartOfToday();
};

const getTaskOverdueDays = (dateString) => {

    if (!dateString) {
        return 0;
    }

    const dueDate =
        new Date(dateString);

    const today =
        new Date();

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

const isTaskDueToday = (task) => {

    if (!task.dueAt) {
        return false;
    }

    const dueDate =
        new Date(task.dueAt);

    return (
        dueDate >= getStartOfToday() &&
        dueDate < getStartOfTomorrow()
    );
};


const isTaskUpcoming = (task) => {

    if (!task.dueAt) {
        return false;
    }

    const dueDate =
        new Date(task.dueAt);

    return dueDate >= getStartOfTomorrow();
};

const toggleTaskMenu = (event, taskId) => {

    event.stopPropagation();

    document
        .querySelectorAll(".task-action-menu")
        .forEach(menu => {

            if (
                menu.id !==
                `task-menu-${taskId}`
            ) {

                menu.classList.remove("open");

            }

        });

    document
        .getElementById(
            `task-menu-${taskId}`
        )
        .classList.toggle("open");

};

const toggleTaskSearch = () => {

    const searchView =
        document.getElementById("tasks-search-view");

    const searchInput =
        document.getElementById("tasks-search");

    const isOpen =
        searchView.classList.contains("open");

    if (isOpen) {
        closeTaskSearch();
        return;
    }

    searchView.classList.add("open");

    searchInput.value = "";
    searchInput.focus();

    renderTasks();
};

const closeTaskSearch = () => {

    document
        .getElementById("tasks-search-view")
        .classList.remove("open");

    document
        .getElementById("tasks-search")
        .value = "";

    renderTasks();
};

// Loads all tasks for the current user.
const loadTasks = async () => {

    const taskFilters =
        document.querySelector(".task-filters");

    if (taskFilters) {
        taskFilters.style.display = "";
    }

    try {

        const response =
            await apiFetch("/tasks");

        if (!response.ok) {
            throw new Error(t("failedToLoadTasks"));
        }

        const tasks =
            await response.json();

        currentTasks =
            tasks.filter(
                task => task.listId == null
            );

        renderTasks();

    } catch (error) {

        taskContent.innerHTML = `
            <p>${error.message}</p>
        `;

    }

};

// Renders all tasks to the page.
const renderTasks = (tasks = currentTasks) => {

    // Shows message if there are no tasks.
    if (tasks.length === 0) {

        const searchQuery =
            document
                .getElementById("tasks-search")
                ?.value
                .trim();

        taskContent.innerHTML = `
        <p class="tasks-empty">
            ${searchQuery
            ? t("noTasksMatchSearch")
            : t("noTasksYet")}
        </p>
    `;

        return;
    }

    // Splits active and completed tasks.
    const activeTasks =
        tasks.filter(
            task => task.status !== "DONE"
        );

    const completedTasks =
        tasks.filter(
            task => task.status === "DONE"
        );

    const overdueTasks =
        activeTasks.filter(
            task => isTaskOverdue(task)
        );

    const todayTasks =
        activeTasks.filter(
            task => isTaskDueToday(task)
        );

    const upcomingTasks =
        activeTasks.filter(
            task => isTaskUpcoming(task)
        );

    const noDueDateTasks =
        activeTasks.filter(
            task => !task.dueAt
        );

    // Renders a single task row.
    const renderTaskRow = (task) => {

        const overdueDays =
            task.status !== "DONE"
                ? getTaskOverdueDays(task.dueAt)
                : 0;

        const priorityClass =
            task.priority?.toLowerCase() || "none";

        return `
        <div class="task-row ${task.status === "DONE" ? "completed" : ""}">

            <div class="task-row-main">

                <button
                    class="task-status-btn
                        ${task.status === "DONE" ? "completed" : ""}"
                    data-task-id="${task.id}"
                    onclick="
                        ${task.status === "DONE"
            ? (
                task.isRecurring
                    ? `undoTaskCompletion(${task.id})`
                    : `reopenTask(${task.id})`
            )
            : `completeTask(${task.id})`}
                    "
                >
                    <span class="task-status-icon">
                        ${task.status === "DONE" ? "✓" : ""}
                    </span>
                </button>

                <div class="task-title-content">

                    <h3 class="task-row-title">
                        ${task.title}
                    </h3>

                    ${
            task.isRecurring && task.lastCompletedAt
                ? `
                                <span class="task-last-completed">
                                    ${t("lastCompleted")} ${formatDate(task.lastCompletedAt)}
                                </span>
                            `
                : ""
        }

                </div>

            </div>

            <div class="task-row-footer">

                ${
            task.status === "DONE"
            && task.isRecurring
            && task.dueAt
                ? `
            <div class="task-next-occurrence">
                ${t("nextOccurrence")} ${formatDate(task.dueAt)}
            </div>
        `
                : overdueDays > 0
                    ? `
                <div class="task-overdue">
                    ⚠ ${overdueDays} ${
                        overdueDays === 1
                            ? t("dayOverdue")
                            : t("daysOverdue")
                    }
                </div>
            `
                    : task.dueAt
                        ? `
                    <p class="task-row-date">
                        ${formatDate(task.dueAt)}
                    </p>
                `
                        : ""
        }

                <div class="task-row-footer-right">

                    ${
            task.priority && task.priority !== "NONE"
                ? `
                                <span class="priority-badge ${priorityClass}">
                                    ${t(task.priority.toLowerCase())}
                                </span>
                            `
                : ""
        }

                    <button
                        class="task-edit-btn"
                        onclick="openUpdateTaskModal(${task.id})"
                        aria-label="${t("updateTask")}"
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M4 20H8L19 9L15 5L4 16V20Z" />
                            <path d="M13.5 6.5L17.5 10.5" />
                        </svg>
                    </button>

                    <button
                        class="task-delete-btn"
                        onclick="openDeleteTaskModal(${task.id})"
                        aria-label="${t("deleteTask")}"
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

        </div>
    `;
    };

    const renderTaskSection = (
        title,
        tasks
    ) => {

        if (tasks.length === 0) {
            return "";
        }

        const sortedTasks =
            sortTasksByDueDate(tasks);

        return `
        <div class="task-section">

            <h2 class="task-section-title">
                ${title}
            </h2>

            <div class="task-section-list">
                ${sortedTasks
            .map(renderTaskRow)
            .join("")}
            </div>

        </div>
    `;
    };

    const renderEmptyTasks = () => {
        return `
        <p class="tasks-empty">
            ${t("noTasksYet")}
        </p>
    `;
    };

    if (currentTaskFilter === "today") {

        taskContent.innerHTML =
            todayTasks.length > 0
                ? renderTaskSection(
                    t("today"),
                    todayTasks
                )
                : renderEmptyTasks();

        return;
    }

    if (currentTaskFilter === "overdue") {

        taskContent.innerHTML =
            overdueTasks.length > 0
                ? renderTaskSection(
                    t("overdue"),
                    overdueTasks
                )
                : renderEmptyTasks();

        return;
    }

    if (currentTaskFilter === "upcoming") {

        taskContent.innerHTML =
            upcomingTasks.length > 0
                ? renderTaskSection(
                    t("upcoming"),
                    upcomingTasks
                )
                : renderEmptyTasks();

        return;
    }


    if (currentTaskFilter === "completed") {

        taskContent.innerHTML =
            completedTasks.length > 0
                ? renderTaskSection(
                    t("completed"),
                    completedTasks
                )
                : renderEmptyTasks();

        return;
    }


    // Default = All
    taskContent.innerHTML = `

        ${renderTaskSection(
        t("overdue"),
        overdueTasks
    )}

        ${renderTaskSection(
        t("today"),
        todayTasks
    )}
    
    ${renderTaskSection(
        t("noDueDate"),
        noDueDateTasks
    )}

        ${renderTaskSection(
        t("upcoming"),
        upcomingTasks
    )}

        ${renderTaskSection(
        t("completed"),
        completedTasks
    )}

    `;

};

const taskSearchInput =
    document.getElementById("tasks-search");

if (taskSearchInput) {

    taskSearchInput.addEventListener("input", (event) => {

        const query =
            event.target.value
                .trim()
                .toLowerCase();

        const filteredTasks =
            currentTasks.filter(task =>
                (task.title || "")
                    .toLowerCase()
                    .includes(query)
            );

        renderTasks(filteredTasks);
    });

    taskSearchInput.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeTaskSearch();
        }

    });
}

// Runs automatically when the page loads.
const initPage = async () => {

    // Reloads tasks from backend.
    await loadTasks();

    // Opens the create task form when triggered from the quick add menu.
    const quickAdd = new URLSearchParams(window.location.search)
        .get("quickAdd");

    if (quickAdd === "true") {
        renderCreateTaskForm();
    }

};


// Creates a new task.
const createTask = async () => {

    const title =
        document.getElementById("task-title")
            .value
            .trim();

    const priorityInput =
        document.getElementById("task-priority");

    const dueDateInput =
        document.getElementById("task-due-at");

    const priority =
        priorityInput
            ? priorityInput.value
            : "NONE";

    const dueDate =
        dueDateInput
            ? dueDateInput.value
            : null;

    const dueAt =
        dueDate
            ? `${dueDate}T00:00:00`
            : null;

    const isRecurringInput =
        document.getElementById("task-is-recurring");

    const isRecurring =
        isRecurringInput
            ? isRecurringInput.checked
            : false;

    const frequency =
        isRecurring
            ? document.getElementById("task-frequency").value
            : null;

    const intervalValue =
        isRecurring
            ? Number(
                document.getElementById("task-interval-value").value
            )
            : null;

    if (!title) {

        document
            .getElementById("task-message")
            .textContent =
            t("taskTitleRequired");

        return;
    }

    if (isRecurring && !dueAt) {

        document
            .getElementById("task-message")
            .textContent =
            t("recurringTaskNeedsDueDate");

        return;
    }

    try {

        const taskData = {
            title,
            priority,
            dueAt,
            isRecurring
        };

        if (isRecurring) {
            taskData.frequency = frequency;
            taskData.intervalValue = intervalValue;
        }

        const response =
            await apiFetch("/tasks", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(taskData)
            });

        if (!response.ok) {
            throw new Error(
                t("failedToCreateTask")
            );
        }

        // Clears the input field after successful creation.
        document.getElementById("task-title")
            .value = "";

        // Reloads tasks from backend.
        await loadTasks();

        // Returns to the page where quick add was opened.
        const returnTo =
            new URLSearchParams(window.location.search)
                .get("returnTo");

        if (returnTo) {
            window.location.href = returnTo;
        }

    } catch (error) {

        document
            .getElementById("task-message")
            .textContent =
            error.message;

    }
};


// Marks a task as completed.
const completeTask = async (taskId) => {

    try {

        const response =
            await apiFetch(
                `/tasks/${taskId}/complete`,
                {
                    method: "PATCH"
                }
            );

        if (!response.ok) {
            throw new Error(
                t("failedToUpdateTask")
            );
        }

        await loadTasks();

    } catch (error) {

        alert(error.message);

    }
};

const undoTaskCompletion = async (taskId) => {

    try {

        const response =
            await apiFetch(
                `/tasks/${taskId}/undo-complete`,
                {
                    method: "PATCH"
                }
            );

        if (!response.ok) {
            throw new Error(
                t("failedToUndoCompletion")
            );
        }

        await loadTasks();

    } catch (error) {

        alert(error.message);

    }
};

// Reopens a completed task.
const reopenTask = async (taskId) => {

    try {

        const response =
            await apiFetch(`/tasks/${taskId}/reopen`, {
                method: "PATCH"
            });

        if (!response.ok) {
            throw new Error("Failed to reopen task");
        }

        // Reload tasks after update.
        await loadTasks();

    } catch (error) {

        alert(error.message);

    }

};

// Deletes a task.
        const openDeleteTaskModal = (taskId) => {
            taskToDeleteId = taskId;

            document
                .getElementById("delete-task-modal")
                .classList.add("open");
        };

        const closeDeleteTaskModal = () => {
            taskToDeleteId = null;

            document
                .getElementById("delete-task-modal")
                .classList.remove("open");
        };

        const confirmDeleteTask = async () => {

            if (!taskToDeleteId) {
                return;
            }

            try {

                const response =
                    await apiFetch(
                        `/tasks/${taskToDeleteId}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        t("failedToDeleteTask")
                    );
                }

                await loadTasks();

                closeDeleteTaskModal();

            } catch (error) {
                alert(error.message);
            }
        };

const openUpdateTaskModal = (taskId) => {

    const task =
        currentTasks.find(
            task => task.id === taskId
        );

    if (!task) {
        return;
    }

    document
        .querySelector(".task-filters")
        .style.display = "none";

    const dueDate =
        task.dueAt
            ? task.dueAt.split("T")[0]
            : "";

    taskContent.innerHTML = `
        <section class="task-form-card">

            <h2>${t("updateTask")}</h2>

            <label for="task-title">
                ${t("title")}
            </label>

            <input
                id="task-title"
                class="task-input"
                type="text"
                value="${task.title || ""}"
            >

            <button
                class="task-details-btn"
                onclick="toggleUpdateTaskDetails(${task.id})"
            >
                ${t("addMoreDetails")} ⌄
            </button>

            <div id="task-extra-fields"></div>

            <p
    id="task-message"
    class="task-message"
></p>

            <div class="task-form-actions">

                <button
                    class="task-save-btn"
                    onclick="updateTask(${task.id})"
                >
                    ${t("save")}
                </button>

                <button
                    class="task-cancel-btn"
                    onclick="loadTasks()"
                >
                    ${t("cancel")}
                </button>

            </div>

        </section>
    `;
};

const toggleUpdateTaskDetails = (taskId) => {

    const container =
        document.getElementById(
            "task-extra-fields"
        );

    const button =
        document.querySelector(
            ".task-details-btn"
        );

    const isOpen =
        container.innerHTML.trim() !== "";

    if (isOpen) {

        container.innerHTML = "";

        button.textContent =
            `${t("addMoreDetails")} ⌄`;

        return;
    }

    const task =
        currentTasks.find(
            task => task.id === taskId
        );

    if (!task) {
        return;
    }

    const dueDate =
        task.dueAt
            ? task.dueAt.split("T")[0]
            : "";

    const priority =
        task.priority || "NONE";

    container.innerHTML = `
        <label>
            ${t("priority")}
        </label>

        <div class="task-priority-options">

            <button
                type="button"
                class="task-priority-chip none
                    ${priority === "NONE" ? "selected" : ""}"
                data-priority="NONE"
                onclick="selectTaskPriority(this)"
            >
                ${t("none")}
            </button>

            <button
                type="button"
                class="task-priority-chip low
                    ${priority === "LOW" ? "selected" : ""}"
                data-priority="LOW"
                onclick="selectTaskPriority(this)"
            >
                ${t("low")}
            </button>

            <button
                type="button"
                class="task-priority-chip medium
                    ${priority === "MEDIUM" ? "selected" : ""}"
                data-priority="MEDIUM"
                onclick="selectTaskPriority(this)"
            >
                ${t("medium")}
            </button>

            <button
                type="button"
                class="task-priority-chip high
                    ${priority === "HIGH" ? "selected" : ""}"
                data-priority="HIGH"
                onclick="selectTaskPriority(this)"
            >
                ${t("high")}
            </button>

        </div>

        <input
            type="hidden"
            id="task-priority"
            value="${priority}"
        >

        <label for="task-due-at">
            ${t("dueDate")}
        </label>

        <input
            id="task-due-at"
            class="task-input"
            type="date"
            value="${dueDate}"
        >

        <label class="task-checkbox-row">

            <input
                id="task-is-recurring"
                type="checkbox"
                onchange="toggleTaskRecurringOptions()"
                ${task.isRecurring ? "checked" : ""}
            >

            ${t("recurringTask")}

        </label>

        <div
            id="task-recurring-options"
            class="task-recurring-options
                ${task.isRecurring ? "open" : ""}"
        >

            <label for="task-interval-value">
                ${t("repeatEvery")}
            </label>

            <div class="task-recurring-row">

                <input
                    id="task-interval-value"
                    class="task-input"
                    type="number"
                    min="1"
                    value="${task.intervalValue || 1}"
                >

                <select
                    id="task-frequency"
                    class="task-input"
                >
                    <option
                        value="DAILY"
                        ${task.frequency === "DAILY" ? "selected" : ""}
                    >
                        ${t("day")}
                    </option>

                    <option
                        value="WEEKLY"
                        ${task.frequency === "WEEKLY" ? "selected" : ""}
                    >
                        ${t("week")}
                    </option>

                    <option
                        value="MONTHLY"
                        ${task.frequency === "MONTHLY" ? "selected" : ""}
                    >
                        ${t("month")}
                    </option>

                    <option
                        value="YEARLY"
                        ${task.frequency === "YEARLY" ? "selected" : ""}
                    >
                        ${t("year")}
                    </option>
                </select>

            </div>

        </div>
    `;

    button.textContent =
        `${t("lessDetails")} ⌃`;
};

const updateTask = async (taskId) => {

    const existingTask =
        currentTasks.find(
            task => task.id === taskId
        );

    if (!existingTask) {
        return;
    }

    const title =
        document
            .getElementById("task-title")
            .value
            .trim();

    const priorityInput =
        document.getElementById("task-priority");

    const dueDateInput =
        document.getElementById("task-due-at");

    const recurringInput =
        document.getElementById("task-is-recurring");

    /*
     If More details was never opened,
     keep the task's existing values.
    */
    const priority =
        priorityInput
            ? priorityInput.value
            : existingTask.priority;

    const dueAt =
        dueDateInput
            ? (
                dueDateInput.value
                    ? `${dueDateInput.value}T00:00:00`
                    : null
            )
            : existingTask.dueAt;

    const isRecurring =
        recurringInput
            ? recurringInput.checked
            : existingTask.isRecurring;

    const frequency =
        isRecurring
            ? (
                document.getElementById("task-frequency")?.value
                ?? existingTask.frequency
            )
            : null;

    const intervalValue =
        isRecurring
            ? Number(
                document.getElementById("task-interval-value")?.value
                ?? existingTask.intervalValue
            )
            : null;

    const existingDueDate =
        existingTask.dueAt
            ? existingTask.dueAt.split("T")[0]
            : null;

    const newDueDate =
        dueAt
            ? dueAt.split("T")[0]
            : null;

    const dueDateChanged =
        newDueDate !== existingDueDate;

    const taskWasOverdue =
        isTaskOverdue(existingTask);

    const changedSomethingOtherThanDueDate =
        title !== existingTask.title
        ||
        priority !== (existingTask.priority || "NONE")
        ||
        isRecurring !== existingTask.isRecurring
        ||
        frequency !== existingTask.frequency
        ||
        intervalValue !== existingTask.intervalValue;

    if (
        taskWasOverdue
        &&
        changedSomethingOtherThanDueDate
        &&
        !dueDateChanged
    ) {

        document
            .getElementById("task-message")
            .textContent =
            t("cannotEditOverdueTask");

        return;
    }

    if (!title) {

        alert(t("taskTitleRequired"));

        return;
    }

    if (isRecurring && !dueAt) {

        alert(
            t("recurringTaskNeedsDueDate")
        );

        return;
    }

    const taskData = {
        title,
        dueAt,
        priority,
        categoryId:
            existingTask.categoryId ?? null,
        taskListId:
            existingTask.listId ?? null,
        isRecurring,
        frequency,
        intervalValue
    };

    try {

        const response =
            await apiFetch(
                `/tasks/${taskId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(taskData)
                }
            );

        if (!response.ok) {
            throw new Error(
                t("failedToUpdateTask")
            );
        }

        await loadTasks();

    } catch (error) {

        alert(error.message);

    }
};

// Shows or hides additional task fields.
const toggleTaskDetailsForm = () => {

    const container =
        document.getElementById(
            "task-extra-fields"
        );

    const button =
        document.querySelector(
            ".task-details-btn"
        );

    const isOpen =
        container.innerHTML.trim() !== "";

    if (isOpen) {

        container.innerHTML = "";

        button.textContent =
            `${t("addMoreDetails")} ⌄`;

        return;
    }

    container.innerHTML = `

        <div class="task-extra-fields">

            <label for="task-priority">
                ${t("priority")}
            </label>

            <div class="task-priority-options">

    <button
        type="button"
        class="task-priority-chip none selected"
        data-priority="NONE"
        onclick="selectTaskPriority(this)"
    >
        ${t("none")}
    </button>

    <button
        type="button"
        class="task-priority-chip low"
        data-priority="LOW"
        onclick="selectTaskPriority(this)"
    >
        ${t("low")}
    </button>

    <button
        type="button"
        class="task-priority-chip medium"
        data-priority="MEDIUM"
        onclick="selectTaskPriority(this)"
    >
        ${t("medium")}
    </button>

    <button
        type="button"
        class="task-priority-chip high"
        data-priority="HIGH"
        onclick="selectTaskPriority(this)"
    >
        ${t("high")}
    </button>

</div>

<input
    type="hidden"
    id="task-priority"
    value="NONE"
>

            <label for="task-due-at">
                ${t("dueDate")}
            </label>

            <input
                id="task-due-at"
                class="task-input"
                type="date"
            >

        </div>
        
        <label class="task-checkbox-row">
    <input
        id="task-is-recurring"
        type="checkbox"
        onchange="toggleTaskRecurringOptions()"
    >
    ${t("recurringTask")}
</label>

<div
    id="task-recurring-options"
    class="task-recurring-options"
>

    <label for="task-interval-value">
        ${t("repeatEvery")}
    </label>

    <div class="task-recurring-row">

        <input
            id="task-interval-value"
            class="task-input"
            type="number"
            min="1"
            value="1"
        >

        <select
            id="task-frequency"
            class="task-input"
        >
            <option value="DAILY">
                ${t("day")}
            </option>

            <option value="WEEKLY">
                ${t("week")}
            </option>

            <option value="MONTHLY">
                ${t("month")}
            </option>

            <option value="YEARLY">
                ${t("year")}
            </option>
        </select>

    </div>

</div>

    `;

    button.textContent =
        `${t("lessDetails")} ⌃`;
};

const toggleTaskRecurringOptions = () => {

    const isRecurring =
        document
            .getElementById("task-is-recurring")
            .checked;

    document
        .getElementById("task-recurring-options")
        .classList
        .toggle("open", isRecurring);
};

const selectTaskPriority = (button) => {

    document
        .querySelectorAll(".task-priority-chip")
        .forEach(chip =>
            chip.classList.remove("selected")
        );

    button.classList.add("selected");

    document
        .getElementById("task-priority")
        .value =
        button.dataset.priority;
};

//_______________________________________________________//
// Renders the create task form.
const renderCreateTaskForm = () => {

    // Hide task filters when showing the form.
    document.querySelector(".task-filters").style.display = "none";

    taskContent.innerHTML = `

        <section class="task-form-card">

            <h2>${t("addTask")}</h2>

            <label for="task-title">
                ${t("task")}
            </label>

            <input
                id="task-title"
                class="task-input"
                type="text"
            >
            
            <button
                class="task-details-btn"
                onclick="toggleTaskDetailsForm()"
            >
                ${t("addMoreDetails")} ⌄
            </button>
            
            <div id="task-extra-fields"></div>

            <p
    id="task-message"
    class="task-message"
></p>

            <div class="task-form-actions">

                <button
                    class="task-save-btn"
                    onclick="createTask()"
                >
                    ${t("save")}
                </button>

                <button
                    class="task-cancel-btn"
                    onclick="cancelCreateTask()"
                >
                    ${t("cancel")}
                </button>

            </div>

        </section>

    `;
};

const cancelCreateTask = () => {

    const params =
        new URLSearchParams(window.location.search);

    const returnTo =
        params.get("returnTo");

    if (returnTo) {
        window.location.href = returnTo;
        return;
    }

    loadTasks();
};






