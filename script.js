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

function addHoliday(list, date, text) {
  const key = date.getMonth() + "-" + date.getDate();
  list[key] = text;
}

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month, day);
}

function getSecondSunday(year, month) {
  let date = new Date(year, month, 1);
  let sundayCount = 0;

  while (true) {
    if (date.getDay() === 0) {
      sundayCount++;
      if (sundayCount === 2) return date;
    }
    date.setDate(date.getDate() + 1);
  }
}

function getSaturdayBetween(year, month, startDay, endDay) {
  for (let day = startDay; day <= endDay; day++) {
    const date = new Date(year, month, day);
    if (date.getDay() === 6) return date;
  }
}

function getHolidaysForYear(year) {
  const list = {};

  const easter = getEasterDate(year);

  addHoliday(list, new Date(year, 0, 1), "🎉 Uudenvuodenpäivä");
  addHoliday(list, new Date(year, 0, 6), "✨ Loppiainen");

  addHoliday(list, addDays(easter, -2), "✝️ Pitkäperjantai");
  addHoliday(list, easter, "🌸 Pääsiäispäivä");
  addHoliday(list, addDays(easter, 1), "🌸 Toinen pääsiäispäivä");

  addHoliday(list, new Date(year, 4, 1), "🎈 Vappu");

  addHoliday(list, getSecondSunday(year, 4), "💐 Äitienpäivä");

  addHoliday(list, addDays(easter, 39), "☁️ Helatorstai");
  addHoliday(list, addDays(easter, 49), "🔥 Helluntai");

  const juhannusDay = getSaturdayBetween(year, 5, 20, 26);
  addHoliday(list, addDays(juhannusDay, -1), "☀️ Juhannusaatto");
  addHoliday(list, juhannusDay, "☀️ Juhannuspäivä");

let pyhainpaiva = getSaturdayBetween(year, 9, 31, 31);

if (!pyhainpaiva) {
  pyhainpaiva = getSaturdayBetween(year, 10, 1, 6);
}

addHoliday(list, pyhainpaiva, "🕯️ Pyhäinpäivä");

  addHoliday(list, getSecondSunday(year, 10), "💙 Isänpäivä");

  addHoliday(list, new Date(year, 11, 6), "🇫🇮 Itsenäisyyspäivä");
  addHoliday(list, new Date(year, 11, 24), "🎄 Jouluaatto");
  addHoliday(list, new Date(year, 11, 25), "🎄 Joulupäivä");
  addHoliday(list, new Date(year, 11, 26), "🎁 Tapaninpäivä");

  return list;
}
const daysBox = document.getElementById("daysBox");
let selectedKey = null;
function createEventObject(title, category = "General", notes = "", image = "") {
  return {
    title: title,
    category: category,
    notes: notes,
    image: image
  };
}

function getEventTitle(eventItem) {
  if (typeof eventItem === "string") {
    return eventItem;
  }

  return eventItem.title;
}

