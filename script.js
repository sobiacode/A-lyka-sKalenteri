let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
const currentDate = new Date();

let month =
  localStorage.getItem("savedMonth") !== null
    ? Number(localStorage.getItem("savedMonth"))
    : currentDate.getMonth();

let year =
  localStorage.getItem("savedYear") !== null
    ? Number(localStorage.getItem("savedYear"))
    : currentDate.getFullYear();

const months = [
    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", 
    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu" ,"Joulukuu"
];
const holidays = {
  "2026-0-1": "🎉 Uusivuosi",
  "2026-4-1": "🎈 Vappu",
  "2026-11-25": "🎄 Joulu"
};
function updateMonth() { 
  document.getElementById("monthTitle").innerText = months[month] + " " + year;
  createDays();
 }
document.getElementById("prevBtn").onclick = function () {
  month--;

  if (month < 0) {
    month = 11;
    year--;
  }

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();

document.getElementById("darkModeBtn").onclick = function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("darkMode", "on");
  } else {
    localStorage.setItem("darkMode", "off");
  }
};

if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark");
}

document.getElementById("searchInput").oninput = function () {
  createDays();
};

function updateClock() {
  const now = new Date();

  document.getElementById("clock").innerText =
    now.toLocaleTimeString();
}

setInterval(updateClock, 1000);

updateClock();

document.getElementById("clearBtn").onclick = function () {
  let confirmDelete = confirm("Delete all events?");

  if (confirmDelete) {
    localStorage.removeItem("calendarEvents");
    events = {};
    createDays();
  }
};

const todayDate = new Date();

document.getElementById("todayText").innerText =
  todayDate.toDateString();