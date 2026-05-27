/* -------------------- */
/* Sidebar */
/* -------------------- */

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

/* -------------------- */
/* Quick add menu */
/* -------------------- */

const quickAddBtn =
    document.getElementById("quick-add-btn");

const quickAddMenu =
    document.getElementById("quick-add-menu");

// Opens and closes the quick add menu
quickAddBtn.addEventListener("click", () => {

    quickAddMenu.classList.toggle("open");

});

// Closes the menu if the user clicks outside it
document.addEventListener("click", (event) => {

    const clickedInside =
        quickAddBtn.contains(event.target) ||
        quickAddMenu.contains(event.target);

    if (!clickedInside) {

        quickAddMenu.classList.remove("open");

    }

});