function getEventsForDay(key) {
  function parseDateKey(dateKey) {
    const parts = dateKey.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }

    const parsedDate = new Date(parts[0], parts[1], parts[2]);

    if (
      parsedDate.getFullYear() !== parts[0] ||
      parsedDate.getMonth() !== parts[1] ||
      parsedDate.getDate() !== parts[2]
    ) {
      return null;
    }

    return {
      year: parts[0],
      month: parts[1],
      day: parts[2],
      time: Date.UTC(parts[0], parts[1], parts[2])
    };
  }

  const occurrenceDate = parseDateKey(key);

  if (!occurrenceDate) {
    return [];
  }

  const dayEvents = [];
  const sourceDates = Object.keys(events);
  const exactDatePosition = sourceDates.indexOf(key);

  if (exactDatePosition > 0) {
    sourceDates.splice(exactDatePosition, 1);
    sourceDates.unshift(key);
  }

  sourceDates.forEach(function (sourceDate) {
    const originalDate = parseDateKey(sourceDate);

    if (!originalDate || occurrenceDate.time < originalDate.time) {
      return;
    }

    const storedEvents = Array.isArray(events[sourceDate])
      ? events[sourceDate]
      : [events[sourceDate]];

    storedEvents.forEach(function (eventItem, sourceIndex) {
      const repeat =
        eventItem && typeof eventItem === "object"
          ? eventItem.repeat || "none"
          : "none";
      const storedEndDate =
        eventItem && typeof eventItem === "object" && eventItem.endDate
          ? parseDateKey(eventItem.endDate)
          : null;
      const durationDays =
        storedEndDate && storedEndDate.time >= originalDate.time
          ? (storedEndDate.time - originalDate.time) / 86400000
          : 0;

      let occurrenceStart = null;

      for (let offset = 0; offset <= durationDays; offset++) {
        const candidateTime = occurrenceDate.time - offset * 86400000;

        if (candidateTime < originalDate.time) {
          break;
        }

        const candidateDateValue = new Date(candidateTime);
        const candidateDate = {
          year: candidateDateValue.getUTCFullYear(),
          month: candidateDateValue.getUTCMonth(),
          day: candidateDateValue.getUTCDate(),
          time: candidateTime
        };
        const elapsedDays =
          (candidateDate.time - originalDate.time) / 86400000;
        let matchesRepeat = false;

        if (repeat === "none") {
          matchesRepeat = candidateDate.time === originalDate.time;
        } else if (repeat === "daily") {
          matchesRepeat = true;
        } else if (repeat === "weekly") {
          matchesRepeat = elapsedDays % 7 === 0;
        } else if (repeat === "monthly") {
          matchesRepeat = candidateDate.day === originalDate.day;
        } else if (repeat === "yearly") {
          matchesRepeat =
            candidateDate.month === originalDate.month &&
            candidateDate.day === originalDate.day;
        }

        if (matchesRepeat) {
          occurrenceStart = candidateDate;
          break;
        }
      }

      if (!occurrenceStart) {
        return;
      }

      if (
        repeat === "none" &&
        durationDays === 0 &&
        sourceDate === key
      ) {
        dayEvents.push(eventItem);
        return;
      }

      const occurrenceEndValue = new Date(
        occurrenceStart.time + durationDays * 86400000
      );
      const occurrenceStartDate =
        occurrenceStart.year +
        "-" + occurrenceStart.month +
        "-" + occurrenceStart.day;
      const occurrenceEndDate =
        occurrenceEndValue.getUTCFullYear() +
        "-" + occurrenceEndValue.getUTCMonth() +
        "-" + occurrenceEndValue.getUTCDate();

      dayEvents.push({
        ...eventItem,
        sourceDate: sourceDate,
        sourceIndex: sourceIndex,
        occurrenceDate: key,
        occurrenceStartDate: occurrenceStartDate,
        occurrenceEndDate: occurrenceEndDate
      });
    });
  });

  return dayEvents;
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}
function createEvent(title, category = "General", image = "") {
    return {
        title: title,
        category: category,
        notes: "",
        image: image,
        images: [],
        location: "",
        time: "",
        repeat: "none"
    };
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
function getWeekNumber(date) {
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);

  tempDate.setDate(
    tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7)
  );

  const week1 = new Date(tempDate.getFullYear(), 0, 4);

  return (
    1 +
    Math.round(
      ((tempDate - week1) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
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
  const holidays = getHolidaysForYear(year);

  let totalEvents = 0;
  let examCount = 0;
  let meetingCount = 0;
  let birthdayCount = 0;

  let emptyBoxes = firstDay - 1;

  if (emptyBoxes < 0) {
    emptyBoxes = 6;
  }

  let dayNumber = 1;
  let firstWeek = true;

  while (dayNumber <= daysInMonth) {
    const mondayDate = new Date(
      year,
      month,
      dayNumber - (firstWeek ? emptyBoxes : 0)
    );

    const weekBox = document.createElement("div");
    weekBox.classList.add("week-number");
    weekBox.innerText = getWeekNumber(mondayDate);
    daysBox.appendChild(weekBox);

    for (let weekday = 0; weekday < 7; weekday++) {
      if (firstWeek && weekday < emptyBoxes) {
        const emptyDay = document.createElement("div");
        daysBox.appendChild(emptyDay);
      }

      else if (dayNumber <= daysInMonth) {
        const day = document.createElement("div");

        const key = year + "-" + month + "-" + dayNumber;
        const holidayKey = month + "-" + dayNumber;

        day.innerHTML = dayNumber;

        if (
          dayNumber === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear()
        ) {
          day.classList.add("today-circle");
        }
      if (holidays[holidayKey]) {
        day.innerHTML =
        dayNumber +
       '<br><small class="holidayText">' +
        holidays[holidayKey] +
       "</small>";

  day.classList.add("holiday-day");
}

        const dayEvents = getEventsForDay(key);

        if (dayEvents.length > 0) {
          const allText = dayEvents.map(getEventTitle).join(" ").toLowerCase();

          if (!searchText || allText.includes(searchText)) {
            let eventHtml = "";

           dayEvents.forEach(function (item, index) {
              const title = getEventTitle(item);
              const sourceDate = item.sourceDate || key;
              const sourceIndex = item.sourceIndex ?? index;
              const occurrenceStartDate = item.occurrenceStartDate || key;
              const occurrenceEndDate =
                item.occurrenceEndDate || occurrenceStartDate;
              totalEvents++;

              let icon = "• ";

              if (
                title.toLowerCase().includes("exam") ||
                title.toLowerCase().includes("koe")
              ) {
                icon = "📚 ";
                examCount++;
              }

              else if (title.toLowerCase().includes("birthday")) {
                icon = "🎂 ";
                birthdayCount++;
              }

              else if (title.toLowerCase().includes("meeting")) {
                icon = "💼 ";
                meetingCount++;
              }

             let photoIcon = "";
             let eventColor = item.color || "#000000";

         if (item.image) {
        photoIcon = " 📷";
}

       eventHtml +=
       '<small class="calendar-event" style="color:' + eventColor + ';" data-date="' + key + '" data-index="' + index + '" data-source-date="' + sourceDate + '" data-source-index="' + sourceIndex + '" data-occurrence-start="' + occurrenceStartDate + '" data-occurrence-end="' + occurrenceEndDate + '">' +
        icon + title + photoIcon +
       '</small><br>';
            });

            day.innerHTML =
  dayNumber +
  "<br>" +
  eventHtml;

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
          selectedKey = key;

          document.querySelectorAll(".days div").forEach(function (box) {
            box.classList.remove("selected-day");
          });

          day.classList.add("selected-day");
        };

        daysBox.appendChild(day);
        dayNumber++;
      }

      else {
        const emptyDay = document.createElement("div");
        daysBox.appendChild(emptyDay);
      }
    }

    firstWeek = false;
  }

  document.getElementById("eventCount").innerText =
    "Tapahtumia yhteensä: " + totalEvents;

  document.getElementById("examCount").innerText =
    "Kokeet: " + examCount;

  document.getElementById("meetingCount").innerText =
    "Tapaamiset: " + meetingCount;

  document.getElementById("birthdayCount").innerText =
    "Syntymäpäivät: " + birthdayCount;

  updateScheduleList();
}

function createAgendaItem(eventItem, dateKey, fallbackIndex, dateLabel) {
  const listItem = document.createElement("li");
  const button = document.createElement("button");
  const title = getEventTitle(eventItem);
  const sourceDate = eventItem.sourceDate || dateKey;
  const sourceIndex = eventItem.sourceIndex ?? fallbackIndex;
  const occurrenceStart = eventItem.occurrenceStartDate || dateKey;
  const occurrenceEnd = eventItem.occurrenceEndDate || occurrenceStart;
  const timeText = eventItem.time
    ? eventItem.time + (eventItem.endTime ? "–" + eventItem.endTime : "")
    : "";

  button.type = "button";
  button.className = "agenda-event";
  button.dataset.date = dateKey;
  button.dataset.sourceDate = sourceDate;
  button.dataset.sourceIndex = sourceIndex;
  button.dataset.occurrenceStart = occurrenceStart;
  button.dataset.occurrenceEnd = occurrenceEnd;

  const dateElement = document.createElement("span");
  dateElement.className = "agenda-event-date";
  dateElement.textContent = dateLabel + (timeText ? " · " + timeText : "");

  const titleElement = document.createElement("span");
  titleElement.className = "agenda-event-title";
  titleElement.textContent = title;

  button.appendChild(dateElement);
  button.appendChild(titleElement);
  listItem.appendChild(button);

  return listItem;
}

function addEmptyAgendaMessage(list, message) {
  const emptyItem = document.createElement("li");
  emptyItem.className = "agenda-empty";
  emptyItem.textContent = message;
  list.appendChild(emptyItem);
}

function updateScheduleList() {
  const scheduleList = document.getElementById("scheduleList");
  const daysInMonth = getDaysInMonth(month, year);

  scheduleList.innerHTML = "";

  for (let day = 1; day <= daysInMonth; day++) {
    const key = year + "-" + month + "-" + day;
    const dayEvents = getEventsForDay(key);

    dayEvents.forEach(function (item, index) {
      const occurrenceStart = item.occurrenceStartDate || key;

      if (occurrenceStart !== key) {
        return;
      }

      const dateLabel = day + "." + (month + 1) + ".";
      scheduleList.appendChild(
        createAgendaItem(item, key, index, dateLabel)
      );
    });
  }

  if (!scheduleList.children.length) {
    addEmptyAgendaMessage(scheduleList, "Ei tapahtumia tässä kuussa.");
  }
}

function updateReminders() {
  const reminderList = document.getElementById("reminderList");
  const today = new Date();
  const seenOccurrences = new Set();

  today.setHours(0, 0, 0, 0);
  reminderList.innerHTML = "";

  for (let offset = 0; offset <= 7; offset++) {
    const reminderDate = new Date(today);
    reminderDate.setDate(today.getDate() + offset);

    const key =
      reminderDate.getFullYear() +
      "-" + reminderDate.getMonth() +
      "-" + reminderDate.getDate();
    const dayEvents = getEventsForDay(key);

    dayEvents.forEach(function (item, index) {
      const sourceDate = item.sourceDate || key;
      const sourceIndex = item.sourceIndex ?? index;
      const occurrenceStart = item.occurrenceStartDate || key;
      const occurrenceId =
        sourceDate + ":" + sourceIndex + ":" + occurrenceStart;

      if (seenOccurrences.has(occurrenceId)) {
        return;
      }

      seenOccurrences.add(occurrenceId);

      let dateLabel = reminderDate.toLocaleDateString("fi-FI", {
        day: "numeric",
        month: "short"
      });

      if (offset === 0) {
        dateLabel = occurrenceStart === key ? "Tänään" : "Käynnissä";
      } else if (offset === 1) {
        dateLabel = "Huomenna";
      }

      reminderList.appendChild(
        createAgendaItem(item, key, index, dateLabel)
      );
    });
  }

  if (!reminderList.children.length) {
    addEmptyAgendaMessage(reminderList, "Ei muistutuksia seuraavalle 7 päivälle.");
  }
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

function showEventFormError(message, focusTitle) {
  const errorMessage = document.getElementById("eventFormError");
  const eventInput = document.getElementById("eventInput");

  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  eventInput.classList.toggle("input-error", Boolean(focusTitle));

  if (focusTitle) {
    eventInput.focus();
  }
}

function clearEventFormError() {
  const errorMessage = document.getElementById("eventFormError");
  const eventInput = document.getElementById("eventInput");

  errorMessage.textContent = "";
  errorMessage.classList.add("hidden");
  eventInput.classList.remove("input-error");
}

document.getElementById("eventInput").addEventListener("input", function () {
  clearEventFormError();
});

document.getElementById("saveEventBtn").onclick = function () {
  const eventInput = document.getElementById("eventInput");
  const categorySelect = document.getElementById("categorySelect");

  if (!selectedKey) {
    showEventFormError("Valitse ensin päivä.", false);
    return;
  }

  const eventName = eventInput.value.trim();
  const category = categorySelect.value;

  const imageInput = document.getElementById("eventImage");
const imageFile = imageInput.files[0];

  if (eventName === "") {
    showEventFormError("Kirjoita tapahtuman nimi.", true);
    return;
  }

  clearEventFormError();

  const finalEvent = category + ": " + eventName;

  if (!events[selectedKey]) {
    events[selectedKey] = [];
  }
  
if (imageFile) {
  const reader = new FileReader();

  reader.onload = function () {
    events[selectedKey].push(
      createEvent(finalEvent, category, reader.result)
    );

    saveEvents();
    createDays();
    updateReminders();

    eventInput.value = "";
    imageInput.value = "";
  };

  reader.readAsDataURL(imageFile);
} else {
  events[selectedKey].push(
    createEvent(finalEvent, category)
  );

  saveEvents();
  createDays();
  updateReminders();

  eventInput.value = "";
}
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
    updateReminders();
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
  today.toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

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
  updateReminders();
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
document.getElementById("addBtn").onclick = function () {
  const num1 = Number(document.getElementById("num1").value);
  const num2 = Number(document.getElementById("num2").value);

  const result = num1 + num2;

  document.getElementById("calcResult").innerText =
    "Tulos: " + result;
};

const weatherBox = document.getElementById("weatherBox");
const weatherStatus = document.getElementById("weatherStatus");
const weatherContent = document.getElementById("weatherContent");
const weatherAlert = document.getElementById("weatherAlert");
const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");
const weatherCacheKey = "smartCalendarWeather";

function getWeatherDescription(code) {
  const weatherCodes = {
    0: ["☀️", "Selkeää"],
    1: ["🌤️", "Enimmäkseen selkeää"],
    2: ["⛅", "Puolipilvistä"],
    3: ["☁️", "Pilvistä"],
    45: ["🌫️", "Sumua"],
    48: ["🌫️", "Jäätävää sumua"],
    51: ["🌦️", "Kevyttä tihkua"],
    53: ["🌦️", "Tihkusadetta"],
    55: ["🌧️", "Voimakasta tihkua"],
    56: ["🌧️", "Kevyttä jäätävää tihkua"],
    57: ["🌧️", "Jäätävää tihkua"],
    61: ["🌦️", "Kevyttä sadetta"],
    63: ["🌧️", "Sadetta"],
    65: ["🌧️", "Voimakasta sadetta"],
    66: ["🧊", "Kevyttä jäätävää sadetta"],
    67: ["🧊", "Jäätävää sadetta"],
    71: ["🌨️", "Kevyttä lumisadetta"],
    73: ["🌨️", "Lumisadetta"],
    75: ["❄️", "Voimakasta lumisadetta"],
    77: ["❄️", "Lumijyväsiä"],
    80: ["🌦️", "Kevyitä sadekuuroja"],
    81: ["🌧️", "Sadekuuroja"],
    82: ["⛈️", "Voimakkaita sadekuuroja"],
    85: ["🌨️", "Lumikuuroja"],
    86: ["❄️", "Voimakkaita lumikuuroja"],
    95: ["⛈️", "Ukkosta"],
    96: ["⛈️", "Ukkosta ja rakeita"],
    99: ["⛈️", "Voimakasta ukkosta ja rakeita"]
  };

  return weatherCodes[code] || ["🌡️", "Säätieto saatavilla"];
}

function getWeatherNotices(data) {
  const current = data.current || {};
  const daily = data.daily || {};
  const code = Number(current.weather_code);
  const temperature = Number(current.temperature_2m);
  const wind = Number(current.wind_speed_10m);
  const gusts = Number(current.wind_gusts_10m);
  const rain = Number((daily.precipitation_sum || [0])[0]);
  const snow = Number((daily.snowfall_sum || [0])[0]);
  const notices = [];

  if ([95, 96, 99].includes(code)) {
    notices.push("⛈️ Ukkosriski – vältä avointa aluetta.");
  }

  if ([56, 57, 66, 67].includes(code)) {
    notices.push("🧊 Jäätävän sateen riski – varaudu liukkauteen.");
  }

  if (rain >= 15 || [65, 82].includes(code)) {
    notices.push("🌧️ Runsaan sateen mahdollisuus.");
  }

  if (snow >= 5 || [75, 86].includes(code)) {
    notices.push("❄️ Runsaan lumisateen mahdollisuus.");
  }

  if (wind >= 45 || gusts >= 60) {
    notices.push("💨 Voimakkaan tuulen mahdollisuus.");
  }

  if (temperature >= 30) {
    notices.push("🔥 Kuuma sää – muista juoda vettä.");
  } else if (temperature <= -20) {
    notices.push("🥶 Kova pakkanen – pukeudu lämpimästi.");
  }

  return notices;
}

function renderWeather(data, cached) {
  const current = data.current || {};
  const daily = data.daily || {};
  const description = getWeatherDescription(Number(current.weather_code));
  const high = Number((daily.temperature_2m_max || [NaN])[0]);
  const low = Number((daily.temperature_2m_min || [NaN])[0]);
  const rainChance = Number((daily.precipitation_probability_max || [NaN])[0]);
  const notices = getWeatherNotices(data);
  const updateTime = current.time && current.time.includes("T")
    ? current.time.split("T")[1]
    : "--:--";

  document.getElementById("weatherIcon").textContent = description[0];
  document.getElementById("weatherTemperature").textContent =
    Math.round(Number(current.temperature_2m)) + "°";
  document.getElementById("weatherDescription").textContent = description[1];
  document.getElementById("weatherFeelsLike").textContent =
    "Tuntuu kuin " + Math.round(Number(current.apparent_temperature)) + "°";
  document.getElementById("weatherRange").textContent =
    "Ylin " + Math.round(high) + "° · Alin " + Math.round(low) + "°";
  document.getElementById("weatherWind").textContent =
    "Tuuli " + Math.round(Number(current.wind_speed_10m)) + " km/h";
  document.getElementById("weatherRain").textContent =
    "Sade " + (Number.isFinite(rainChance) ? Math.round(rainChance) + "%" : "--");

  weatherAlert.classList.toggle("weather-alert-warning", notices.length > 0);
  weatherAlert.textContent = notices.length > 0
    ? "Kalenterin säähuomio: " + notices.join(" ")
    : "✓ Ei erityisiä säähuomioita juuri nyt.";

  document.getElementById("weatherUpdated").textContent = cached
    ? "Näytetään viimeisin tallennettu sää (päivitys epäonnistui)."
    : "Päivitetty tänään klo " + updateTime;

  weatherStatus.classList.add("hidden");
  weatherContent.classList.remove("hidden");
}

function readCachedWeather() {
  try {
    const cachedWeather = JSON.parse(localStorage.getItem(weatherCacheKey));
    return cachedWeather && cachedWeather.data ? cachedWeather.data : null;
  } catch (error) {
    return null;
  }
}

async function loadWeather() {
  const weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=61.566942&longitude=21.813336" +
    "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation" +
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,precipitation_probability_max,weather_code" +
    "&timezone=Europe%2FHelsinki&forecast_days=1";

  refreshWeatherBtn.disabled = true;
  weatherBox.setAttribute("aria-busy", "true");
  weatherStatus.textContent = "Säätietoja päivitetään…";
  weatherStatus.classList.remove("hidden");

  try {
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const weatherData = await response.json();

    if (!weatherData.current || !weatherData.daily) {
      throw new Error("Weather response is incomplete");
    }

    localStorage.setItem(weatherCacheKey, JSON.stringify({
      savedAt: Date.now(),
      data: weatherData
    }));
    renderWeather(weatherData, false);
  } catch (error) {
    const cachedWeather = readCachedWeather();

    if (cachedWeather) {
      renderWeather(cachedWeather, true);
    } else {
      weatherContent.classList.add("hidden");
      weatherStatus.textContent =
        "Säätietoja ei voitu ladata. Yritä hetken kuluttua uudelleen.";
    }
  } finally {
    refreshWeatherBtn.disabled = false;
    weatherBox.setAttribute("aria-busy", "false");
  }
}

refreshWeatherBtn.addEventListener("click", loadWeather);
loadWeather();
setInterval(loadWeather, 30 * 60 * 1000);

updateMonth();
updateReminders();
const eventModal = document.getElementById("eventModal");
const closeEventModal = document.getElementById("closeEventModal");

const eventDetailsText = document.getElementById("eventDetailsText");
const eventDate = document.getElementById("eventDate");

const modalEventImage = document.getElementById("modalEventImage");
const eventImagePreview = document.getElementById("eventImagePreview");
const eventGallery = document.getElementById("eventGallery");

const removePhotoBtn = document.getElementById("removePhotoBtn");
const deleteEventBtn = document.getElementById("deleteEventBtn");
const deleteConfirmPanel = document.getElementById("deleteConfirmPanel");
const deleteConfirmText = document.getElementById("deleteConfirmText");
const cancelDeleteEvent = document.getElementById("cancelDeleteEvent");
const confirmDeleteEvent = document.getElementById("confirmDeleteEvent");

let selectedEventDate = "";
let selectedEventIndex = "";
let selectedOccurrenceDate = "";
let selectedImageData = "";

function calendarKeyToDateInput(key) {
  const parts = key.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return "";
  }

  const monthValue = String(parts[1] + 1).padStart(2, "0");
  const dayValue = String(parts[2]).padStart(2, "0");

  return parts[0] + "-" + monthValue + "-" + dayValue;
}

function dateInputToCalendarKey(value) {
  const parts = value.split("-").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return "";
  }

  const monthIndex = parts[1] - 1;
  const parsedDate = new Date(parts[0], monthIndex, parts[2]);

  if (
    parsedDate.getFullYear() !== parts[0] ||
    parsedDate.getMonth() !== monthIndex ||
    parsedDate.getDate() !== parts[2]
  ) {
    return "";
  }

  return parts[0] + "-" + monthIndex + "-" + parts[2];
}

function calendarKeyDayDifference(startKey, endKey) {
  const startParts = startKey.split("-").map(Number);
  const endParts = endKey.split("-").map(Number);
  const startTime = Date.UTC(startParts[0], startParts[1], startParts[2]);
  const endTime = Date.UTC(endParts[0], endParts[1], endParts[2]);

  return (endTime - startTime) / 86400000;
}

function addDaysToCalendarKey(key, days) {
  const parts = key.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1], parts[2] + days));

  return (
    date.getUTCFullYear() +
    "-" + date.getUTCMonth() +
    "-" + date.getUTCDate()
  );
}

