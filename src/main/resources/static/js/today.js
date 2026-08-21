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


/* -------------------------------- */
/* Init                             */
/* -------------------------------- */

loadTodayEvents();
loadTodayTasks();