let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
function addFixedSchedule() {
  events["2026-7-20"] = ["📚 Projektin esitys"];

  for (let d = 15; d <= 31; d++) {
    events["2026-7-" + d] = ["💼 Työharjoittelu"];
  }

  for (let d = 1; d <= 15; d++) {
    events["2026-8-" + d] = ["💼 Työharjoittelu"];
  }

  for (let d = 22; d <= 31; d++) {
    events["2026-11-" + d] = ["❄ Talviloma"];
  }

  for (let d = 1; d <= 6; d++) {
    events["2027-0-" + d] = ["❄ Talviloma"];
  }

  saveEvents();
}
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

      const isOriginalDate = sourceDate === key;
      const elapsedDays =
        (occurrenceDate.time - originalDate.time) / 86400000;

      let occursOnDate = isOriginalDate;

      if (!isOriginalDate) {
        if (repeat === "daily") {
          occursOnDate = true;
        } else if (repeat === "weekly") {
          occursOnDate = elapsedDays % 7 === 0;
        } else if (repeat === "monthly") {
          occursOnDate = occurrenceDate.day === originalDate.day;
        } else if (repeat === "yearly") {
          occursOnDate =
            occurrenceDate.month === originalDate.month &&
            occurrenceDate.day === originalDate.day;
        }
      }

      if (!occursOnDate) {
        return;
      }

      if (repeat === "none" || typeof eventItem !== "object" || !eventItem) {
        dayEvents.push(eventItem);
        return;
      }

      dayEvents.push({
        ...eventItem,
        sourceDate: sourceDate,
        sourceIndex: sourceIndex,
        occurrenceDate: key
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
       '<small class="calendar-event" style="color:' + eventColor + ';" data-date="' + key + '" data-index="' + index + '" data-source-date="' + sourceDate + '" data-source-index="' + sourceIndex + '">' +
        icon + title + photoIcon +
       '</small><br>';
            });

            day.innerHTML =
  dayNumber +
  "<br>" +
  eventHtml;

if (
  !eventHtml.includes("Työharjoittelu") &&
  !eventHtml.includes("Projektin esitys") &&
  !eventHtml.includes("Talviloma")
) {
  day.innerHTML =
    dayNumber +
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
}

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
  addFixedSchedule();
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
document.getElementById("saveEventBtn").onclick = function () {
  if (!selectedKey) {
    alert("Valitse ensin päivä.");
    return;
  }

  const eventInput = document.getElementById("eventInput");
  const categorySelect = document.getElementById("categorySelect");

  const eventName = eventInput.value.trim();
  const category = categorySelect.value;

  const imageInput = document.getElementById("eventImage");
const imageFile = imageInput.files[0];

  if (eventName === "") {
    alert("Kirjoita tapahtuman nimi.");
    return;
  }

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
document.getElementById("addBtn").onclick = function () {
  const num1 = Number(document.getElementById("num1").value);
  const num2 = Number(document.getElementById("num2").value);

  const result = num1 + num2;

  document.getElementById("calcResult").innerText =
    "Tulos: " + result;
};
updateMonth();
const eventModal = document.getElementById("eventModal");
const closeEventModal = document.getElementById("closeEventModal");

const eventDetailsText = document.getElementById("eventDetailsText");
const eventDate = document.getElementById("eventDate");

const modalEventImage = document.getElementById("modalEventImage");
const eventImagePreview = document.getElementById("eventImagePreview");
const eventGallery = document.getElementById("eventGallery");

const removePhotoBtn = document.getElementById("removePhotoBtn");

let selectedEventDate = "";
let selectedEventIndex = "";
let selectedImageData = "";

closeEventModal.addEventListener("click", function () {
    eventModal.classList.add("hidden");
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
      eventImagePreview.src = photo;
      eventImagePreview.classList.remove("hidden");
    });

    eventGallery.appendChild(thumbnail);
  });
}
document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("calendar-event")) {
        return;
    }

const occurrenceDate = event.target.dataset.date;
const sourceDate = event.target.dataset.sourceDate || occurrenceDate;
const sourceIndexValue =
    event.target.dataset.sourceIndex ?? event.target.dataset.index;
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

const clickedEvent = events[sourceDate][sourceIndex];
if (!clickedEvent.images) {
    clickedEvent.images = [];
}
showEventGallery(clickedEvent);

selectedImageData = clickedEvent.image || "";
modalEventImage.value = "";

const clickedTitle = getEventTitle(clickedEvent);

eventDetailsText.textContent = clickedTitle;
eventDate.textContent = occurrenceDate;

eventImagePreview.src = "";
eventImagePreview.classList.add("hidden");  

document.getElementById("eventCategory").textContent =
    clickedEvent.category || "General";

document.getElementById("eventTimeInput").value =
    clickedEvent.time || "";

document.getElementById("eventLocationInput").value =
    clickedEvent.location || "";

document.getElementById("eventNotesInput").value =
    clickedEvent.notes || "";

document.getElementById("eventThemeInput").value =
    clickedEvent.theme || "nature";

document.getElementById("eventRepeatInput").value =
    clickedEvent.repeat || "none";


eventModal.classList.remove("hidden");

});
document.getElementById("saveEventDetails").addEventListener("click", function () {

    const selectedEvent = events[selectedEventDate][selectedEventIndex];

selectedEvent.notes = document.getElementById("eventNotesInput").value;
selectedEvent.time = document.getElementById("eventTimeInput").value;
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

saveEvents();
createDays();

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

    selectedImageData = "";
    eventImagePreview.src = "";
    eventImagePreview.classList.add("hidden");

});
