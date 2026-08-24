let currentCalendarDate = new Date();

let currentEvents = [];
let selectedEventId = null;
let editingEventId = null;

/* -------------------------------- */
/* View switching (Month / List)    */
/* -------------------------------- */

let currentCalendarView = "month";

const switchCalendarView = (view) => {

    currentCalendarView = view;

    const searchButton =
        document.querySelector(
            ".calendar-search-btn"
        );

    searchButton.style.display =
        view === "list"
            ? "flex"
            : "none";

    document
        .querySelectorAll(".calendar-view-tab")
        .forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.view === view
            );
        });

    const monthContainer =
        document.querySelector(".calendar-container");

    const dayView =
        document.getElementById("calendar-day-view");

    const listContainer =
        document.getElementById("event-list-container");

    if (view === "month") {

        monthContainer.style.display = "block";
        dayView.style.display = "block";

        listContainer.classList.remove("active");

    } else {

        monthContainer.style.display = "none";
        dayView.style.display = "none";

        listContainer.classList.add("active");

        // Only fetch the first time the List tab is opened.
        if (listViewEvents.length === 0) {
            loadEventList(true);
        }
    }
};


/* -------------------------------- */
/* List view - "load more" paging   */
/* -------------------------------- */

// Accumulated events across every month chunk loaded so far.
let listViewEvents = [];

// How many month-chunks have been loaded (0 = none yet).
let listViewMonthsLoaded = 0;

let listViewLoading = false;

// Returns the [start, end] window for one "chunk" of the list view.
// Chunk 0 is "today until the end of this month". Every chunk after
// that is one full calendar month further ahead.
const getListViewChunkRange = (chunkIndex) => {

    const now = new Date();

    if (chunkIndex === 0) {

        const start = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0, 0, 0
        );

        const end = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23, 59, 59
        );

        return { start, end };
    }

    const start = new Date(
        now.getFullYear(),
        now.getMonth() + chunkIndex,
        1,
        0, 0, 0
    );

    const end = new Date(
        now.getFullYear(),
        now.getMonth() + chunkIndex + 1,
        0,
        23, 59, 59
    );

    return { start, end };
};


