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

            <div class="${cellClass}">

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

        /*
            We build this in the next step.
        */

        console.log(
            "Create event form coming next"
        );
    };


    /* -------------------------------- */
    /* Init                             */
    /* -------------------------------- */

const initPage = async () => {

    renderWeekdays();

    await loadEvents();

};
