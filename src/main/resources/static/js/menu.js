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