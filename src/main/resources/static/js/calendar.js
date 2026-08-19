let currentCalendarDate = new Date();

let currentEvents = [];

/* -------------------------------- */
/* Search                           */
/* -------------------------------- */

const toggleCalendarSearch = () => {

    const searchView =
        document.getElementById(
            "calendar-search-view"
        );

    const searchInput =
        document.getElementById(
            "calendar-search"
        );


    const isOpen =
        searchView.classList.contains(
            "open"
        );


    if (isOpen) {

        closeCalendarSearch();

        return;
    }


    searchView.classList.add("open");

    searchInput.value = "";

    searchInput.focus();
};


const closeCalendarSearch = () => {

    const searchView =
        document.getElementById(
            "calendar-search-view"
        );

    const searchInput =
        document.getElementById(
            "calendar-search"
        );


    searchView.classList.remove("open");

    searchInput.value = "";
};


/* Close search with Escape */

const calendarSearchInput =
    document.getElementById(
        "calendar-search"
    );


if (calendarSearchInput) {

    calendarSearchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeCalendarSearch();

            }

        }
    );
}


/* -------------------------------- */
/* Calendar                         */
/* -------------------------------- */

const loadEvents = async () => {

    const calendarContent =
        document.getElementById(
            "calendar-content"
        );

    try {

        const response =
            await apiFetch("/calendar");

        if (!response.ok) {
            throw new Error(
                "Failed to load events"
            );
        }

        currentEvents =
            await response.json();

        renderCalendar();

    } catch (error) {

        calendarContent.innerHTML = `
            <p class="calendar-error">
                ${error.message}
            </p>
        `;

        console.error(error);
    }
};

const getISOWeekNumber = (date) => {

    const tempDate =
        new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            )
        );

    const dayNumber =
        tempDate.getUTCDay() || 7;

    tempDate.setUTCDate(
        tempDate.getUTCDate()
        + 4
        - dayNumber
    );

    const yearStart =
        new Date(
            Date.UTC(
                tempDate.getUTCFullYear(),
                0,
                1
            )
        );

    return Math.ceil(
        (
            (
                tempDate - yearStart
            ) / 86400000
            + 1
        ) / 7
    );
};

const renderWeekdays = () => {

    const container =
        document.getElementById(
            "calendar-weekdays"
        );

    const locale =
        currentSettings?.language === "sv"
            ? "sv-SE"
            : "en-GB";


    /*
        Start with a known Monday.
        2024-01-01 was a Monday.
    */
    const monday =
        new Date(2024, 0, 1);


    let weekdaysHTML = `
    <div class="calendar-week-label">
        ${currentSettings?.language === "sv" ? "V" : "W"}
    </div>
`;


    for (let i = 0; i < 7; i++) {

        const date =
            new Date(monday);

        date.setDate(
            monday.getDate() + i
        );


        const weekday =
            date.toLocaleDateString(
                locale,
                {
                    weekday: "short"
                }
            );


        weekdaysHTML += `
            <div>
                ${weekday}
            </div>
        `;
    }


    container.innerHTML =
        weekdaysHTML;
};