// Fetches the next chunk and appends it to listViewEvents.
// reset=true clears everything first (used when the List tab is opened).
const loadEventList = async (reset) => {

    if (listViewLoading) {
        return;
    }

    listViewLoading = true;

    if (reset) {
        listViewEvents = [];
        listViewMonthsLoaded = 0;
    }

    const listContent =
        document.getElementById("event-list-content");

    try {

        const { start, end } =
            getListViewChunkRange(listViewMonthsLoaded);

        const startDate = formatDateTimeForApi(start);
        const endDate = formatDateTimeForApi(end);

        const response =
            await apiFetch(
                `/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
            );

        if (!response.ok) {
            throw new Error("Failed to load events");
        }

        const newEvents =
            await response.json();

        listViewEvents =
            listViewEvents.concat(newEvents);

        listViewMonthsLoaded += 1;

        renderEventList();

    } catch (error) {

        listContent.innerHTML = `
            <p class="calendar-error">
                ${error.message}
            </p>
        `;

        console.error(error);

    } finally {

        listViewLoading = false;
    }
};


const loadMoreEventList = () => {
    loadEventList(false);
};


// Renders listViewEvents, grouped by date, filtered by the search box.
const renderEventList = () => {

    const listContent =
        document.getElementById("event-list-content");

    const loadMoreBtn =
        document.getElementById("event-list-load-more-btn");

    const query =
        document
            .getElementById("event-list-search")
            .value
            .trim()
            .toLowerCase();

    const filteredEvents =
        listViewEvents.filter(event =>
            (event.title || "")
                .toLowerCase()
                .includes(query)
        );

    // Load more is always available (there's no "final" chunk with this
    // rolling-month pagination), but hide it while a search is active -
    // the user is filtering what's already loaded, not asking for more.
    loadMoreBtn.classList.toggle(
        "hidden",
        query.length > 0
    );

    if (filteredEvents.length === 0) {

        listContent.innerHTML = `
            <p class="events-empty">
                ${query
            ? "No events match your search."
            : "No events found."}
            </p>
        `;

        return;
    }

    const sortedEvents =
        [...filteredEvents].sort((a, b) =>
            new Date(a.startTime) - new Date(b.startTime)
        );

    // Groups events by calendar date (YYYY-MM-DD), in encounter order,
    // which is already chronological since sortedEvents is sorted.
    const groups = [];
    let currentGroup = null;

    sortedEvents.forEach(event => {

        const eventDate = new Date(event.startTime);

        const dateKey =
            eventDate.toDateString();

        if (!currentGroup || currentGroup.dateKey !== dateKey) {

            currentGroup = {
                dateKey,
                date: eventDate,
                events: []
            };

            groups.push(currentGroup);
        }

        currentGroup.events.push(event);
    });

    const locale =
        currentSettings?.language === "sv"
            ? "sv-SE"
            : "en-GB";

    listContent.innerHTML = groups.map(group => `

        <section class="event-section">

            <h3 class="event-section-title">
                ${group.date.toLocaleDateString(
        locale,
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    )}
            </h3>

            <div class="event-section-list">

                ${group.events.map(event => `

                    <button
                        type="button"
                        class="event-row"
                        style="--event-color: ${event.color || "var(--primary)"}"
                        onclick="openEventDetail(${event.id}, '${event.startTime}', ${event.endTime ? `'${event.endTime}'` : "null"})"
                    >

                        <span class="event-row-dot"></span>

                        <span class="event-row-title">
                            ${event.title}
                        </span>

                        <span class="event-row-time">
                            ${event.isAllDay
        ? "All day"
        : new Date(event.startTime)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>

                    </button>

                `).join("")}

            </div>

        </section>

    `).join("");
};

const toggleCalendarSearch = () => {

    const searchView =
        document.getElementById(
            "calendar-search-view"
        );

    const searchInput =
        document.getElementById(
            "event-list-search"
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

    renderEventList();
};

const closeCalendarSearch = () => {

    document
        .getElementById(
            "calendar-search-view"
        )
        .classList.remove("open");

    document
        .getElementById(
            "event-list-search"
        )
        .value = "";

    renderEventList();
};

document
    .getElementById("event-list-search")
    ?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeCalendarSearch();
            }
        }
    );

/* -------------------------------- */
/* Calendar                         */
/* -------------------------------- */

// Formats a Date object into "YYYY-MM-DDTHH:mm:ss" (no "Z", no milliseconds),
// since that's the format the backend expects for LocalDateTime query params.
const formatDateTimeForApi = (date) => {

    const pad = (number) =>
        String(number).padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


// Calculates the first and last day of the currently displayed month,
// so we can ask the backend for exactly the events this month needs.
const getCurrentMonthDateRange = () => {

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // Day 1 of this month, at midnight.
    const firstDay = new Date(year, month, 1, 0, 0, 0);

    // "Day 0 of next month" = the last day of this month (same trick
    // renderCalendar() already uses for lastDayOfMonth).
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

    return {
        startDate: formatDateTimeForApi(firstDay),
        endDate: formatDateTimeForApi(lastDay)
    };
};

const loadEvents = async () => {

    const calendarContent =
        document.getElementById("calendar-content");

    try {

        // Only request events for the month currently shown, since the
        // backend now requires startDate/endDate on every call.
        const { startDate, endDate } =
            getCurrentMonthDateRange();

        const response =
            await apiFetch(
                `/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
            );

        if (!response.ok) {
            throw new Error("Failed to load events");
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


/* -------------------------------- */
/* ISO week                         */
/* -------------------------------- */

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


/* -------------------------------- */
/* Weekdays                         */
/* -------------------------------- */

const renderWeekdays = () => {

    const container =
        document.getElementById("calendar-weekdays");

    if (!container) {
        return;
    }

    const locale =
        currentSettings?.language === "sv"
            ? "sv-SE"
            : "en-GB";

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


/* -------------------------------- */
/* Render calendar                   */
/* -------------------------------- */

const renderCalendar = () => {

    const calendarContent =
        document.getElementById("calendar-content");

    const monthLabel =
        document.getElementById("calendar-month-label");

    if (!calendarContent || !monthLabel) {
        return;
    }

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    /* Month title */

    monthLabel.textContent =
        currentCalendarDate.toLocaleDateString(
            currentSettings?.language === "sv"
                ? "sv-SE"
                : "en-GB",
            {
                month: "long",
                year: "numeric"
            }
        );


    /* Month information */

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


    /* -------------------------------- */
    /* Create 42 calendar cells         */
    /* -------------------------------- */

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
                    new Date(event.startTime);

                return (
                    eventDate.getFullYear() ===
                    cellDate.getFullYear()

                    && eventDate.getMonth() ===
                    cellDate.getMonth()

                    && eventDate.getDate() ===
                    cellDate.getDate()
                );
            });


        /* Week number */

        if (index % 7 === 0) {

            const weekNumber =
                getISOWeekNumber(cellDate);

            calendarHTML += `
                <div class="calendar-week-number">
                    ${weekNumber}
                </div>
            `;
        }


        /* Calendar day */

        calendarHTML += `
            <div
                class="${cellClass}"
                onclick="selectDay('${cellDate.toISOString()}')"
            >

                <span class="calendar-day-number">
                    ${dayNumber}
                </span>

                <div class="calendar-day-events">

                    ${eventsForDay.map(event => `

                        <button
                            type="button"
                            class="calendar-event"
                            style="
                                --event-color:
                                ${event.color || "var(--primary)"}
                            "
                            data-event-id="${event.id}"
onclick="event.stopPropagation(); openEventDetail(${event.id}, '${event.startTime}', ${event.endTime ? `'${event.endTime}'` : "null"})"                        >

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


    calendarContent.innerHTML =
        calendarHTML;
};


/* -------------------------------- */
/* Select day                       */
/* -------------------------------- */

const selectDay = (dateString) => {

    const selectedDate =
        new Date(dateString);

    const eventsForDay = currentEvents
        .filter(event => {
            const eventDate = new Date(event.startTime);

            return (
                eventDate.getFullYear() === selectedDate.getFullYear()
                && eventDate.getMonth() === selectedDate.getMonth()
                && eventDate.getDate() === selectedDate.getDate()
            );
        })
        .sort((a, b) =>
            new Date(a.startTime) - new Date(b.startTime)
        );


    const dayView =
        document.getElementById("calendar-day-view");

    if (!dayView) {
        return;
    }

    /*
     * IMPORTANT:
     * The day view is always shown when a date
     * is clicked, even if there are no events.
     */
    dayView.style.display = "block";

    renderDayView(
        selectedDate,
        eventsForDay
    );
};


/* -------------------------------- */
/* Day view                         */
/* -------------------------------- */

const renderDayView = (
    date,
    events
) => {

    const container =
        document.getElementById(
            "calendar-day-view"
        );

    if (!container) {
        return;
    }


    const locale =
        currentSettings?.language === "sv"
            ? "sv-SE"
            : "en-GB";


    const dateLabel =
        date.toLocaleDateString(
            locale,
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );


    /*
     * Always render the day view.
     * If there are no events, show a message.
     */

    if (events.length === 0) {

        container.innerHTML = `
            <h2>${dateLabel}</h2>

            <p class="day-no-events">
                No events this day
            </p>
        `;

        return;
    }


    container.innerHTML = `
        <h2>${dateLabel}</h2>

        <ul class="day-event-list">

            ${events.map(event => `

                <li
    onclick="openEventDetail(${event.id}, '${event.startTime}', ${event.endTime ? `'${event.endTime}'` : "null"})"
>

                    <span
                        class="event-dot"
                        style="
                            background:
                            ${event.color || "var(--primary)"}
                        "
                    ></span>

                    <span class="event-time">${event.isAllDay ? "All day" : new Date(event.startTime).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</span>

                    <span class="event-title">
                        ${event.title}
                    </span>

                    <span>›</span>

                </li>

            `).join("")}

        </ul>
    `;
};


/* -------------------------------- */
/* Event detail modal               */
/* -------------------------------- */

const openEventDetail = async (id, occurrenceStartTime, occurrenceEndTime) => {

    try {

        const response =
            await apiFetch(`/events/${id}`);

        if (!response.ok) {
            throw new Error(
                "Failed to load event"
            );
        }

        const event =
            await response.json();
        selectedEventId = event.id;

        // GET /events/{id} always returns the series' original startTime/
        // endTime (there's only one database row per recurring series).
        // Override with the specific occurrence's dates - passed in from
        // wherever the click happened - so the modal shows the date the
        // user actually clicked, not the series' first occurrence.
        if (occurrenceStartTime) {
            event.startTime = occurrenceStartTime;
            event.endTime = occurrenceEndTime || null;
        }

        document.getElementById(
            "modal-event-title"
        ).textContent =
            event.title;


        document.getElementById(
            "modal-event-details"
        ).innerHTML = `

            <div class="event-detail-row">
                📅
                <span>
                    ${new Date(event.startTime)
            .toLocaleDateString(
                [],
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                }
            )}
                </span>
            </div>

            ${event.endTime ? `

                <div class="event-detail-row">
                    🕐
                    <span>
                        ${new Date(event.startTime)
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}

                        –

                        ${new Date(event.endTime)
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}
                    </span>
                </div>

            ` : ""}

            ${event.location ? `

                <div class="event-detail-row">
                    📍
                    <span>
                        ${event.location}
                    </span>
                </div>

            ` : ""}

            ${event.category ? `

                <div class="event-detail-row">
                    🏷️
                    <span>
                        ${event.category.name}
                    </span>
                </div>

            ` : ""}

            ${event.isRecurring ? `

                <div class="event-detail-row">
                    🔁
                    <span>
                        ${event.frequency}
                    </span>
                </div>

            ` : ""}

            ${event.description ? `

                <div class="event-detail-row">
                    📝
                    <span>
                        ${event.description}
                    </span>
                </div>

            ` : ""}

        `;


        document
            .getElementById("event-detail-modal")
            .classList.add("open");


    } catch (error) {

        alert(error.message);
    }
};


const closeEventDetail = () => {

    document
        .getElementById("event-detail-modal")
        .classList.remove("open");
};


/* -------------------------------- */
/* Change month                     */
/* -------------------------------- */

const changeCalendarMonth = async (
    amount
) => {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth()
        + amount
    );

    // Re-fetch events for the newly selected month, since the backend
    // only returns events within the requested date range now.
    await loadEvents();
};


/* -------------------------------- */
/* Restore calendar view            */
/* -------------------------------- */

/*
 * This is the important part.
 *
 * Whenever we leave the create-event form,
 * restore the entire calendar layout.
 */

const restoreCalendarView = () => {

    const header =
        document.querySelector(
            ".calendar-header"
        );

    const calendarContainer =
        document.querySelector(
            ".calendar-container"
        );

    const dayView =
        document.getElementById(
            "calendar-day-view"
        );


    if (header) {
        header.style.display = "flex";
    }

    if (calendarContainer) {
        calendarContainer.style.display = "block";
    }

    if (dayView) {

        /*
         * Keep the day view visible.
         * This is what allows the user to click
         * dates and see their events underneath.
         */
        dayView.style.display = "block";

        /*
         * Clear the old create-event form.
         * Do NOT hide the day view.
         */
        dayView.innerHTML = "";
    }


    renderWeekdays();
    renderCalendar();
    editingEventId = null;
};


/* -------------------------------- */
/* Create event                     */
/* -------------------------------- */

const renderCreateEventForm = () => {

    const header =
        document.querySelector(
            ".calendar-header"
        );

    const calendarContainer =
        document.querySelector(
            ".calendar-container"
        );

    const dayView =
        document.getElementById(
            "calendar-day-view"
        );


    if (header) {
        header.style.display = "none";
    }

    if (calendarContainer) {
        calendarContainer.style.display = "none";
    }

    if (dayView) {

        dayView.style.display = "block";

        dayView.innerHTML = `

            <section class="event-form-card">

                <h2>New event</h2>


                <label for="event-title">
                    Title
                </label>

                <input
                    id="event-title"
                    class="event-input"
                    type="text"
                    placeholder="Event title"
                >


                <div id="event-time-options">

    <label for="event-start">
        Start time
    </label>

    <input
        id="event-start"
        class="event-input"
        type="datetime-local"
    >

    <label for="event-end">
        End time
    </label>

    <input
        id="event-end"
        class="event-input"
        type="datetime-local"
    >

</div>

<div id="event-all-day-options">

    <label for="event-all-day-date">
        Date
    </label>

    <input
        id="event-all-day-date"
        class="event-input"
        type="date"
    >

</div>

<label class="event-checkbox-row">

    <input
        id="event-is-all-day"
        type="checkbox"
        onchange="toggleEventAllDay()"
    >

    All day event

</label>


                <label for="event-location">
                    Location
                </label>

                <input
                    id="event-location"
                    class="event-input"
                    type="text"
                    placeholder="Location (optional)"
                >


                <label for="event-description">
                    Description
                </label>

                <input
                    id="event-description"
                    class="event-input"
                    type="text"
                    placeholder="Description (optional)"
                >


                <label class="event-checkbox-row">

                    <input
                        id="event-is-recurring"
                        type="checkbox"
                        onchange="toggleEventRecurringOptions()"
                    >

                    Recurring event

                </label>


                <div
                    id="event-recurring-options"
                    class="event-recurring-options"
                >

                    <label for="event-interval-value">
                        Repeat every
                    </label>


                    <div class="event-recurring-row">

                        <input
                            id="event-interval-value"
                            class="event-input"
                            type="number"
                            min="1"
                            value="1"
                        >


                        <select
                            id="event-frequency"
                            class="event-input"
                        >

                            <option value="DAILY">
                                Day
                            </option>

                            <option value="WEEKLY">
                                Week
                            </option>

                            <option value="MONTHLY">
                                Month
                            </option>

                            <option value="YEARLY">
                                Year
                            </option>

                        </select>

                    </div>

                </div>


                <p
                    id="event-message"
                    class="event-message"
                ></p>


                <div class="event-form-actions">

                    <button
                        type="button"
                        class="event-save-btn"
                        onclick="submitCreateEvent()"
                    >
                        Save
                    </button>


                    <button
                        type="button"
                        class="event-cancel-btn"
                        onclick="cancelEventForm()"
                    >
                        Cancel
                    </button>

                </div>

            </section>

        `;
    }
    const allDayOptions =
        document.getElementById(
            "event-all-day-options"
        );

    allDayOptions.style.display = "none";
};


//edit already created event
const renderEditEventForm = async () => {

    // Close the event detail modal immediately
    closeEventDetail();

    try {

        const response =
            await apiFetch(
                `/events/${selectedEventId}`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load event"
            );
        }

        const event =
            await response.json();


        // Store event ID that is being edited
        editingEventId =
            event.id;


        // Render the event form
        renderCreateEventForm();


        /* -------------------------------- */
        /* Basic information                */
        /* -------------------------------- */

        document.getElementById(
            "event-title"
        ).value =
            event.title || "";


        document.getElementById(
            "event-location"
        ).value =
            event.location || "";


        document.getElementById(
            "event-description"
        ).value =
            event.description || "";


        /* -------------------------------- */
        /* All day                          */
        /* -------------------------------- */

        const allDayCheckbox =
            document.getElementById(
                "event-is-all-day"
            );

        allDayCheckbox.checked =
            event.isAllDay;


        /* -------------------------------- */
        /* Date / time                      */
        /* -------------------------------- */

        if (event.startTime) {

            document.getElementById(
                "event-start"
            ).value =
                event.startTime.slice(0, 16);


            /*
             * For all-day events we need to
             * populate the separate date field.
             */

            if (event.isAllDay) {

                document.getElementById(
                    "event-all-day-date"
                ).value =
                    event.startTime.slice(0, 10);
            }
        }


        if (event.endTime) {

            document.getElementById(
                "event-end"
            ).value =
                event.endTime.slice(0, 16);
        }


        /*
         * Make sure the correct time/date
         * section is visible.
         */

        toggleEventAllDay();


        /* -------------------------------- */
        /* Recurring                        */
        /* -------------------------------- */

        const recurringCheckbox =
            document.getElementById(
                "event-is-recurring"
            );

        recurringCheckbox.checked =
            event.isRecurring;


        if (event.isRecurring) {

            document.getElementById(
                "event-frequency"
            ).value =
                event.frequency || "DAILY";


            document.getElementById(
                "event-interval-value"
            ).value =
                event.intervalValue || 1;
        }


        /*
         * Show/hide recurring options.
         */

        toggleEventRecurringOptions();


        /* -------------------------------- */
        /* Change button to Update          */
        /* -------------------------------- */

        const saveButton =
            document.querySelector(
                ".event-save-btn"
            );


        if (saveButton) {

            saveButton.textContent =
                "Update";


            saveButton.onclick =
                updateEvent;
        }


    } catch (error) {

        alert(error.message);
    }
};

/* -------------------------------- */
/* Submit create event              */
/* -------------------------------- */

const submitCreateEvent = async () => {

    const title =
        document
            .getElementById("event-title")
            .value
            .trim();


    const location =
        document
            .getElementById("event-location")
            .value
            .trim();


    const description =
        document
            .getElementById("event-description")
            .value
            .trim();


    const isAllDay =
        document
            .getElementById("event-is-all-day")
            .checked;


    /* -------------------------------- */
    /* Validation                       */
    /* -------------------------------- */

    if (!title) {

        document
            .getElementById("event-message")
            .textContent =
            "Title cannot be empty";

        return;
    }


    let startTime = null;
    let endTime = null;


    /* -------------------------------- */
    /* Time / all-day handling          */
    /* -------------------------------- */

    if (isAllDay) {

        const allDayDate =
            document
                .getElementById("event-all-day-date")
                .value;

        if (!allDayDate) {

            document
                .getElementById("event-message")
                .textContent =
                "Date cannot be empty";

            return;
        }

        startTime =
            `${allDayDate}T00:00:00`;

        endTime = null;

    } else {

        startTime =
            document
                .getElementById("event-start")
                .value;

        endTime =
            document
                .getElementById("event-end")
                .value;

        if (!startTime) {

            document
                .getElementById("event-message")
                .textContent =
                "Start time cannot be empty";

            return;
        }
    }


    /* -------------------------------- */
    /* Recurring                        */
    /* -------------------------------- */

    const isRecurring =
        document
            .getElementById("event-is-recurring")
            .checked;


    const frequency =
        isRecurring
            ? document
                .getElementById("event-frequency")
                .value
            : null;


    const intervalValue =
        isRecurring
            ? Number(
                document
                    .getElementById(
                        "event-interval-value"
                    )
                    .value
            )
            : null;


    /* -------------------------------- */
    /* Event data                       */
    /* -------------------------------- */

    const eventData = {

        title,

        description:
            description || null,

        startTime,

        endTime:
            endTime || null,

        location:
            location || null,

        isAllDay,

        isRecurring,

        frequency,

        intervalValue
    };


    /* -------------------------------- */
    /* Save                              */
    /* -------------------------------- */

    try {

        const response =
            await apiFetch(
                "/events",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            eventData
                        )
                }
            );


        if (!response.ok) {

            let errorMessage =
                "Failed to create event";

            try {

                const error =
                    await response.json();

                errorMessage =
                    error.message ||
                    errorMessage;

            } catch (e) {
                // Ignore JSON parsing error
            }

            throw new Error(
                errorMessage
            );
        }


        /*
         * Reload events so the newly created
         * event appears in the calendar.
         */

        await loadEvents();


// Returns to the page where quick add was opened.
        const quickAdd =
            new URLSearchParams(window.location.search)
                .get("quickAdd");

        const returnTo =
            new URLSearchParams(window.location.search)
                .get("returnTo");

        if (quickAdd === "true" && returnTo) {
            window.location.href = returnTo;
        } else {
            restoreCalendarView();
        }


    } catch (error) {

        const message =
            document.getElementById(
                "event-message"
            );

        if (message) {

            message.textContent =
                error.message;
        }
    }
};