function resetDeleteConfirmation() {
    deleteConfirmPanel.classList.add("hidden");
}

function closeEventModalWindow() {
    resetDeleteConfirmation();
    eventModal.classList.add("hidden");
}

closeEventModal.addEventListener("click", function () {
    closeEventModalWindow();
});

document.addEventListener("keydown", function (event) {
    if (eventModal.classList.contains("hidden")) {
        return;
    }

    const isEscape = event.key === "Escape";
    const isCommandPeriod =
        (event.metaKey || event.ctrlKey) && event.key === ".";

    if (isEscape || isCommandPeriod) {
        event.preventDefault();
        closeEventModalWindow();
    }
});
function showEventGallery(eventItem) {
  eventGallery.innerHTML = "";

  const photos = eventItem.images ? [...eventItem.images] : [];

  if (eventItem.image && !photos.includes(eventItem.image)) {
    photos.push(eventItem.image);
  }

  photos.forEach(function (photo) {
    const thumbnail = document.createElement("img");

    thumbnail.src = photo;
    thumbnail.alt = "Event photo";

    thumbnail.addEventListener("click", function () {
      selectedImageData = photo;
      eventImagePreview.src = photo;
      eventImagePreview.classList.remove("hidden");
    });

    eventGallery.appendChild(thumbnail);
  });
}
document.addEventListener("click", function (event) {
    const eventElement = event.target.closest(
        ".calendar-event, .agenda-event"
    );

    if (!eventElement) {
        return;
    }

const occurrenceDate = eventElement.dataset.date;
const sourceDate = eventElement.dataset.sourceDate || occurrenceDate;
const occurrenceStartDate =
    eventElement.dataset.occurrenceStart || occurrenceDate;
const occurrenceEndDate =
    eventElement.dataset.occurrenceEnd || occurrenceStartDate;
const sourceIndexValue =
    eventElement.dataset.sourceIndex ?? eventElement.dataset.index;
const sourceIndex = Number(sourceIndexValue);

if (
    !occurrenceDate ||
    !sourceDate ||
    !Number.isInteger(sourceIndex) ||
    sourceIndex < 0 ||
    !Array.isArray(events[sourceDate]) ||
    typeof events[sourceDate][sourceIndex] === "undefined"
) {
    return;
}

selectedEventDate = sourceDate;
selectedEventIndex = sourceIndex;
selectedOccurrenceDate = occurrenceStartDate;

const clickedEvent = events[sourceDate][sourceIndex];
if (!clickedEvent.images) {
    clickedEvent.images = [];
}
showEventGallery(clickedEvent);

selectedImageData = clickedEvent.image || "";
modalEventImage.value = "";

const clickedTitle = getEventTitle(clickedEvent);
const clickedCategory = clickedEvent.category || "General";
const categoryPrefix = clickedCategory + ": ";
const editableTitle = clickedTitle.startsWith(categoryPrefix)
    ? clickedTitle.slice(categoryPrefix.length)
    : clickedTitle;

eventDetailsText.value = editableTitle;
eventDate.value = calendarKeyToDateInput(occurrenceStartDate);
document.getElementById("eventEndDate").value =
    calendarKeyToDateInput(occurrenceEndDate);

eventImagePreview.src = "";
eventImagePreview.classList.add("hidden");  

document.getElementById("eventCategory").value = clickedCategory;

document.getElementById("eventTimeInput").value =
    clickedEvent.time || "";

document.getElementById("eventEndTimeInput").value =
    clickedEvent.endTime || "";

document.getElementById("eventLocationInput").value =
    clickedEvent.location || "";

document.getElementById("eventNotesInput").value =
    clickedEvent.notes || "";

document.getElementById("eventThemeInput").value =
    clickedEvent.theme || "nature";

document.getElementById("eventRepeatInput").value =
    clickedEvent.repeat || "none";

resetDeleteConfirmation();
eventModal.classList.remove("hidden");

});

