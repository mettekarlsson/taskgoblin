const renderMenu = () => {

    document.getElementById("app-header").innerHTML = `

        <img
                src="/images/logo.png"
                alt="TaskGoblin logo"
                class="app-logo"
        />

        <button class="hamburger-btn" id="menu-btn">
            <span></span>
            <span></span>
            <span></span>
        </button>

        <aside class="sidebar-content" id="sidebar">

            <button class="close-btn" id="close-btn">
                ×
            </button>

            <img
                    src="/images/MenuHeader.png"
                    alt="Menu decoration"
                    class="menu-header"
            >

            <nav class="sidebar-links">

                <a href="/index.html" data-translate="home">Home</a>
                <a href="/profile.html" data-translate="profile">Profile</a>
                <a href="/tasks.html" data-translate="tasks">Tasks</a>
                <a href="/lists.html" data-translate="lists">Lists</a>
                <a href="/notes.html" data-translate="notes">Notes</a>
                <a href="/calendar.html" data-translate="calendar">Calendar</a>
                <a href="/settings.html" data-translate="settings">Settings</a>

            </nav>

            <div class="sidebar-footer">

                <button
                        class="sidebar-logout-btn"
                        onclick="openLogoutModal()"
                        data-translate="logout"
                >
                    Log out
                </button>

            </div>

            <img
                    src="/images/MenuFooter.png"
                    alt="Menu decoration"
                    class="menu-footer"
            >

        </aside>

    `;

    document.getElementById("app-footer").innerHTML = `

       <div class="quick-add-menu" id="quick-add-menu">

        <!-- Add task -->
        <button
            class="quick-add-option"
            onclick="quickAddTask()"
        >

        <span class="quick-add-icon task-icon">

            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
            </svg>

        </span>

            <span>Add task</span>

        </button>

        <!-- Add note -->
        <button
            class="quick-add-option"
            onclick="quickAddNote()"
        >

        <span class="quick-add-icon note-icon">

            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
            >
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>

        </span>

            <span>Add note</span>

        </button>

        <!-- Add list -->
        <button
            class="quick-add-option"
            onclick="quickAddList()"
        >

        <span class="quick-add-icon list-icon">

            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
            >
                <path d="M8 6h13"/>
                <path d="M8 12h13"/>
                <path d="M8 18h13"/>
                <path d="M3 6h.01"/>
                <path d="M3 12h.01"/>
                <path d="M3 18h.01"/>
            </svg>

        </span>

            <span>Add list</span>

        </button>

        <!-- Add event -->
      
        <button
             class="quick-add-option"
             onclick="quickAddEvent()"
        >

        <span class="quick-add-icon event-icon">

            <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
            >
                <path d="M8 2v4"/>
                <path d="M16 2v4"/>
                <rect width="18" height="18" x="3" y="4" rx="2"/>
                <path d="M3 10h18"/>
            </svg>

        </span>

            <span>Add event</span>

        </button>

    </div>

        <button
                class="quick-add-btn"
                id="quick-add-btn"
        >
            <span></span>
        </button>

        <div
                class="modal"
                id="logout-modal"
        >

            <div class="modal-content">

                <h2 data-translate="logoutTitle">
                    Log out?
                </h2>

                <p data-translate="logoutMessage">
                    Are you sure you want to log out?
                </p>

                <div class="modal-actions">

                    <button
                            class="modal-cancel-btn"
                            onclick="closeLogoutModal()"
                            data-translate="cancel"
                    >
                        Cancel
                    </button>

                    <button
                            class="modal-confirm-btn"
                            onclick="logout()"
                            data-translate="logout"
                    >
                        Log out
                    </button>

                </div>

            </div>

        </div>

    `;
};

const initializeMenu = () => {

    const menuBtn =
        document.getElementById("menu-btn");

    const closeBtn =
        document.getElementById("close-btn");

    const sidebar =
        document.getElementById("sidebar");

    menuBtn.addEventListener("click", () => {
        sidebar.classList.add("open");
    });

    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("open");
    });

    const quickAddBtn =
        document.getElementById("quick-add-btn");

    const quickAddMenu =
        document.getElementById("quick-add-menu");

    quickAddBtn.addEventListener("click", () => {

        quickAddMenu.classList.toggle("open");

    });

    document.addEventListener("click", (event) => {

        const clickedInside =
            quickAddBtn.contains(event.target) ||
            quickAddMenu.contains(event.target);

        if (!clickedInside) {

            quickAddMenu.classList.remove("open");

        }

    });

};

// Opens the create list form and remembers the current page.
const quickAddList = () => {

    const returnTo =
        window.location.pathname;

    window.location.href =
        `/lists.html?quickAdd=true&returnTo=${encodeURIComponent(returnTo)}`;
};

// Opens the create task form and remembers the current page.
const quickAddTask = () => {

    const returnTo =
        window.location.pathname;

    window.location.href =
        `/tasks.html?quickAdd=true&returnTo=${encodeURIComponent(returnTo)}`;
};

// Opens the create note form and remembers the current page.
const quickAddNote = () => {

    const returnTo =
        window.location.pathname;

    window.location.href =
        `/notes.html?quickAdd=true&returnTo=${encodeURIComponent(returnTo)}`;
};

// Opens the create event form and remembers the current page.
const quickAddEvent = () => {

    const returnTo =
        window.location.pathname;

    window.location.href =
        `/calendar.html?quickAdd=true&returnTo=${encodeURIComponent(returnTo)}`;
};