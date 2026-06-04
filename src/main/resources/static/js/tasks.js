const taskContent =
    document.getElementById("task-content");

// Stores tasks loaded from the backend.
let currentTasks = [];
// Stores which task card is currently expanded.

// Formats backend date into readable text.
const formatDate = (dateString) => {

    if (!dateString) {
        return t("noDueDate");
    }

    return new Date(dateString)
        .toLocaleString();
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