deleteEventBtn.addEventListener("click", function () {
    const sourceEvents = events[selectedEventDate];
    const selectedEvent = Array.isArray(sourceEvents)
        ? sourceEvents[selectedEventIndex]
        : null;

    if (typeof selectedEvent === "undefined" || selectedEvent === null) {
        return;
    }

    const isRecurring =
        typeof selectedEvent === "object" &&
        selectedEvent.repeat &&
        selectedEvent.repeat !== "none";

    deleteConfirmText.textContent = isRecurring
        ? "Delete this recurring series?"
        : "Delete this event?";
    deleteConfirmPanel.classList.remove("hidden");
});

cancelDeleteEvent.addEventListener("click", function () {
    resetDeleteConfirmation();
});

confirmDeleteEvent.addEventListener("click", function () {
    const sourceEvents = events[selectedEventDate];
    const sourceIndex = Number(selectedEventIndex);

    if (
        !Array.isArray(sourceEvents) ||
        !Number.isInteger(sourceIndex) ||
        sourceIndex < 0 ||
        sourceIndex >= sourceEvents.length
    ) {
        resetDeleteConfirmation();
        return;
    }

    sourceEvents.splice(sourceIndex, 1);

    if (sourceEvents.length === 0) {
        delete events[selectedEventDate];
    }

    saveEvents();
    createDays();
    updateReminders();
    closeEventModalWindow();
});

