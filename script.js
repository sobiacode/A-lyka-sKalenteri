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

  document.getElementById("monthTitle").innerText =
    months[month] + " " + year;

  const monthImages = [
    "❄️", // January
    "❤️", // February
    "🌷", // March
    "🌱", // April
    "🌸", // May
    "☀️", // June
    "🏖️", // July
    "🍉", // August
    "🍁", // September
    "🎃", // October
    "☕", // November
    "🎄" // December
  ];
document.getElementById("monthImage").innerText = monthImages[month];
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
updateReminders();
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
function updateReminders() {

  const reminderList =
    document.getElementById("reminderList");

  reminderList.innerHTML = "";

  const today = new Date();

  Object.keys(events).forEach(function(key) {

    const parts = key.split("-");

    const eventDate = new Date(
      parts[0],
      parts[1],
      parts[2]
    );

    const difference =
      Math.ceil(
        (eventDate - today) /
        (1000 * 60 * 60 * 24)
      );

    const li = document.createElement("li");

    if (difference === 0) {
      li.innerText =
      "⏰ " + events[key] + " on tänään";
    }

    else if (difference === 1) {
      li.innerText =
      "📅 " + events[key] + " on huomenna";
    }

    else if (
      difference > 1 &&
      difference <= 7
    ) {
      li.innerText =
      "⌛ " + events[key] +
      " in " + difference +
      " päivän päästä";
    }

    if (li.innerText !== "") {
      reminderList.appendChild(li);
    }

  });
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

document.getElementById("blueTheme").onclick = function () {
  document.body.className = "blue-theme";
  localStorage.setItem("theme", "blue-theme");
};

document.getElementById("greenTheme").onclick = function () {
  document.body.className = "green-theme";
  localStorage.setItem("theme", "green-theme");
};

document.getElementById("purpleTheme").onclick = function () {
  document.body.className = "purple-theme";
  localStorage.setItem("theme", "purple-theme");
};

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.body.className = savedTheme;
}

document.getElementById("todayBtn").onclick = function () {
  const now = new Date();

  month = now.getMonth();
  year = now.getFullYear();

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};
document.getElementById("checkReminderBtn").onclick = function () {
  const reminderItems =
    document.querySelectorAll("#reminderList li");

  if (reminderItems.length > 0) {
    alert("Sinulla on muistutuksia!");

    const sound = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );

    sound.play();
  } else {
    alert("Ei muistutuksia tällä hetkellä.");
  }
};
let timeLeft = 10;
let timer;

let currentSound;

document.getElementById("startTimerBtn").onclick = function () {

  clearInterval(timer);

  timeLeft = 10;

  timer = setInterval(function () {

    document.getElementById("timerDisplay").innerText =
      "00:" + (timeLeft < 10 ? "0" : "") + timeLeft;

    timeLeft--;

    if (timeLeft < 0) {

      clearInterval(timer);

 document.getElementById("timerDisplay").innerText =
"🔔 Reminder time!";

      let selectedSound =
document.getElementById("soundSelect").value;

let soundUrl = "";

if (selectedSound === "beep") {
  soundUrl =
  "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
}

else if (selectedSound === "bell") {
  soundUrl =
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
}

else if (selectedSound === "alarm") {
  soundUrl =
  "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
}

else if (selectedSound === "digital") {
  soundUrl =
  "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
}

else if (selectedSound === "notification") {
  soundUrl =
  "https://actions.google.com/sounds/v1/cartoon/pop.ogg";
}

else if (selectedSound === "ring") {
  soundUrl =
  "https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg";
}
currentSound = new Audio(soundUrl);
currentSound.play();

  
    }

  }, 1000);

};
document.getElementById("pauseTimerBtn").onclick =
function () {

  clearInterval(timer);

  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
  }

  document.getElementById("timerDisplay").innerText =
  "⏸ Paused";
};

document.getElementById("snoozeBtn").onclick =
function () {

  clearInterval(timer);

  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
  }

  timeLeft = 5;

  document.getElementById("timerDisplay").innerText =
  "😴 Snoozed for 5 seconds";

  timer = setInterval(function () {

    document.getElementById("timerDisplay").innerText =
      "00:" + (timeLeft < 10 ? "0" : "") + timeLeft;

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);

      document.getElementById("timerDisplay").innerText =
        "🔔 Reminder time!";

      document.getElementById("startTimerBtn").click();
    }

  }, 1000);
};