const renderCalendar = () => {

    const calendarContent =
        document.getElementById(
            "calendar-content"
        );

    const monthLabel =
        document.getElementById(
            "calendar-month-label"
        );


    if (!calendarContent || !monthLabel) {
        return;
    }


    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    /* Month title */

    monthLabel.textContent =
        currentCalendarDate
            .toLocaleDateString(
                currentSettings?.language === "sv"
                    ? "sv-SE"
                    : "en-GB",
                {
                    month: "long",
                    year: "numeric"
                }
            );


    /* Month info */

    const firstDayOfMonth =
        new Date(
            year,
            month,
            1
        );


    const lastDayOfMonth =
        new Date(
            year,
            month + 1,
            0
        );


    const daysInMonth =
        lastDayOfMonth.getDate();


    const startDay =
        (
            firstDayOfMonth.getDay()
            + 6
        ) % 7;


    const previousMonthLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    const today =
        new Date();


    let calendarHTML = "";


    for (
        let index = 0;
        index < 42;
        index++
    ) {

        let dayNumber;
        let cellDate;

        let cellClass =
            "calendar-day";


        /* Previous month */

        if (index < startDay) {

            dayNumber =
                previousMonthLastDay
                - startDay
                + index
                + 1;

            cellDate =
                new Date(
                    year,
                    month - 1,
                    dayNumber
                );

            cellClass +=
                " outside-month";
        }


        /* Current month */

        else if (
            index <
            startDay + daysInMonth
        ) {

            dayNumber =
                index
                - startDay
                + 1;

            cellDate =
                new Date(
                    year,
                    month,
                    dayNumber
                );


            const isToday =
                dayNumber === today.getDate()
                && month === today.getMonth()
                && year === today.getFullYear();


            if (isToday) {
                cellClass += " today";
            }
        }


        /* Next month */

        else {

            dayNumber =
                index
                - startDay
                - daysInMonth
                + 1;

            cellDate =
                new Date(
                    year,
                    month + 1,
                    dayNumber
                );

            cellClass +=
                " outside-month";
        }


        /* Events for this date */

        const eventsForDay =
            currentEvents.filter(event => {

                if (!event.startTime) {
                    return false;
                }


                const eventDate =
                    new Date(
                        event.startTime
                    );


                return (
                    eventDate.getFullYear() ===
                    cellDate.getFullYear()

                    && eventDate.getMonth() ===
                    cellDate.getMonth()

                    && eventDate.getDate() ===
                    cellDate.getDate()
                );
            });

        if (index % 7 === 0) {

            const weekNumber =
                getISOWeekNumber(cellDate);

            calendarHTML += `
        <div class="calendar-week-number">
            ${weekNumber}
        </div>
    `;
        }


        /* Build one calendar cell */

        calendarHTML += `

            <div class="${cellClass}" onclick="selectDay('${cellDate.toISOString()}')">

                <span class="calendar-day-number">
                    ${dayNumber}
                </span>

                <div class="calendar-day-events">

                    ${eventsForDay.map(event => `

                        <button
                            class="calendar-event"
                            style="
                                --event-color:
                                ${event.color || "var(--primary)"}
                            "
                            data-event-id="${event.id}"
                        >

                            <span class="calendar-event-dot"></span>

                            <span class="calendar-event-title">
                                ${event.title}
                            </span>

                        </button>

                    `).join("")}

                </div>

            </div>

        `;
    }


    /* Put finished calendar into HTML */

    calendarContent.innerHTML =
        calendarHTML;
};

/* -------------------------------- */
/* Select day                       */
/* -------------------------------- */

const selectDay = (dateString) => {

    // Convert the date string to a Date object
    const selectedDate = new Date(dateString);

    // Filter out only the events that belong to the selected day
    const eventsForDay = currentEvents.filter(event => {

        const eventDate = new Date(event.startTime);

        return (
            eventDate.getFullYear() === selectedDate.getFullYear()
            && eventDate.getMonth() === selectedDate.getMonth()
            && eventDate.getDate() === selectedDate.getDate()
        );
    });

    // Render the day view with the selected date and its events
    renderDayView(selectedDate, eventsForDay);
};


/* -------------------------------- */
/* Day view                         */
/* -------------------------------- */

