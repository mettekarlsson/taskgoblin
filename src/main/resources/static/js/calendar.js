const loadEvents = async () => {
    try {
        const response = await apiFetch("/calendar");

        if (!response.ok) {
            throw new Error("Failed to load events");
        }

        const events = await response.json();

        renderEvents(events);

    } catch (error) {
        document.getElementById("calendar-content").innerHTML = `
            <p>${error.message}</p>
        `;
    }
};

const renderEvents = (events) => {
    const container = document.getElementById("calendar-content");

    if (events.length === 0) {
        container.innerHTML = "<p>No events found</p>";
        return;
    }

    container.innerHTML = events.map(event => `
        <div>
            <h3>${event.title}</h3>
            <p>${event.startTime}</p>
        </div>
    `).join("");
};

const initPage = async () => {
    await loadEvents();
};

