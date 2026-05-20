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
  "0-1": "🎉 Uusivuosi",
  "0-6": "✨ Loppiainen",
  "4-1": "🎈 Vappu",
  "11-6": "🇫🇮 Itsenäisyyspäivä",
  "11-24": "🎄 Jouluaatto",
  "11-25": "🎄 Joulupäivä",
  "11-26": "🎁 Tapaninpäivä"
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
};
document.getElementById("nextBtn").onclick = function () {
  month++;

  if (month > 11) {
    month = 0;
    year++;
  }

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};
const daysBox = document.getElementById("daysBox");
function getDaysInMonth(month, year) {
  // February
  if (month === 1) {
    if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
      return 29;
    }
    return 28;
  }

  // April, June, September, November
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  return 31;
}

function createDays() {
  daysBox.innerHTML = "";
const searchText = document
  .getElementById("searchInput")
  .value
  .toLowerCase();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(month, year);

  let emptyBoxes = firstDay - 1;

  if (emptyBoxes < 0) {
    emptyBoxes = 6;
  }

  for (let i = 0; i < emptyBoxes; i++) {
    const emptyDay = document.createElement("div");
    daysBox.appendChild(emptyDay);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.innerText = i;
   let key = year + "-" + month + "-" + i; 
   let holidayKey = month + "-" + i;
   if (holidays[holidayKey]) {

  day.innerHTML = `
    ${i}<br>
    ${holidays[holidayKey]}
  `;

  day.style.background = "#fef3c7";
  day.style.fontWeight = "bold";
  day.style.color = "#92400e";
}
if (events[key]) {
  if (
  searchText &&
  !events[key].toLowerCase().includes(searchText)
) {
  continue;
}
  let eventText = events[key];

if (eventText.includes("exam")) {
  eventText = "📚 " + eventText;
}

if (eventText.includes("birthday")) {
  eventText = "🎂 " + eventText;
}

if (eventText.includes("meeting")) {
  eventText = "💼 " + eventText;
}

day.innerHTML = `
  ${i}<br>
  ${eventText}
  <span class="deleteBtn">❌</span>
`;
  const deleteBtn = day.querySelector(".deleteBtn");

deleteBtn.onclick = function (event) {

  event.stopPropagation();

  delete events[key];

  localStorage.setItem(
    "calendarEvents",
    JSON.stringify(events)
  );

  createDays();
};
   if (events[key].includes("exam")) {
    day.style.background = "red";
    day.style.color = "white";
  }

  if (events[key].includes("birthday")) {
    day.style.background = "pink";
  }

  if (events[key].includes("meeting")) {
    day.style.background = "blue";
    day.style.color = "white";
  }
}

day.onclick = function () {

  if (events[key]) {

    let choice = prompt("1 = Edit\n2 = Delete");

    if (choice === "1") {

      let newEvent = prompt("Edit event:", events[key]);

      if (newEvent) {
        events[key] = newEvent;
      }

    } else if (choice === "2") {

      delete events[key];
    }

  } else {

    let userEvent = prompt("Enter event:");

    if (userEvent) {
      events[key] = userEvent;
    }
  }

  localStorage.setItem("calendarEvents", JSON.stringify(events));

  createDays();
};
    if (
  i === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear()
 ) {
  day.style.background = "#22c55e";
day.style.color = "white";
day.style.border = "3px solid #facc15";
day.style.fontWeight = "bold";
day.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
 }
    daysBox.appendChild(day);
  }

  updateEventList();
}

function updateEventList() {
  const eventList =
    document.getElementById("eventList");

  const eventCount =
    document.getElementById("eventCount");

  eventList.innerHTML = "";

  const eventKeys = Object.keys(events);
  let examCount = 0;
let meetingCount = 0;
let birthdayCount = 0;

  eventCount.innerText =
    "Tapahtumia yhteensä: " + eventKeys.length;

  eventKeys.forEach(function (key) {
    let eventText = events[key].toLowerCase();

if (
  eventText.includes("exam") ||
  eventText.includes("koe") ||
  eventText.includes("kokeet")
) {
  examCount++;
}

if (
  eventText.includes("meeting") ||
  eventText.includes("tapaaminen") ||
  eventText.includes("tapaamiset")
) {
  meetingCount++;
}

if (
  eventText.includes("birthday") ||
  eventText.includes("syntymäpäivä")
) {
  birthdayCount++;
}

    const li = document.createElement("li");

    li.innerText =
      key + " → " + events[key];

    eventList.appendChild(li);

  });
  document.getElementById("examCount").innerText =
"Kokeet: " + examCount;

document.getElementById("meetingCount").innerText =
"Tapaamiset: " + meetingCount;

document.getElementById("birthdayCount").innerText =
"Syntymäpäivät: " + birthdayCount;
}

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

  let confirmDelete = confirm(
    "Haluatko poista?"
  );

  if (confirmDelete) {

    localStorage.removeItem("calendarEvents");

    events = {};

    createDays();
  }
};
const today = new Date();

document.getElementById("todayText").innerText =
  today.toDateString();
  document.getElementById("todayBtn").onclick = function () {
  const now = new Date();

  month = now.getMonth();
  year = now.getFullYear();

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};