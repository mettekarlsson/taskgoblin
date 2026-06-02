const taskContent =
    document.getElementById("task-content");

// Stores tasks loaded from the backend.
let currentTasks = [];

// Formats backend date into readable text.
const formatDate = (dateString) => {

    if (!dateString) {
        return t("noDueDate");
    }

    return new Date(dateString)
        .toLocaleString();
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

    taskContent.innerHTML =
        currentTasks.map(task => `

        <div class="task-card">

            <h3>${task.title}</h3>

            <p>
                ${t("status")}:
                ${task.status}
            </p>

            <p>
                ${t("priority")}:
                ${task.priority || "NONE"}
            </p>
            
            <p>
                ${t("dueDate")}:
                ${formatDate(task.dueAt)}
            </p>

            <div class="task-actions">

                ${task.status === "COMPLETED"
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

            </div>

        </div>

    `).join("");

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






