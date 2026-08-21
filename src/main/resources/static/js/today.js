/* -------------------------------- */
/* Date                             */
/* -------------------------------- */

// Get the start of today
const getStartOfToday = () => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
};


// Get the start of tomorrow
const getStartOfTomorrow = () => {

    const tomorrow =
        getStartOfToday();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return tomorrow;
};


// Display current date
const todayDateElement =
    document.querySelector(".today-date");

const today =
    new Date();

const formattedDate =
    today.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

todayDateElement.innerHTML = `
    <span class="today-date-icon">📅</span>
    ${formattedDate}
`;


/* -------------------------------- */
/* Events                           */
/* -------------------------------- */

// Get events that occur today
const getTodayEvents = (events) => {

    return events.filter(event => {

        if (!event.startTime) {
            return false;
        }

        const eventDate =
            new Date(event.startTime);

        return (
            eventDate >= getStartOfToday()
            && eventDate < getStartOfTomorrow()
        );
    });
};


// Render today's events
const renderTodayEvents = (events) => {

    const container =
        document.getElementById("today-events");

    if (!container) {
        return;
    }

    if (events.length === 0) {

        container.innerHTML = `
            <div class="today-empty">
                No events today
            </div>
        `;

        return;
    }

    container.innerHTML =
        events.map(event => {

            const time = event.isAllDay
                ? "All day"
                : new Date(event.startTime)
                    .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    });

            return `
                <div class="today-row">

                    <span class="today-event-time">
                        ${time}
                    </span>

                    <div class="today-row-main">

                        <p class="today-row-title">
                            ${event.title}
                        </p>

                    </div>

                    <span class="today-row-arrow">
                        ›
                    </span>

                </div>
            `;

        }).join("");
};


// Load today's events
const loadTodayEvents = async () => {

    try {

        const response =
            await apiFetch("/calendar");

        if (!response.ok) {
            throw new Error(
                "Failed to load events"
            );
        }

        const events =
            await response.json();

        const todayEvents =
            getTodayEvents(events);

        renderTodayEvents(todayEvents);

    } catch (error) {

        console.error(error);

    }
};


/* -------------------------------- */
/* Tasks                            */
/* -------------------------------- */

// Check if a task is due today
const isTaskDueToday = (task) => {

    if (!task.dueAt) {
        return false;
    }

    const dueDate =
        new Date(task.dueAt);

    return (
        dueDate >= getStartOfToday()
        && dueDate < getStartOfTomorrow()
    );
};


// Load today's tasks
const loadTodayTasks = async () => {

    try {

        const response =
            await apiFetch("/tasks");

        if (!response.ok) {
            throw new Error(
                "Failed to load tasks"
            );
        }

        const tasks =
            await response.json();

        const todayTasks =
            tasks.filter(task =>
                task.status !== "DONE"
                && isTaskDueToday(task)
            );

        renderTodayTasks(todayTasks);

    } catch (error) {

        console.error(error);

    }
};

// Render today's tasks
const renderTodayTasks = (tasks) => {

    const container =
        document.getElementById("today-tasks");

    if (!container) {
        return;
    }

    if (tasks.length === 0) {

        container.innerHTML = `
            <div class="today-empty">
                No tasks today
            </div>
        `;

        return;
    }

    container.innerHTML =
        tasks.map(task => {

            return `
                <div class="today-row">

                    <button
                        class="today-task-check"
                        type="button"
                        onclick="completeTodayTask(${task.id})"
                    ></button>

                    <div class="today-row-main">

                        <p class="today-row-title">
                            ${task.title}
                        </p>

                    </div>

                    <span class="today-row-arrow">
                        ›
                    </span>

                </div>
            `;

        }).join("");
};

// Complete a task from today view
const completeTodayTask = async (taskId) => {

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
                "Failed to complete task"
            );
        }

        await loadTodayTasks();

    } catch (error) {

        console.error(error);

    }
};

// Later add a functionality that saves a completed task in today view? Or should they just disappear when completed?


/* -------------------------------- */
/* Lists                            */
/* -------------------------------- */

