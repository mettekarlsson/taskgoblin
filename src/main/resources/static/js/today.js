
// Retrieve today date
const todayDateElement = document.querySelector(".today-date");

const today = new Date();

const formattedDate = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
});

todayDateElement.innerHTML = `
    <span class="today-date-icon">📅</span>
    ${formattedDate}
`;