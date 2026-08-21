/* -------------------------------- */
/* Date                             */
/* -------------------------------- */

// Retrieve current date
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

    const today =
        new Date();

    return events.filter(event => {

        if (!event.startTime) {
            return false;
        }

        const eventDate =
            new Date(event.startTime);

        return (
            eventDate.getFullYear() ===
                today.getFullYear()

            && eventDate.getMonth() ===
                today.getMonth()

            && eventDate.getDate() ===
                today.getDate()
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

    container.innerHTML = events.map(event => {

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
/* Init                             */
/* -------------------------------- */

loadTodayEvents();