// Check if a list is due today
const isListDueToday = (list) => {

    if (!list.dueAt || list.status === "DONE") {
        return false;
    }

    const dueDate =
        new Date(list.dueAt);

    return (
        dueDate >= getStartOfToday()
        && dueDate < getStartOfTomorrow()
    );
};


// Get tasks belonging to a list
const loadTasksForTodayList = async (listId) => {

    try {

        const response =
            await apiFetch(`/lists/${listId}/tasks`);

        if (!response.ok) {
            return [];
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];
    }
};


// Load today's lists
const loadTodayLists = async (expandedListId = null) => {

    try {

        const response =
            await apiFetch("/lists");

        if (!response.ok) {
            throw new Error(
                "Failed to load lists"
            );
        }

        const lists =
            await response.json();

        const todayLists =
            lists.filter(isListDueToday);

        const listsWithTasks =
            await Promise.all(
                todayLists.map(async list => {

                    const tasks =
                        await loadTasksForTodayList(list.id);

                    return {
                        ...list,
                        tasks
                    };
                })
            );

        renderTodayLists(
            listsWithTasks,
            expandedListId
        );

    } catch (error) {

        console.error(error);

    }
};


// Render today's lists
const renderTodayLists = (lists, expandedListId = null) => {

    const container =
        document.getElementById("today-lists");

    if (!container) {
        return;
    }

    if (lists.length === 0) {

        container.innerHTML = `
            <div class="today-empty">
                No lists today
            </div>
        `;

        return;
    }

    container.innerHTML =
        lists.map(list => {

            const completedTasks =
                list.tasks.filter(
                    task => task.status === "DONE"
                ).length;

            const totalTasks =
                list.tasks.length;

            return `
                <div
                    class="today-list-card ${
                        list.id === expandedListId
                            ? "expanded"
                            : ""
                    }"
                    id="today-list-${list.id}"
                >

                    <div
                        class="today-row today-list-header"
                        onclick="toggleTodayList(${list.id})"
                    >

                        <span class="today-list-icon">
                            📋
                        </span>

                        <div class="today-row-main">

                            <p class="today-row-title">
                                ${list.name}
                            </p>

                        </div>

                        <div class="today-row-meta">

                            <span class="today-category">
                                ${completedTasks} / ${totalTasks}
                            </span>

                        </div>

                        <span class="today-row-arrow">
                            ›
                        </span>

                    </div>

                    <div class="today-list-tasks">

                        ${
                            list.tasks.length === 0
                                ? `
                                    <div class="today-empty">
                                        No tasks in this list
                                    </div>
                                `
                                : list.tasks.map(task => `

                                    <div class="today-list-task">

                                        <button
                                            class="today-list-check ${
                                                task.status === "DONE"
                                                    ? "completed"
                                                    : ""
                                            }"
                                            type="button"
                                            onclick="toggleTodayListTask(event, ${task.id}, '${task.status}', ${list.id})"
                                        >
                                            ${
                                                task.status === "DONE"
                                                    ? "✓"
                                                    : ""
                                            }
                                        </button>

                                        <span
                                            class="today-list-task-title ${
                                                task.status === "DONE"
                                                    ? "completed"
                                                    : ""
                                            }"
                                        >
                                            ${task.title}
                                        </span>

                                    </div>

                                `).join("")
                        }

                    </div>

                </div>
            `;

        }).join("");
};


// Expand or collapse a list
const toggleTodayList = (listId) => {

    const listElement =
        document.getElementById(
            `today-list-${listId}`
        );

    if (!listElement) {
        return;
    }

    listElement.classList.toggle("expanded");
};


// Complete or reopen a task inside a list
const toggleTodayListTask = async (
    event,
    taskId,
    currentStatus,
    listId
) => {

    event.stopPropagation();

    try {

        const isCompleted =
            currentStatus === "DONE";

        const endpoint =
            isCompleted
                ? `/tasks/${taskId}/reopen`
                : `/tasks/${taskId}/complete`;

        const response =
            await apiFetch(
                endpoint,
                {
                    method: "PATCH"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to update list task"
            );
        }

        await loadTodayLists(listId);

    } catch (error) {

        console.error(error);

    }
};

/* -------------------------------- */
/* Init                             */
/* -------------------------------- */

loadTodayEvents();
loadTodayTasks();
loadTodayLists();