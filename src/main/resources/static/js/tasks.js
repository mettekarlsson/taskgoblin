const taskContent =
    document.getElementById("task-content");

// Stores tasks loaded from the backend.
let currentTasks = [];
// Stores which task card is currently expanded.
let expandedTaskId = null;

// Formats backend date into readable text.
const formatDate = (dateString) => {

    if (!dateString) {
        return t("noDueDate");
    }

    return new Date(dateString)
        .toLocaleString();
};

// Expands or collapses a task card.
const toggleTaskDetails = (taskId) => {

    expandedTaskId =
        expandedTaskId === taskId
            ? null
            : taskId;

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

        currentTasks =
            await response.json();

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

    // Renders a single task row.
    const renderTaskRow = (task) => {

        const isExpanded =
            expandedTaskId === task.id;

        const priorityClass =
            task.priority?.toLowerCase() || "none";

        return `

            <div class="task-row">

                <div class="task-row-content">

                    <div class="task-main-info">

                        <div class="task-row-top">

                            <h3 class="task-row-title">
                                ${task.title}
                            </h3>

                            <div class="task-header-actions">

                                ${task.status === "DONE"
            ? `
                                        <button
                                            class="task-action-btn"
                                            onclick="reopenTask(${task.id})"
                                        >
                                            ${t("reopen")}
                                        </button>
                                    `
            : `
                                        <button
                                            class="task-action-btn"
                                            onclick="completeTask(${task.id})"
                                        >
                                            ${t("complete")}
                                        </button>
                                    `
        }

                                <button
                                    class="task-delete-btn"
                                    onclick="deleteTask(${task.id})"
                                >
                                    ${t("delete")}
                                </button>

                                <button
                                    class="task-toggle-btn"
                                    onclick="toggleTaskDetails(${task.id})"
                                >
                                    ${isExpanded ? "−" : "+"}
                                </button>

                            </div>

                        </div>

                        <div class="task-row-meta">

                            <p class="task-row-date">
                                ${formatDate(task.dueAt)}
                            </p>

                            <span class="priority-badge ${priorityClass}">
                                ${task.priority || "NONE"}
                            </span>

                        </div>

                        ${isExpanded ? `

                            <div class="task-expanded-info">

                                <p>
                                    ${t("status")}:
                                    ${task.status}
                                </p>

                                <p>
                                    ${t("dueDate")}:
                                    ${formatDate(task.dueAt)}
                                </p>

                            </div>

                        ` : ""}

                    </div>

                </div>

            </div>

        `;
    };

    taskContent.innerHTML = `

        <div class="task-section">

            <h2 class="task-section-title">
                ${t("today")}
            </h2>

            ${activeTasks
        .map(renderTaskRow)
        .join("")}

        </div>

        <div class="task-section">

            <h2 class="task-section-title">
                ${t("completed")}
            </h2>

            ${completedTasks
        .map(renderTaskRow)
        .join("")}

        </div>

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






