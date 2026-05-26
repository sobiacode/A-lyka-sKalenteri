let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
const currentDate = new Date();

let month = localStorage.getItem("savedMonth") !== null
  ? Number(localStorage.getItem("savedMonth"))
  : currentDate.getMonth();

let year = localStorage.getItem("savedYear") !== null
  ? Number(localStorage.getItem("savedYear"))
  : currentDate.getFullYear();

const months = [
  "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu",
  "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu",
  "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"
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

const daysBox = document.getElementById("daysBox");

function getEventsForDay(key) {
  if (!events[key]) return [];

  if (Array.isArray(events[key])) {
    return events[key];
  }

  return [events[key]];
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function getDaysInMonth(month, year) {
  if (month === 1) {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 29;
    }
    return 28;
  }

  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  return 31;
}

function updateMonth() {
  document.getElementById("monthTitle").innerText =
    months[month] + " " + year;

  const monthImages = [
    "❄️", "❤️", "🌷", "🌱", "🌸", "☀️",
    "🏖️", "🍉", "🍁", "🎃", "☕", "🎄"
  ];

  document.getElementById("monthImage").innerText = monthImages[month];

  createDays();
}

function createDays() {
  daysBox.innerHTML = "";

  const searchText =
    document.getElementById("searchInput").value.toLowerCase();

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

    const key = year + "-" + month + "-" + i;
    const holidayKey = month + "-" + i;

    day.innerHTML = i;

    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add("today-circle");
    }

    if (holidays[holidayKey]) {
      day.innerHTML = i + "<br>" + holidays[holidayKey];
      day.style.background = "#fef3c7";
      day.style.fontWeight = "bold";
      day.style.color = "#92400e";
    }

    const dayEvents = getEventsForDay(key);

    if (dayEvents.length > 0) {
      const allText = dayEvents.join(" ").toLowerCase();

      if (!searchText || allText.includes(searchText)) {
        let eventHtml = "";

        dayEvents.forEach(function (item) {
          let icon = "• ";

          if (
            item.toLowerCase().includes("exam") ||
            item.toLowerCase().includes("koe")
          ) {
            icon = "📚 ";
          }

          else if (item.toLowerCase().includes("birthday")) {
            icon = "🎂 ";
          }

          else if (item.toLowerCase().includes("meeting")) {
            icon = "💼 ";
          }

          eventHtml += "<small>" + icon + item + "</small><br>";
        });

        day.innerHTML =
          i +
          "<br>" +
          eventHtml +
          '<span class="deleteBtn">❌</span>';

        const deleteBtn = day.querySelector(".deleteBtn");

        deleteBtn.onclick = function (event) {
          event.stopPropagation();

          delete events[key];
          saveEvents();
          createDays();
        };

        if (allText.includes("exam") || allText.includes("koe")) {
          day.style.background = "#fef2f2";
          day.style.color = "#111827";
        }

        if (allText.includes("birthday")) {
          day.style.background = "#fce7f3";
        }

        if (allText.includes("meeting")) {
          day.style.background = "#dbeafe";
          day.style.color = "#111827";
        }
      }
    }

    day.onclick = function () {
      if (events[key]) {
        let choice = prompt(
          "1 = Add new event\n2 = Edit all events\n3 = Delete all events"
        );

        if (choice === "1") {
          addEventToDay(key);
        }

        else if (choice === "2") {
          let currentEvents = getEventsForDay(key).join("\n");

          let editedEvents = prompt(
            "Edit events. Put each event on a new line:",
            currentEvents
          );

          if (editedEvents) {
            events[key] = editedEvents
              .split("\n")
              .filter(function (item) {
                return item.trim() !== "";
              });
          }
        }

        else if (choice === "3") {
          delete events[key];
        }
      }

      else {
        addEventToDay(key);
      }

      saveEvents();
      createDays();
    };

    daysBox.appendChild(day);
  }

  updateEventList();
  updateReminders();
}