document.getElementById("saveEventDetails").addEventListener("click", function () {

    const selectedEvent = events[selectedEventDate][selectedEventIndex];
    const updatedTitle = eventDetailsText.value.trim();
    const updatedCategory = document.getElementById("eventCategory").value;
    const updatedDate = dateInputToCalendarKey(eventDate.value);
    const updatedEndDate = dateInputToCalendarKey(
        document.getElementById("eventEndDate").value
    );
    const updatedStartTime =
        document.getElementById("eventTimeInput").value;
    const updatedEndTime =
        document.getElementById("eventEndTimeInput").value;

if (!updatedTitle) {
    alert("Please enter an event title.");
    return;
}

if (!updatedDate || !updatedEndDate) {
    alert("Please select valid start and end dates.");
    return;
}

const durationDays = calendarKeyDayDifference(updatedDate, updatedEndDate);

if (durationDays < 0) {
    alert("End date cannot be before start date.");
    return;
}

if (
    durationDays === 0 &&
    updatedStartTime &&
    updatedEndTime &&
    updatedEndTime <= updatedStartTime
) {
    alert("End time must be after start time on the same date.");
    return;
}

selectedEvent.title = updatedCategory + ": " + updatedTitle;
selectedEvent.category = updatedCategory;

selectedEvent.notes = document.getElementById("eventNotesInput").value;
selectedEvent.time = updatedStartTime;
selectedEvent.endTime = updatedEndTime;
selectedEvent.location = document.getElementById("eventLocationInput").value;
selectedEvent.theme = document.getElementById("eventThemeInput").value;
selectedEvent.repeat =
    document.getElementById("eventRepeatInput").value;

selectedEvent.image = selectedImageData;

if (!selectedEvent.images) {
    selectedEvent.images = [];
}

if (
    selectedImageData &&
    !selectedEvent.images.includes(selectedImageData)
) {
    selectedEvent.images.push(selectedImageData);
}

if (!selectedEvent.images) {
    selectedEvent.images = [];
}

if (
    selectedImageData &&
    !selectedEvent.images.includes(selectedImageData)
) {
    selectedEvent.images.push(selectedImageData);
}

if (
    updatedDate !== selectedOccurrenceDate &&
    updatedDate !== selectedEventDate
) {
    const sourceEvents = events[selectedEventDate];

    sourceEvents.splice(selectedEventIndex, 1);

    if (sourceEvents.length === 0) {
        delete events[selectedEventDate];
    }

    if (!events[updatedDate]) {
        events[updatedDate] = [];
    } else if (!Array.isArray(events[updatedDate])) {
        events[updatedDate] = [events[updatedDate]];
    }

    events[updatedDate].push(selectedEvent);
    selectedEventDate = updatedDate;
    selectedEventIndex = events[updatedDate].length - 1;
    selectedOccurrenceDate = updatedDate;
}

selectedEvent.endDate = addDaysToCalendarKey(
    selectedEventDate,
    durationDays
);

saveEvents();
createDays();
updateReminders();

    alert("Event details saved!");

});
modalEventImage.addEventListener("change", function () {
    const file = modalEventImage.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        modalEventImage.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();

        image.onload = function () {
            const maxWidth = 800;
            const maxHeight = 800;

            let width = image.width;
            let height = image.height;

            if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(
                    maxWidth / width,
                    maxHeight / height
                );

                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            context.drawImage(image, 0, 0, width, height);

            selectedImageData = canvas.toDataURL(
                "image/jpeg",
                0.65
            );

            eventImagePreview.src = selectedImageData;
            eventImagePreview.classList.remove("hidden");
        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

removePhotoBtn.addEventListener("click", function () {

    const sourceEvents = events[selectedEventDate];
    const selectedEvent =
        Array.isArray(sourceEvents) &&
        Number.isInteger(Number(selectedEventIndex))
            ? sourceEvents[Number(selectedEventIndex)]
            : null;
    const photoToRemove = selectedImageData;

    if (
        photoToRemove &&
        selectedEvent &&
        typeof selectedEvent === "object"
    ) {
        selectedEvent.images = Array.isArray(selectedEvent.images)
            ? selectedEvent.images.filter(function (photo) {
                return photo !== photoToRemove;
              })
            : [];

        if (selectedEvent.image === photoToRemove) {
            selectedEvent.image = "";
        }

        saveEvents();
        createDays();
        showEventGallery(selectedEvent);
    }

    selectedImageData = "";
    modalEventImage.value = "";
    eventImagePreview.src = "";
    eventImagePreview.classList.add("hidden");

});