const renderDayView = (date, events) => {

    const container = document.getElementById("calendar-day-view");

    // Format the date label based on language setting
    const dateLabel = date.toLocaleDateString(
        currentSettings?.language === "sv" ? "sv-SE" : "en-GB",
        { weekday: "long", day: "numeric", month: "long" }
    );

    // Show message if no events exist for this day
    if (events.length === 0) {
        container.innerHTML = `
    <h2>${dateLabel}</h2>
    <p class="day-no-events">No events this day</p>
`;
        return;
    }

    // Render the date label and a list of events
    container.innerHTML = `
        <h2>${dateLabel}</h2>
        <ul class="day-event-list">
            ${events.map(event => `
                <li onclick="openEventDetail(${event.id})">
                    <span class="event-dot" style="background: ${event.color || "var(--primary)"}"></span>
                    <span class="event-time">${new Date(event.startTime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</span>
                    <span class="event-title">${event.title}</span>
                    <span>›</span>
                </li>
            `).join("")}
        </ul>
    `;
};

/* -------------------------------- */
/* Event detail modal               */
/* -------------------------------- */

const openEventDetail = async (id) => {
    try {
        const response = await apiFetch(`/events/${id}`);

        if (!response.ok) {
            throw new Error("Failed to load event");
        }

        const event = await response.json();

        // Fill in the modal with event data
        document.getElementById("modal-event-title").textContent = event.title;

        document.getElementById("modal-event-details").innerHTML = `
    <div class="event-detail-row">
        📅 <span>${new Date(event.startTime).toLocaleDateString([], {weekday: "long", day: "numeric", month: "long"})}</span>
    </div>
    ${event.endTime ? `
    <div class="event-detail-row">
        🕐 <span>${new Date(event.startTime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} – ${new Date(event.endTime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</span>
    </div>` : ""}
    ${event.location ? `
    <div class="event-detail-row">
        📍 <span>${event.location}</span>
    </div>` : ""}
    ${event.category ? `
    <div class="event-detail-row">
        🏷️ <span>${event.category.name}</span>
    </div>` : ""}
    ${event.isRecurring ? `
    <div class="event-detail-row">
        🔁 <span>${event.frequency}</span>
    </div>` : ""}
    ${event.description ? `
    <div class="event-detail-row">
        📝 <span>${event.description}</span>
    </div>` : ""}
`;

        // Open the modal
        document.getElementById("event-detail-modal").classList.add("open");

    } catch (error) {
        alert(error.message);
    }
};

const closeEventDetail = () => {
    document.getElementById("event-detail-modal").classList.remove("open");
};

/* -------------------------------- */
    /* Change month                     */
    /* -------------------------------- */

    const changeCalendarMonth = (
        amount
    ) => {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth()
            + amount
        );


        renderCalendar();
    };


    /* -------------------------------- */
    /* Create event                     */
    /* -------------------------------- */

const renderCreateEventForm = () => {

    document.querySelector(".calendar-header").style.display = "none";
    document.querySelector(".calendar-container").style.display = "none";

    const dayView = document.getElementById("calendar-day-view");
    dayView.style.display = "block";

    dayView.innerHTML = `
        <section class="event-form-card">

            <h2>New event</h2>

            <label for="event-title">Title</label>
            <input id="event-title" class="event-input" type="text" placeholder="Event title">

            <label for="event-start">Start time</label>
            <input id="event-start" class="event-input" type="datetime-local">

            <label for="event-end">End time</label>
            <input id="event-end" class="event-input" type="datetime-local">

            <label for="event-location">Location</label>
            <input id="event-location" class="event-input" type="text" placeholder="Location (optional)">

            <label for="event-description">Description</label>
            <input id="event-description" class="event-input" type="text" placeholder="Description (optional)">

            <label class="event-checkbox-row">
                <input id="event-is-all-day" type="checkbox">
                All day event
            </label>

            <label class="event-checkbox-row">
                <input id="event-is-recurring" type="checkbox" onchange="toggleEventRecurringOptions()">
                Recurring event
            </label>

                <div id="event-recurring-options" class="event-recurring-options">
                <label for="event-interval-value">Repeat every</label>

                <div class="event-recurring-row">
                    <input
                        id="event-interval-value"
                        class="event-input"
                        type="number"
                        min="1"
                        value="1"
                    >
                    <select id="event-frequency" class="event-input">
                        <option value="DAILY">Day</option>
                        <option value="WEEKLY">Week</option>
                        <option value="MONTHLY">Month</option>
                        <option value="YEARLY">Year</option>
                    </select>
                </div>

            </div>

            <p id="event-message" class="event-message"></p>

            <div class="event-form-actions">
                <button class="event-save-btn" onclick="createEvent()">Save</button>
                <button class="event-cancel-btn" onclick="cancelEventForm()">Cancel</button>
            </div>

        </section>
    `;
};

const toggleEventRecurringOptions = () => {
    const isRecurring = document.getElementById("event-is-recurring").checked;
    const options = document.getElementById("event-recurring-options");

    if (isRecurring) {
        options.classList.add("open");
    } else {
        options.classList.remove("open");
    }
};

    /* -------------------------------- */
    /* Init                             */
    /* -------------------------------- */

const initPage = async () => {

    renderWeekdays();

    await loadEvents();

};