//submit edited event
const updateEvent = async () => {

    const title =
        document.getElementById(
            "event-title"
        ).value.trim();

    const startTime =
        document.getElementById(
            "event-start"
        ).value;

    const endTime =
        document.getElementById(
            "event-end"
        ).value;

    const location =
        document.getElementById(
            "event-location"
        ).value.trim();

    const description =
        document.getElementById(
            "event-description"
        ).value.trim();

    const isAllDay =
        document.getElementById(
            "event-is-all-day"
        ).checked;

    const isRecurring =
        document.getElementById(
            "event-is-recurring"
        ).checked;

    const frequency =
        isRecurring
            ? document.getElementById(
                "event-frequency"
            ).value
            : null;

    const intervalValue =
        isRecurring
            ? Number(
                document.getElementById(
                    "event-interval-value"
                ).value
            )
            : null;

    if (!title) {

        document.getElementById(
            "event-message"
        ).textContent =
            "Title cannot be empty";

        return;
    }

    const eventData = {

        title,
        startTime,
        endTime: endTime || null,

        description:
            description || null,

        location:
            location || null,

        isAllDay,
        isRecurring,
        frequency,
        intervalValue
    };

    try {

        const response =
            await apiFetch(
                `/events/${editingEventId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            eventData
                        )
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to update event"
            );
        }

        editingEventId =
            null;

        await loadEvents();

        restoreCalendarView();

    } catch (error) {

        document.getElementById(
            "event-message"
        ).textContent =
            error.message;
    }
};


/* -------------------------------- */
/* Cancel create event              */
/* -------------------------------- */

const cancelEventForm = () => {

    /*
     * No API request is needed.
     *
     * Just restore the normal calendar UI.
     */

    restoreCalendarView();
};


/* -------------------------------- */
/* Recurring options/ All day options               */
/* -------------------------------- */

const toggleEventAllDay = () => {

    const isAllDay =
        document
            .getElementById("event-is-all-day")
            .checked;

    const timeOptions =
        document.getElementById(
            "event-time-options"
        );

    const allDayOptions =
        document.getElementById(
            "event-all-day-options"
        );

    const startInput =
        document.getElementById(
            "event-start"
        );

    const allDayDateInput =
        document.getElementById(
            "event-all-day-date"
        );


    if (isAllDay) {

        /*
         * Copy the date from the normal start
         * datetime field if one has been selected.
         */

        if (
            startInput.value &&
            !allDayDateInput.value
        ) {

            allDayDateInput.value =
                startInput.value.split("T")[0];
        }


        timeOptions.style.display = "none";

        allDayOptions.style.display = "block";

    } else {

        timeOptions.style.display = "block";

        allDayOptions.style.display = "none";
    }
};

const toggleEventRecurringOptions = () => {

    const checkbox =
        document.getElementById(
            "event-is-recurring"
        );

    const options =
        document.getElementById(
            "event-recurring-options"
        );

    if (!checkbox || !options) {
        return;
    }

    options.classList.toggle(
        "open",
        checkbox.checked
    );
};


/* -------------------------------- */
/* Init                             */
/* -------------------------------- */

const initPage = async () => {

    renderWeekdays();

    await loadEvents();

    document.querySelector(
        ".calendar-search-btn"
    ).style.display = "none";

    // Opens the create event form when triggered from the quick add menu.
    const quickAdd =
        new URLSearchParams(window.location.search)
            .get("quickAdd");

    if (quickAdd === "true") {
        renderCreateEventForm();
    }

};

//delete event
const deleteEvent = async () => {

    if (!confirm("Delete this event?")) {
        return;
    }

    try {

        const response =
            await apiFetch(
                `/events/${selectedEventId}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {
            throw new Error("Failed to delete event");
        }

        closeEventDetail();

        await loadEvents();

        document.getElementById(
            "calendar-day-view"
        ).innerHTML = "";

    } catch (error) {

        alert(error.message);
    }
};