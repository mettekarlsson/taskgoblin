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

    renderTasks();
};

// Formats backend date into readable text.
const formatDate = (dateString) => {

    if (!dateString) {
        return t("noDueDate");
    }

    return new Date(dateString)
        .toLocaleString();
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
const renderTasks = () => {

    // Shows message if there are no tasks.
    if (currentTasks.length === 0) {

        taskContent.innerHTML = `
            <p>${t("noTasksYet")}</p>
        `;

        return;
    }

    // Splits active and completed tasks.
    const activeTasks =
        currentTasks.filter(
            task => task.status !== "DONE"
        );

    const completedTasks =
        currentTasks.filter(
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
            : "○"}
        </button>

        <h3 class="task-row-title">
            ${task.title}
        </h3>

    </div>

                            <div class="task-row-meta">

                                <span class="priority-badge ${priorityClass}">
                                    ${task.priority || "NONE"}
                                </span>

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

            ${tasks
            .map(renderTaskRow)
            .join("")}

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

    if (!title) {

        alert(t("taskTitleRequired"));

        return;
    }

    try {

        const response =
            await apiFetch("/tasks", {
                method: "POST",
                body: JSON.stringify({
                    title
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

    if (container.innerHTML !== "") {

        container.innerHTML = "";

        return;
    }

    container.innerHTML = `
        <p>Priority</p>
        <p>Due date</p>
        <p>Reminder</p>
    `;
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
                ${t("addMoreDetails")}
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