function addEventToDay(key) {
  let userEvent = prompt("Enter event:");

  if (userEvent) {
    let description = prompt("Enter note / description:");

    let finalEvent = "";

    if (description) {
      finalEvent = userEvent + " - " + description;
    } else {
      finalEvent = userEvent;
    }

    if (!events[key]) {
      events[key] = [];
    }

    if (!Array.isArray(events[key])) {
      events[key] = [events[key]];
    }

    events[key].push(finalEvent);
  }
}

function updateEventList() {
  const eventList = document.getElementById("eventList");
  const eventCount = document.getElementById("eventCount");

  eventList.innerHTML = "";

  const eventKeys = Object.keys(events);

  let examCount = 0;
  let meetingCount = 0;
  let birthdayCount = 0;
  let totalEvents = 0;

  eventKeys.forEach(function (key) {
    const dayEvents = getEventsForDay(key);

    dayEvents.forEach(function (item) {
      totalEvents++;

      let eventText = item.toLowerCase();

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

      const parts = key.split("-");
      const displayDate =
        parts[0] + "-" + (Number(parts[1]) + 1) + "-" + parts[2];

      li.innerText = displayDate + " → " + item;

      eventList.appendChild(li);
    });
  });

  eventCount.innerText =
    "Tapahtumia yhteensä: " + totalEvents;

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

  Object.keys(events).forEach(function (key) {
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

    const dayEvents = getEventsForDay(key);

    dayEvents.forEach(function (item) {
      const li = document.createElement("li");

      if (difference === 0) {
        li.innerText =
          "⏰ " + item + " on tänään";
      }

      else if (difference === 1) {
        li.innerText =
          "📅 " + item + " on huomenna";
      }

      else if (difference > 1 && difference <= 7) {
        li.innerText =
          "⌛ " + item +
          " in " + difference +
          " päivän päästä";
      }

      if (li.innerText !== "") {
        reminderList.appendChild(li);
      }
    });
  });
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

document.getElementById("todayBtn").onclick = function () {
  const now = new Date();

  month = now.getMonth();
  year = now.getFullYear();

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};

document.getElementById("searchInput").oninput = function () {
  createDays();
};

function updateClock() {
  const now = new Date();

  let timeString = now.toLocaleTimeString();

  document.getElementById("clock").innerText =
    timeString;

  document.getElementById("currentTime").innerText =
    timeString;

  document.getElementById("currentDate").innerText =
    now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
}

setInterval(updateClock, 1000);
updateClock();

document.getElementById("clearBtn").onclick = function () {
  let confirmDelete = confirm("Haluatko poistaa?");

  if (confirmDelete) {
    localStorage.removeItem("calendarEvents");
    events = {};
    createDays();
  }
};

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

function getSoundUrl() {
  let selectedSound =
    document.getElementById("soundSelect").value;

  if (selectedSound === "beep") {
    return "https://actions.google.com/sounds/v1/alarms/beep_short.ogg";
  }

  if (selectedSound === "bell") {
    return "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";
  }

  if (selectedSound === "alarm") {
    return "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";
  }

  if (selectedSound === "digital") {
    return "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
  }

  if (selectedSound === "notification") {
    return "https://actions.google.com/sounds/v1/cartoon/pop.ogg";
  }

  if (selectedSound === "ring") {
    return "https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg";
  }
}

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

      currentSound = new Audio(getSoundUrl());
      currentSound.play();
    }
  }, 1000);
};

document.getElementById("pauseTimerBtn").onclick = function () {
  clearInterval(timer);

  if (currentSound) {
    currentSound.pause();
    currentSound.currentTime = 0;
  }

  document.getElementById("timerDisplay").innerText =
    "⏸ Paused";
};

document.getElementById("snoozeBtn").onclick = function () {
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

      currentSound = new Audio(getSoundUrl());
      currentSound.play();
    }
  }, 1000);
};

updateMonth();