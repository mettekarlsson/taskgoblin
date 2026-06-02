const taskContent =
    document.getElementById("task-content");

// Stores tasks loaded from the backend.
let currentTasks = [];

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

            </div>

        `).join("");

};

// Runs automatically when the page loads.
const initPage = async () => {
    await loadTasks();

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
};