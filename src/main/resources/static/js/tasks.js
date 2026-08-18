const taskContent =
    document.getElementById("task-content");

let currentTasks = [];

let currentTaskFilter = "all";

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


const isTaskOverdue = (task) => {

    if (!task.dueAt) {
        return false;
    }

    const dueDate =
        new Date(task.dueAt);

    return dueDate < getStartOfToday();
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

        const priorityClass =
            task.priority?.toLowerCase() || "none";

        return `

            <div class="task-row">

                <div class="task-row-content">

                    <div class="task-main-info">

                        <div class="task-row-top">

    <div class="task-title-group">

        <button
            class="task-status-btn
                ${task.status === "DONE"
            ? "completed"
            : ""}"
            onclick="
                ${task.status === "DONE"
            ? `reopenTask(${task.id})`
            : `completeTask(${task.id})`}
            "
        >
           ${task.status === "DONE"
            ? "✓"
            : ""}
        </button>

        <h3 class="task-row-title">
            ${task.title}
        </h3>

    </div>

                            <div class="task-row-meta">

                                ${task.priority && task.priority !== "NONE"
            ? `
        <span class="priority-badge ${priorityClass}">
            ${t(task.priority.toLowerCase())}
        </span>
    `
            : ""
        }

                                <p class="task-row-date">
                                    ${formatDate(task.dueAt)}
                                </p>

                            </div>

                            <div class="task-header-actions">

    <div class="task-menu-container">

        <button
            class="task-menu-btn"
            onclick="
                toggleTaskMenu(
                    event,
                    ${task.id}
                )
            "
        >
            ⋮
        </button>

        <div
            class="task-action-menu"
            id="task-menu-${task.id}"
        >

            <button
                onclick="
                    openUpdateTaskModal(${task.id})
                "
            >
                ${t("updateTask")}
            </button>

            <button
                onclick="
                    deleteTask(${task.id})
                "
            >
                ${t("deleteTask")}
            </button>

        </div>

    </div>

</div>
                        
                    

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

        return `
    <div class="task-section">

        <h2 class="task-section-title">
            ${title}
        </h2>

        <div class="task-section-list">
            ${tasks
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
        t("upcoming"),
        upcomingTasks
    )}

        ${renderTaskSection(
        t("noDueDate"),
        noDueDateTasks
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
    await loadTasks();

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
            : null;

    const dueDate =
        dueDateInput
            ? dueDateInput.value
            : null;

    const dueAt =
        dueDate
            ? `${dueDate}T00:00:00`
            : null;

    if (!title) {

        alert(t("taskTitleRequired"));

        return;
    }

    try {

        const response =
            await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    priority,
                    dueAt
                })
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

    } catch (error) {

        alert(error.message);

    }
};


// Marks a task as completed.
const completeTask = async (taskId) => {

    try {

        const response =
            await apiFetch(`/tasks/${taskId}/complete`, {
                method: "PATCH"
            });

        if (!response.ok) {
            throw new Error("Failed to complete task");
        }

        // Reload tasks after update.
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
const deleteTask = async (taskId) => {

    const confirmed =
        confirm(t("deleteTaskConfirm"));

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await apiFetch(`/tasks/${taskId}`, {
                method: "DELETE"
            });

        if (!response.ok) {
            throw new Error(
                t("failedToDeleteTask")
            );
        }

        // Reloads tasks after deletion.
        await loadTasks();

    } catch (error) {

        alert(error.message);

    }

};

const openUpdateTaskModal = (taskId) => {

    alert(`Update task ${taskId}`);

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

    `;

    button.textContent =
        `${t("lessDetails")} ⌃`;
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

            <h2>${t("newTask")}</h2>

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

            <p id="task-message"></p>

            <div class="task-form-actions">

                <button
                    class="task-save-btn"
                    onclick="createTask()"
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






