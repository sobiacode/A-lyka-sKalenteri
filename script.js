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
let currentView = localStorage.getItem("calendarView") || "month";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function eventMatchesFilters(eventItem) {
  const searchElement = document.getElementById("searchInput");
  const categoryElement = document.getElementById("categoryFilter");
  const searchText = searchElement ? searchElement.value.trim().toLowerCase() : "";
  const categoryFilter = categoryElement ? categoryElement.value : "all";
  const title = getEventTitle(eventItem) || "";
  const category =
    eventItem && typeof eventItem === "object"
      ? eventItem.category || "General"
      : "General";
  const searchableText = [
    title,
    eventItem && typeof eventItem === "object" ? eventItem.notes || "" : "",
    eventItem && typeof eventItem === "object" ? eventItem.location || "" : ""
  ].join(" ").toLowerCase();

  return (
    (!searchText || searchableText.includes(searchText)) &&
    (categoryFilter === "all" || category === categoryFilter)
  );
}
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
      const repeatInterval = Math.max(
        1,
        Number(eventItem && eventItem.repeatInterval) || 1
      );
      const repeatUnit =
        eventItem && eventItem.repeatUnit
          ? eventItem.repeatUnit
          : "day";
      const repeatUntilDate =
        eventItem && eventItem.repeatUntil
          ? parseDateKey(eventItem.repeatUntil)
          : null;
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

        if (
          repeatUntilDate &&
          candidateDate.time > repeatUntilDate.time
        ) {
          continue;
        }

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
        } else if (repeat === "custom") {
          if (repeatUnit === "day") {
            matchesRepeat = elapsedDays % repeatInterval === 0;
          } else if (repeatUnit === "week") {
            matchesRepeat = elapsedDays % (repeatInterval * 7) === 0;
          } else if (repeatUnit === "month") {
            const elapsedMonths =
              (candidateDate.year - originalDate.year) * 12 +
              candidateDate.month - originalDate.month;
            matchesRepeat =
              elapsedMonths >= 0 &&
              elapsedMonths % repeatInterval === 0 &&
              candidateDate.day === originalDate.day;
          } else if (repeatUnit === "year") {
            const elapsedYears = candidateDate.year - originalDate.year;
            matchesRepeat =
              elapsedYears >= 0 &&
              elapsedYears % repeatInterval === 0 &&
              candidateDate.month === originalDate.month &&
              candidateDate.day === originalDate.day;
          }
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

function showToast(message, type = "success") {
  const toastRegion = document.getElementById("toastRegion");

  if (!toastRegion) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast-message" + (type === "error" ? " error" : "");
  toast.textContent = message;
  toastRegion.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 3200);
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
        endTime: "",
        endDate: "",
        allDay: false,
        reminder: "none",
        theme: "nature",
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
        const filteredEvents = dayEvents.filter(eventMatchesFilters);

        if (filteredEvents.length > 0) {
          let eventHtml = "";

          filteredEvents.forEach(function (item, index) {
            const title = getEventTitle(item);
            const category =
              item && typeof item === "object"
                ? item.category || "General"
                : "General";
            const sourceDate = item.sourceDate || key;
            const sourceIndex = item.sourceIndex ?? dayEvents.indexOf(item);
            const occurrenceStartDate = item.occurrenceStartDate || key;
            const occurrenceEndDate =
              item.occurrenceEndDate || occurrenceStartDate;
            const categoryClass =
              "category-" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const timeText = item.time
              ? '<span class="calendar-event-time">' + escapeHtml(item.time) + "</span>"
              : "";
            const photoIcon =
              item.image || (Array.isArray(item.images) && item.images.length)
                ? " 📷"
                : "";

            totalEvents++;

            if (category === "Exam" || /exam|koe/i.test(title)) {
              examCount++;
            } else if (category === "Birthday" || /birthday|syntymäpäivä/i.test(title)) {
              birthdayCount++;
            } else if (category === "Meeting" || /meeting|tapaaminen/i.test(title)) {
              meetingCount++;
            }

            if (index < 3) {
              eventHtml +=
                '<small class="calendar-event ' + categoryClass + '" data-date="' + key + '" data-index="' + index + '" data-source-date="' + sourceDate + '" data-source-index="' + sourceIndex + '" data-occurrence-start="' + occurrenceStartDate + '" data-occurrence-end="' + occurrenceEndDate + '">' +
                timeText + escapeHtml(title) + photoIcon +
                "</small>";
            }
          });

          if (filteredEvents.length > 3) {
            eventHtml +=
              '<span class="more-events">+' +
              (filteredEvents.length - 3) +
              " more</span>";
          }

          day.innerHTML = dayNumber + eventHtml;
        }

        day.dataset.date = key;

        day.onclick = function () {
          selectedKey = key;

          document.querySelectorAll(".days div").forEach(function (box) {
            box.classList.remove("selected-day");
          });

          day.classList.add("selected-day");
        };

        day.ondblclick = function (event) {
          if (event.target.closest(".calendar-event")) {
            return;
          }

          openCreateEventModal(key);
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
  renderAlternativeView();
}

function createAgendaItem(eventItem, dateKey, fallbackIndex, dateLabel) {
  const listItem = document.createElement("li");
  const button = document.createElement("button");
  const title = getEventTitle(eventItem);
  const sourceDate = eventItem.sourceDate || dateKey;
  const storedSourceEvents = Array.isArray(events[sourceDate])
    ? events[sourceDate]
    : [];
  const storedItemIndex = storedSourceEvents.indexOf(eventItem);
  const sourceIndex = eventItem.sourceIndex ??
    (storedItemIndex >= 0 ? storedItemIndex : fallbackIndex);
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
  dateElement.textContent = [dateLabel, timeText].filter(Boolean).join(" · ");

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

    dayEvents.filter(eventMatchesFilters).forEach(function (item, index) {
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

function getViewAnchorDate() {
  if (selectedKey) {
    const parts = selectedKey.split("-").map(Number);

    if (parts.length === 3 && !parts.some(Number.isNaN)) {
      return new Date(parts[0], parts[1], parts[2]);
    }
  }

  const today = new Date();

  if (today.getFullYear() === year && today.getMonth() === month) {
    return today;
  }

  return new Date(year, month, 1);
}

function renderAlternativeView() {
  const grid = document.querySelector(".calendar-grid-scroll");
  const help = document.querySelector(".calendar-help");
  const alternativeView = document.getElementById("alternativeView");

  if (!alternativeView || !grid) {
    return;
  }

  const isMonthView = currentView === "month";
  grid.classList.toggle("hidden", !isMonthView);
  help.classList.toggle("hidden", !isMonthView);
  alternativeView.classList.toggle("hidden", isMonthView);
  alternativeView.innerHTML = "";

  if (isMonthView) {
    return;
  }

  const title = document.createElement("h3");
  title.className = "alternative-view-title";
  alternativeView.appendChild(title);

  if (currentView === "day") {
    const date = getViewAnchorDate();
    const key =
      date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
    const panel = document.createElement("div");
    const list = document.createElement("ul");
    const addButton = document.createElement("button");
    const dayEvents = getEventsForDay(key).filter(eventMatchesFilters);

    title.textContent = date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    panel.className = "day-view-panel";
    list.className = "agenda-view-list";

    dayEvents.forEach(function (item, index) {
      list.appendChild(
        createAgendaItem(item, key, index, item.time ? "" : "All day")
      );
    });

    if (!dayEvents.length) {
      addEmptyAgendaMessage(list, "No events for this day.");
    }

    addButton.type = "button";
    addButton.className = "primary-action";
    addButton.textContent = "＋ Add event";
    addButton.addEventListener("click", function () {
      openCreateEventModal(key);
    });

    panel.appendChild(list);
    panel.appendChild(addButton);
    alternativeView.appendChild(panel);
    return;
  }

  if (currentView === "week") {
    const anchorDate = getViewAnchorDate();
    const mondayOffset = (anchorDate.getDay() + 6) % 7;
    const monday = new Date(anchorDate);
    const weekGrid = document.createElement("div");

    monday.setDate(anchorDate.getDate() - mondayOffset);
    title.textContent = "Week of " + monday.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    weekGrid.className = "week-view-grid";

    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(monday);
      const dayCard = document.createElement("article");
      const dateHeading = document.createElement("span");
      const list = document.createElement("ul");

      date.setDate(monday.getDate() + offset);
      const key =
        date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
      const dayEvents = getEventsForDay(key).filter(eventMatchesFilters);

      dayCard.className = "week-view-day";
      dayCard.dataset.date = key;
      dateHeading.className = "week-view-date";
      dateHeading.textContent = date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
      list.className = "agenda-view-list";

      if (date.toDateString() === new Date().toDateString()) {
        dayCard.classList.add("is-today");
      }

      dayEvents.forEach(function (item, index) {
        list.appendChild(
          createAgendaItem(item, key, index, item.time ? "" : "All day")
        );
      });

      if (!dayEvents.length) {
        addEmptyAgendaMessage(list, "No events");
      }

      dayCard.appendChild(dateHeading);
      dayCard.appendChild(list);
      dayCard.addEventListener("dblclick", function (event) {
        if (!event.target.closest(".agenda-event")) {
          openCreateEventModal(key);
        }
      });
      weekGrid.appendChild(dayCard);
    }

    alternativeView.appendChild(weekGrid);
    return;
  }

  title.textContent = months[month] + " " + year + " agenda";
  const agendaList = document.createElement("ul");
  let agendaCount = 0;

  agendaList.className = "agenda-view-list";

  for (let day = 1; day <= getDaysInMonth(month, year); day++) {
    const key = year + "-" + month + "-" + day;
    const dayEvents = getEventsForDay(key).filter(eventMatchesFilters);

    if (!dayEvents.length) {
      continue;
    }

    const headingItem = document.createElement("li");
    headingItem.className = "agenda-date-heading";
    headingItem.textContent = new Date(year, month, day).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
    agendaList.appendChild(headingItem);

    dayEvents.forEach(function (item, index) {
      agendaList.appendChild(
        createAgendaItem(item, key, index, item.time ? "" : "All day")
      );
      agendaCount++;
    });
  }

  if (!agendaCount) {
    addEmptyAgendaMessage(agendaList, "No events match the current filters.");
  }

  alternativeView.appendChild(agendaList);
}

function switchCalendarView(view) {
  currentView = view;
  localStorage.setItem("calendarView", view);

  document.querySelectorAll(".view-button").forEach(function (button) {
    const isActive = button.dataset.view === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderAlternativeView();
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

  selectedKey = year + "-" + month + "-1";

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

  selectedKey = year + "-" + month + "-1";

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};

document.getElementById("todayBtn").onclick = function () {
  const now = new Date();

  month = now.getMonth();
  year = now.getFullYear();
  selectedKey = year + "-" + month + "-" + now.getDate();

  localStorage.setItem("savedMonth", month);
  localStorage.setItem("savedYear", year);

  updateMonth();
};

document.getElementById("searchInput").oninput = function () {
  createDays();
};

document.getElementById("categoryFilter").addEventListener("change", createDays);

document.querySelectorAll(".view-button").forEach(function (button) {
  button.addEventListener("click", function () {
    switchCalendarView(button.dataset.view);
  });
});

const dailyQuotes = [
  "Small steps create meaningful change.",
  "Progress begins when you choose to start.",
  "Give today your full attention.",
  "Consistency turns plans into results.",
  "A calm mind makes clearer decisions.",
  "Focus on progress, not perfection.",
  "Your future grows from today's choices.",
  "Make room for what truly matters.",
  "One completed task is worth many intentions.",
  "Rest is part of productive progress.",
  "A clear plan creates a lighter day.",
  "Begin gently, but keep moving forward.",
  "Use your time with purpose and kindness.",
  "Every new day is a fresh starting point.",
  "Good routines make difficult goals easier.",
  "Celebrate the progress others cannot see.",
  "Protect your focus and your energy.",
  "The right pace is the one you can sustain.",
  "Turn today's priority into today's progress.",
  "You do not need to do everything at once.",
  "Preparation creates confidence.",
  "Keep your goals visible and your steps simple.",
  "A thoughtful pause can improve the next move.",
  "Let small wins build your momentum.",
  "Your time deserves a clear purpose.",
  "Do the important thing before the urgent noise.",
  "Patience and persistence work well together.",
  "Plan with intention, then leave room to adapt.",
  "Today is useful even when progress feels small.",
  "Choose one goal and move it forward.",
  "A balanced day is a successful day.",
  "Pienet askeleet johtavat suuriin muutoksiin.",
  "Jokainen päivä on uusi mahdollisuus.",
  "Keskity edistymiseen, älä täydellisyyteen.",
  "Hyvä suunnitelma tekee päivästä kevyemmän.",
  "Usko itseesi ja jatka eteenpäin.",
  "Rauhallinen mieli näkee asiat selvemmin.",
  "Tämän päivän valinnat rakentavat huomista.",
  "Anna tärkeimmille asioille aikaa.",
  "Yksi valmis tehtävä vie sinua eteenpäin.",
  "Lepo kuuluu hyvään ja tasapainoiseen päivään.",
  "Selkeä tavoite helpottaa ensimmäistä askelta.",
  "Aloita rauhassa ja jatka määrätietoisesti.",
  "Käytä aikaasi tarkoituksella ja lempeydellä.",
  "Uusi päivä tarjoaa uuden alun.",
  "Hyvät tavat tekevät tavoitteista helpompia.",
  "Juhli myös pieniä ja näkymättömiä edistysaskelia.",
  "Suojaa keskittymistäsi ja energiaasi.",
  "Sopiva tahti on sellainen, jota jaksat ylläpitää.",
  "Tee tämän päivän tärkeimmästä asiasta edistysaskel.",
  "Kaikkea ei tarvitse tehdä yhdellä kertaa.",
  "Hyvä valmistautuminen lisää varmuutta.",
  "Pidä tavoitteet näkyvissä ja askeleet yksinkertaisina.",
  "Ajateltu tauko voi parantaa seuraavaa päätöstä.",
  "Anna pienten onnistumisten kasvattaa vauhtia.",
  "Sinun aikasi ansaitsee selkeän tarkoituksen.",
  "Tee tärkeä asia ennen kiireellistä hälyä.",
  "Kärsivällisyys ja sinnikkyys toimivat yhdessä.",
  "Suunnittele huolella ja jätä tilaa muutoksille.",
  "Pienikin edistys tekee päivästä merkityksellisen.",
  "Valitse yksi tavoite ja vie sitä määrätietoisesti eteenpäin.",
  "Tasapainoinen päivä on onnistunut päivä."
];

function updateQuoteForPageLoad() {
  const storageKey = "lastCalendarQuoteIndex";
  const previousIndex = Number(localStorage.getItem(storageKey));
  let quoteIndex = Math.floor(Math.random() * dailyQuotes.length);

  if (
    dailyQuotes.length > 1 &&
    Number.isInteger(previousIndex) &&
    quoteIndex === previousIndex
  ) {
    quoteIndex = (quoteIndex + 1) % dailyQuotes.length;
  }

  localStorage.setItem(storageKey, String(quoteIndex));
  document.getElementById("quoteText").textContent =
    "✨ " + dailyQuotes[quoteIndex];
}

updateQuoteForPageLoad();

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

function setColourTheme(themeName) {
  document.body.classList.remove("blue-theme", "green-theme", "purple-theme");
  document.body.classList.add(themeName);
  localStorage.setItem("theme", themeName);
}

document.getElementById("blueTheme").onclick = function () {
  setColourTheme("blue-theme");
};

document.getElementById("greenTheme").onclick = function () {
  setColourTheme("green-theme");
};

document.getElementById("purpleTheme").onclick = function () {
  setColourTheme("purple-theme");
};

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.body.classList.add(savedTheme);
}

document.getElementById("focusModeBtn").addEventListener("click", function () {
  const isFocused = document.body.classList.toggle("focus-mode");
  this.setAttribute("aria-pressed", String(isFocused));
  this.textContent = isFocused ? "Exit focus" : "Focus";
  localStorage.setItem("focusMode", isFocused ? "on" : "off");
});

if (localStorage.getItem("focusMode") === "on") {
  document.body.classList.add("focus-mode");
  document.getElementById("focusModeBtn").setAttribute("aria-pressed", "true");
  document.getElementById("focusModeBtn").textContent = "Exit focus";
}

function downloadCalendarFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

document.getElementById("exportJsonBtn").addEventListener("click", function () {
  const backup = {
    app: "ÄlykäsKalenteri",
    version: 2,
    exportedAt: new Date().toISOString(),
    events: events
  };

  downloadCalendarFile(
    JSON.stringify(backup, null, 2),
    "alykas-kalenteri-backup.json",
    "application/json"
  );
  showToast("Calendar backup downloaded.");
});

function escapeIcsText(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function calendarKeyToIcsDate(key) {
  const inputDate = calendarKeyToDateInput(key);
  return inputDate.replaceAll("-", "");
}

function buildIcsCalendar() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AlykaesKalenteri//Smart Calendar//FI",
    "CALSCALE:GREGORIAN"
  ];

  Object.keys(events).forEach(function (sourceDate) {
    const sourceEvents = Array.isArray(events[sourceDate])
      ? events[sourceDate]
      : [events[sourceDate]];

    sourceEvents.forEach(function (eventItem, index) {
      const item = typeof eventItem === "object"
        ? eventItem
        : { title: String(eventItem) };
      const startDate = calendarKeyToIcsDate(sourceDate);
      const endKey = item.endDate || sourceDate;
      const exclusiveEndKey = addDaysToCalendarKey(endKey, 1);
      const uid =
        sourceDate.replaceAll("-", "") + "-" + index + "@alykas-kalenteri";

      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + uid);
      lines.push("DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""));

      if (item.time && !item.allDay) {
        lines.push("DTSTART:" + startDate + "T" + item.time.replace(":", "") + "00");

        if (item.endTime) {
          lines.push(
            "DTEND:" +
            calendarKeyToIcsDate(endKey) +
            "T" + item.endTime.replace(":", "") + "00"
          );
        }
      } else {
        lines.push("DTSTART;VALUE=DATE:" + startDate);
        lines.push("DTEND;VALUE=DATE:" + calendarKeyToIcsDate(exclusiveEndKey));
      }

      lines.push("SUMMARY:" + escapeIcsText(getEventTitle(item)));

      if (item.location) {
        lines.push("LOCATION:" + escapeIcsText(item.location));
      }

      if (item.notes) {
        lines.push("DESCRIPTION:" + escapeIcsText(item.notes));
      }

      if (item.repeat && item.repeat !== "none") {
        const frequencyMap = {
          daily: "DAILY",
          weekly: "WEEKLY",
          monthly: "MONTHLY",
          yearly: "YEARLY",
          day: "DAILY",
          week: "WEEKLY",
          month: "MONTHLY",
          year: "YEARLY"
        };
        const frequency = item.repeat === "custom"
          ? frequencyMap[item.repeatUnit]
          : frequencyMap[item.repeat];

        if (frequency) {
          let rule = "FREQ=" + frequency;

          if (item.repeat === "custom" && Number(item.repeatInterval) > 1) {
            rule += ";INTERVAL=" + Number(item.repeatInterval);
          }

          if (item.repeatUntil) {
            rule += ";UNTIL=" + calendarKeyToIcsDate(item.repeatUntil);
          }

          lines.push("RRULE:" + rule);
        }
      }

      lines.push("END:VEVENT");
    });
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

document.getElementById("exportIcsBtn").addEventListener("click", function () {
  downloadCalendarFile(buildIcsCalendar(), "alykas-kalenteri.ics", "text/calendar");
  showToast("Calendar exported as .ics.");
});

document.getElementById("importJsonInput").addEventListener("change", function () {
  const input = this;
  const file = input.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const parsed = JSON.parse(reader.result);
      const importedEvents = parsed && parsed.events ? parsed.events : parsed;

      if (
        !importedEvents ||
        typeof importedEvents !== "object" ||
        Array.isArray(importedEvents)
      ) {
        throw new Error("Invalid backup");
      }

      if (!confirm("Restore this backup? Current calendar events will be replaced.")) {
        input.value = "";
        return;
      }

      events = importedEvents;
      saveEvents();
      createDays();
      updateReminders();
      showToast("Calendar backup restored.");
    } catch (error) {
      showToast("This backup file is not valid.", "error");
    }

    input.value = "";
  };

  reader.readAsText(file);
});

document.getElementById("checkReminderBtn").onclick = function () {
  updateReminders();
};

document.getElementById("enableNotificationsBtn").addEventListener("click", async function () {
  if (!("Notification" in window)) {
    showToast("Browser notifications are not supported here.", "error");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    showToast("Event notifications enabled.");
    checkDueEventReminders();
  } else {
    showToast("Notification permission was not enabled.", "error");
  }
});

function checkDueEventReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const now = new Date();
  const sentReminders = JSON.parse(
    localStorage.getItem("sentCalendarReminders") || "{}"
  );

  Object.keys(sentReminders).forEach(function (id) {
    if (now.getTime() - sentReminders[id] > 7 * 86400000) {
      delete sentReminders[id];
    }
  });

  for (let offset = 0; offset <= 2; offset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const key = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

    getEventsForDay(key).forEach(function (item, index) {
      if (
        !item ||
        typeof item !== "object" ||
        !item.time ||
        !item.reminder ||
        item.reminder === "none"
      ) {
        return;
      }

      const occurrenceStart = item.occurrenceStartDate || key;

      if (occurrenceStart !== key) {
        return;
      }

      const timeParts = item.time.split(":").map(Number);
      const eventDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        timeParts[0],
        timeParts[1]
      );
      const reminderMinutes = Number(item.reminder);
      const millisecondsUntilEvent = eventDateTime - now;
      const reminderId =
        (item.sourceDate || key) + ":" +
        (item.sourceIndex ?? index) + ":" + occurrenceStart;

      if (
        millisecondsUntilEvent > 0 &&
        millisecondsUntilEvent <= reminderMinutes * 60000 &&
        !sentReminders[reminderId]
      ) {
        new Notification(getEventTitle(item), {
          body:
            (item.location ? item.location + " · " : "") +
            "Starts at " + item.time,
          tag: reminderId
        });
        sentReminders[reminderId] = now.getTime();
      }
    });
  }

  localStorage.setItem("sentCalendarReminders", JSON.stringify(sentReminders));
}

setInterval(checkDueEventReminders, 60 * 1000);

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
function showCalculatorResult(elementId, message, isError) {
  const resultElement = document.getElementById(elementId);

  resultElement.textContent = message;
  resultElement.classList.toggle("calculator-error", Boolean(isError));
}

document.querySelectorAll("[data-operation]").forEach(function (button) {
  button.addEventListener("click", function () {
    const firstValue = document.getElementById("num1").value;
    const secondValue = document.getElementById("num2").value;

    if (firstValue === "" || secondValue === "") {
      showCalculatorResult("calcResult", "Anna molemmat numerot.", true);
      return;
    }

    const firstNumber = Number(firstValue);
    const secondNumber = Number(secondValue);
    const operation = button.dataset.operation;
    let result;

    if (operation === "add") {
      result = firstNumber + secondNumber;
    } else if (operation === "subtract") {
      result = firstNumber - secondNumber;
    } else if (operation === "multiply") {
      result = firstNumber * secondNumber;
    } else if (operation === "divide") {
      if (secondNumber === 0) {
        showCalculatorResult("calcResult", "Nollalla ei voi jakaa.", true);
        return;
      }
      result = firstNumber / secondNumber;
    } else if (operation === "percent") {
      result = (firstNumber / 100) * secondNumber;
    }

    const formattedResult = Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(6)));

    showCalculatorResult("calcResult", "Tulos: " + formattedResult, false);
  });
});

document.getElementById("calculateDatesBtn").addEventListener("click", function () {
  const startValue = document.getElementById("dateCalcStart").value;
  const endValue = document.getElementById("dateCalcEnd").value;

  if (!startValue || !endValue) {
    showCalculatorResult("dateCalcResult", "Valitse alku- ja loppupäivä.", true);
    return;
  }

  const startParts = startValue.split("-").map(Number);
  const endParts = endValue.split("-").map(Number);
  const startTime = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
  const endTime = Date.UTC(endParts[0], endParts[1] - 1, endParts[2]);
  const totalDays = (endTime - startTime) / 86400000;

  if (totalDays < 0) {
    showCalculatorResult("dateCalcResult", "Loppupäivä ei voi olla ennen alkupäivää.", true);
    return;
  }

  const fullWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const weekText = fullWeeks > 0
    ? " (" + fullWeeks + " vk " + remainingDays + " pv)"
    : "";

  showCalculatorResult(
    "dateCalcResult",
    "Kesto: " + totalDays + " päivää" + weekText,
    false
  );
});

function timeValueToMinutes(value) {
  const parts = value.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

document.getElementById("calculateTimeBtn").addEventListener("click", function () {
  const startValue = document.getElementById("timeCalcStart").value;
  const endValue = document.getElementById("timeCalcEnd").value;
  const breakValue = document.getElementById("timeCalcBreak").value;

  if (!startValue || !endValue) {
    showCalculatorResult("timeCalcResult", "Valitse alku- ja loppuaika.", true);
    return;
  }

  const breakMinutes = breakValue === "" ? 0 : Number(breakValue);

  if (!Number.isFinite(breakMinutes) || breakMinutes < 0) {
    showCalculatorResult("timeCalcResult", "Tauon täytyy olla vähintään 0 minuuttia.", true);
    return;
  }

  let durationMinutes =
    timeValueToMinutes(endValue) - timeValueToMinutes(startValue);

  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  durationMinutes -= breakMinutes;

  if (durationMinutes < 0) {
    showCalculatorResult("timeCalcResult", "Tauko ei voi olla kestoa pidempi.", true);
    return;
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  showCalculatorResult(
    "timeCalcResult",
    "Kesto: " + hours + " h " + minutes + " min",
    false
  );
});

document.getElementById("clearCalculatorBtn").addEventListener("click", function () {
  [
    "num1",
    "num2",
    "dateCalcStart",
    "dateCalcEnd",
    "timeCalcStart",
    "timeCalcEnd"
  ].forEach(function (inputId) {
    document.getElementById(inputId).value = "";
  });

  document.getElementById("timeCalcBreak").value = "0";
  showCalculatorResult("calcResult", "Tulos: 0", false);
  showCalculatorResult("dateCalcResult", "Valitse päivät", false);
  showCalculatorResult("timeCalcResult", "Valitse ajat", false);
});

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
switchCalendarView(currentView);
checkDueEventReminders();
const eventModal = document.getElementById("eventModal");
const closeEventModal = document.getElementById("closeEventModal");
const eventModalTitle = document.getElementById("eventModalTitle");
const modalFormError = document.getElementById("modalFormError");
const textImportModal = document.getElementById("textImportModal");
const smartEventText = document.getElementById("smartEventText");
const textSuggestionPreview = document.getElementById("textSuggestionPreview");
const textImportError = document.getElementById("textImportError");

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
let eventModalMode = "edit";
let pendingTextSuggestion = null;

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

function showModalFormError(message) {
    modalFormError.textContent = message;
    modalFormError.classList.remove("hidden");
}

function clearModalFormError() {
    modalFormError.textContent = "";
    modalFormError.classList.add("hidden");
}

function updateCustomRepeatVisibility() {
    const repeatValue = document.getElementById("eventRepeatInput").value;
    document.getElementById("customRepeatFields").classList.toggle(
        "hidden",
        repeatValue !== "custom"
    );
}

function updateAllDayFields() {
    const allDay = document.getElementById("eventAllDayInput").checked;
    document.getElementById("eventTimeInput").disabled = allDay;
    document.getElementById("eventEndTimeInput").disabled = allDay;
}

function resetEventModalFields(dateKey) {
    const dateValue = calendarKeyToDateInput(dateKey);

    eventDetailsText.value = "";
    eventDate.value = dateValue;
    document.getElementById("eventEndDate").value = dateValue;
    document.getElementById("eventCategory").value = "General";
    document.getElementById("eventTimeInput").value = "";
    document.getElementById("eventEndTimeInput").value = "";
    document.getElementById("eventAllDayInput").checked = false;
    document.getElementById("eventLocationInput").value = "";
    document.getElementById("eventNotesInput").value = "";
    document.getElementById("eventThemeInput").value = "nature";
    document.getElementById("eventRepeatInput").value = "none";
    document.getElementById("eventReminderInput").value = "none";
    document.getElementById("eventRepeatInterval").value = "1";
    document.getElementById("eventRepeatUnit").value = "day";
    document.getElementById("eventRepeatUntil").value = "";
    modalEventImage.value = "";
    selectedImageData = "";
    eventImagePreview.src = "";
    eventImagePreview.classList.add("hidden");
    eventGallery.innerHTML = "";
    clearModalFormError();
    resetDeleteConfirmation();
    updateCustomRepeatVisibility();
    updateAllDayFields();
}

function openCreateEventModal(dateKey) {
    eventModalMode = "create";
    selectedEventDate = dateKey;
    selectedEventIndex = "";
    selectedOccurrenceDate = dateKey;
    selectedKey = dateKey;
    resetEventModalFields(dateKey);
    eventModalTitle.textContent = "＋ Create event";
    document.getElementById("saveEventDetails").textContent = "Create event";
    deleteEventBtn.classList.add("hidden");
    eventModal.classList.remove("hidden");
    eventDetailsText.focus();
}

function formatSuggestionDate(date) {
    return (
        date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0")
    );
}

function createSuggestionDate(yearValue, monthValue, dayValue) {
    const date = new Date(yearValue, monthValue, dayValue);

    if (
        date.getFullYear() !== yearValue ||
        date.getMonth() !== monthValue ||
        date.getDate() !== dayValue
    ) {
        return null;
    }

    return date;
}

function parseSuggestedDate(text, referenceDate = new Date()) {
    const normalized = text.toLowerCase();
    const relativeTomorrow = /\b(tomorrow|huomenna)\b/i.test(text);
    const relativeToday = /\b(today|tänään)\b/i.test(text);

    if (relativeTomorrow || relativeToday) {
        const relativeDate = new Date(referenceDate);
        relativeDate.setHours(0, 0, 0, 0);

        if (relativeTomorrow) {
            relativeDate.setDate(relativeDate.getDate() + 1);
        }

        return formatSuggestionDate(relativeDate);
    }

    const isoMatch = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);

    if (isoMatch) {
        const date = createSuggestionDate(
            Number(isoMatch[1]),
            Number(isoMatch[2]) - 1,
            Number(isoMatch[3])
        );

        if (date) {
            return formatSuggestionDate(date);
        }
    }

    const numericMatch = text.match(
        /\b(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})\b/
    );

    if (numericMatch) {
        let dateYear = Number(numericMatch[3]);

        if (dateYear < 100) {
            dateYear += 2000;
        }

        const date = createSuggestionDate(
            dateYear,
            Number(numericMatch[2]) - 1,
            Number(numericMatch[1])
        );

        if (date) {
            return formatSuggestionDate(date);
        }
    }

    const monthNames = {
        january: 0, jan: 0, tammikuu: 0, tammikuuta: 0,
        february: 1, feb: 1, helmikuu: 1, helmikuuta: 1,
        march: 2, mar: 2, maaliskuu: 2, maaliskuuta: 2,
        april: 3, apr: 3, huhtikuu: 3, huhtikuuta: 3,
        may: 4, toukokuu: 4, toukokuuta: 4,
        june: 5, jun: 5, kesäkuu: 5, kesäkuuta: 5,
        july: 6, jul: 6, heinäkuu: 6, heinäkuuta: 6,
        august: 7, aug: 7, elokuu: 7, elokuuta: 7,
        september: 8, sep: 8, syyskuu: 8, syyskuuta: 8,
        october: 9, oct: 9, lokakuu: 9, lokakuuta: 9,
        november: 10, nov: 10, marraskuu: 10, marraskuuta: 10,
        december: 11, dec: 11, joulukuu: 11, joulukuuta: 11
    };
    const monthPattern = Object.keys(monthNames).join("|");
    const dayFirstMatch = normalized.match(
        new RegExp("\\b(\\d{1,2})\\.?\\s+(" + monthPattern + ")\\s+(\\d{4})\\b", "i")
    );
    const monthFirstMatch = normalized.match(
        new RegExp("\\b(" + monthPattern + ")\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(\\d{4})\\b", "i")
    );
    const namedMatch = dayFirstMatch || monthFirstMatch;

    if (namedMatch) {
        const monthFirst = Boolean(monthFirstMatch);
        const monthName = monthFirst ? namedMatch[1] : namedMatch[2];
        const dateDay = Number(monthFirst ? namedMatch[2] : namedMatch[1]);
        const dateYear = Number(namedMatch[3]);
        const date = createSuggestionDate(
            dateYear,
            monthNames[monthName.toLowerCase()],
            dateDay
        );

        if (date) {
            return formatSuggestionDate(date);
        }
    }

    const weekdays = [
        { pattern: /\b(sunday|sunnuntai(?:na)?)\b/i, day: 0 },
        { pattern: /\b(monday|maanantai(?:na)?)\b/i, day: 1 },
        { pattern: /\b(tuesday|tiistai(?:na)?)\b/i, day: 2 },
        { pattern: /\b(wednesday|keskiviikko(?:na)?)\b/i, day: 3 },
        { pattern: /\b(thursday|torstai(?:na)?)\b/i, day: 4 },
        { pattern: /\b(friday|perjantai(?:na)?)\b/i, day: 5 },
        { pattern: /\b(saturday|lauantai(?:na)?)\b/i, day: 6 }
    ];
    const weekday = weekdays.find(function (item) {
        return item.pattern.test(text);
    });

    if (weekday) {
        const date = new Date(referenceDate);
        let offset = (weekday.day - date.getDay() + 7) % 7;

        if (offset === 0 && /\b(next|ensi)\b/i.test(text)) {
            offset = 7;
        }

        date.setDate(date.getDate() + offset);
        return formatSuggestionDate(date);
    }

    return "";
}

function normalizeSuggestedTime(hourValue, minuteValue) {
    const hour = Number(hourValue);
    const minute = Number(minuteValue || 0);

    if (hour > 23 || minute > 59) {
        return "";
    }

    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
}

function parseSuggestedTimes(text) {
    const rangeMatch = text.match(
        /(?:\b(?:time|aika|klo|at)\s*:?[ ]*)?\b([01]?\d|2[0-3])[:.]([0-5]\d)\s*(?:-|–|—|to|until)\s*([01]?\d|2[0-3])[:.]([0-5]\d)\b/i
    );

    if (rangeMatch) {
        return {
            startTime: normalizeSuggestedTime(rangeMatch[1], rangeMatch[2]),
            endTime: normalizeSuggestedTime(rangeMatch[3], rangeMatch[4])
        };
    }

    const labelledTime = text.match(
        /\b(?:time|aika|klo|at)\s*:?[ ]*([01]?\d|2[0-3])[:.]([0-5]\d)\b/i
    );
    const colonTime = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    const timeMatch = labelledTime || colonTime;

    return {
        startTime: timeMatch
            ? normalizeSuggestedTime(timeMatch[1], timeMatch[2])
            : "",
        endTime: ""
    };
}

function parseSuggestedLocation(text) {
    const locationMatch = text.match(
        /^(?:location|place|venue|paikka|sijainti)\s*:\s*(.+)$/im
    );

    return locationMatch ? locationMatch[1].trim() : "";
}

function parseSuggestedTitle(text) {
    const subjectMatch = text.match(/^(?:subject|aihe|otsikko)\s*:\s*(.+)$/im);

    if (subjectMatch) {
        return subjectMatch[1].trim();
    }

    const ignoredLine = /^(?:date|päivä|time|aika|klo|location|place|venue|paikka|sijainti)\s*:/i;
    const firstUsefulLine = text
        .split(/\r?\n/)
        .map(function (line) { return line.trim(); })
        .find(function (line) {
            return line && !ignoredLine.test(line);
        });

    return firstUsefulLine || "Untitled event";
}

function detectSuggestedCategory(text) {
    if (/\b(exam|test|koe|tentti)\b/i.test(text)) {
        return "Exam";
    }

    if (/\b(birthday|syntymäpäivä|synttärit)\b/i.test(text)) {
        return "Birthday";
    }

    if (/\b(meeting|appointment|tapaaminen|palaveri|kokous)\b/i.test(text)) {
        return "Meeting";
    }

    return "General";
}

function parseEventSuggestion(text, referenceDate = new Date()) {
    const times = parseSuggestedTimes(text);
    const date = parseSuggestedDate(text, referenceDate);
    const title = parseSuggestedTitle(text);
    const location = parseSuggestedLocation(text);
    const category = detectSuggestedCategory(text);
    const missing = [];

    if (!date) missing.push("date");
    if (!times.startTime) missing.push("time");
    if (!location) missing.push("location");

    const detectedCount =
        Number(Boolean(date)) +
        Number(Boolean(times.startTime)) +
        Number(Boolean(location)) +
        Number(title !== "Untitled event");

    return {
        title: title,
        date: date,
        startTime: times.startTime,
        endTime: times.endTime,
        location: location,
        category: category,
        notes: text.trim(),
        missing: missing,
        confidence: detectedCount >= 4
            ? "High confidence"
            : detectedCount >= 2
                ? "Review details"
                : "Low confidence"
    };
}

function closeTextImportWindow() {
    textImportModal.classList.add("hidden");
    textImportError.classList.add("hidden");
}

function showTextSuggestion(suggestion) {
    const displayDate = suggestion.date
        ? new Date(suggestion.date + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
          })
        : "Not detected";
    const displayTime = suggestion.startTime
        ? suggestion.startTime +
          (suggestion.endTime ? "–" + suggestion.endTime : "")
        : "Not detected";

    document.getElementById("suggestedEventTitle").textContent = suggestion.title;
    document.getElementById("suggestedEventDate").textContent = displayDate;
    document.getElementById("suggestedEventTime").textContent = displayTime;
    document.getElementById("suggestedEventLocation").textContent =
        suggestion.location || "Not detected";
    document.getElementById("suggestedEventCategory").textContent = suggestion.category;
    document.getElementById("suggestionConfidence").textContent = suggestion.confidence;

    const warning = document.getElementById("suggestionWarning");
    warning.textContent = suggestion.missing.length
        ? "Please review: " + suggestion.missing.join(", ") + " not detected."
        : "";
    warning.classList.toggle("hidden", suggestion.missing.length === 0);
    textSuggestionPreview.classList.remove("hidden");
}

document.getElementById("createFromTextBtn").addEventListener("click", function () {
    pendingTextSuggestion = null;
    smartEventText.value = "";
    textSuggestionPreview.classList.add("hidden");
    textImportError.classList.add("hidden");
    textImportModal.classList.remove("hidden");
    smartEventText.focus();
});

document.getElementById("analyzeEventTextBtn").addEventListener("click", function () {
    const messageText = smartEventText.value.trim();

    if (!messageText) {
        textImportError.textContent = "Paste an email or message first.";
        textImportError.classList.remove("hidden");
        return;
    }

    textImportError.classList.add("hidden");
    pendingTextSuggestion = parseEventSuggestion(messageText);
    showTextSuggestion(pendingTextSuggestion);
});

document.getElementById("reviewSuggestedEventBtn").addEventListener("click", function () {
    if (!pendingTextSuggestion) {
        return;
    }

    const now = new Date();
    const fallbackDate = formatSuggestionDate(now);
    const suggestedDate = pendingTextSuggestion.date || fallbackDate;
    const dateKey = dateInputToCalendarKey(suggestedDate);

    closeTextImportWindow();
    openCreateEventModal(dateKey);
    eventDetailsText.value = pendingTextSuggestion.title;
    eventDate.value = suggestedDate;
    document.getElementById("eventEndDate").value = suggestedDate;
    document.getElementById("eventCategory").value = pendingTextSuggestion.category;
    document.getElementById("eventTimeInput").value = pendingTextSuggestion.startTime;
    document.getElementById("eventEndTimeInput").value = pendingTextSuggestion.endTime;
    document.getElementById("eventAllDayInput").checked =
        !pendingTextSuggestion.startTime;
    document.getElementById("eventLocationInput").value =
        pendingTextSuggestion.location;
    document.getElementById("eventNotesInput").value = pendingTextSuggestion.notes;
    updateAllDayFields();
});

document.getElementById("closeTextImportModal").addEventListener(
    "click",
    closeTextImportWindow
);
document.getElementById("cancelTextImport").addEventListener(
    "click",
    closeTextImportWindow
);

function closeEventModalWindow() {
    resetDeleteConfirmation();
    clearModalFormError();
    eventModal.classList.add("hidden");
}

closeEventModal.addEventListener("click", function () {
    closeEventModalWindow();
});

document.getElementById("createEventBtn").addEventListener("click", function () {
    const now = new Date();
    const defaultKey = selectedKey ||
        now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    openCreateEventModal(defaultKey);
});

document.getElementById("eventRepeatInput").addEventListener(
    "change",
    updateCustomRepeatVisibility
);
document.getElementById("eventAllDayInput").addEventListener(
    "change",
    updateAllDayFields
);

document.addEventListener("keydown", function (event) {
    const isEscape = event.key === "Escape";
    const isCommandPeriod =
        (event.metaKey || event.ctrlKey) && event.key === ".";

    if (!(isEscape || isCommandPeriod)) {
        return;
    }

    if (!textImportModal.classList.contains("hidden")) {
        event.preventDefault();
        closeTextImportWindow();
        return;
    }

    if (!eventModal.classList.contains("hidden")) {
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
eventModalMode = "edit";

let clickedEvent = events[sourceDate][sourceIndex];

if (!clickedEvent || typeof clickedEvent !== "object") {
    clickedEvent = createEvent(String(clickedEvent || "Untitled event"), "General");
    events[sourceDate][sourceIndex] = clickedEvent;
}

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

document.getElementById("eventAllDayInput").checked =
    Boolean(clickedEvent.allDay);

document.getElementById("eventLocationInput").value =
    clickedEvent.location || "";

document.getElementById("eventNotesInput").value =
    clickedEvent.notes || "";

document.getElementById("eventThemeInput").value =
    clickedEvent.theme || "nature";

document.getElementById("eventRepeatInput").value =
    clickedEvent.repeat || "none";

document.getElementById("eventReminderInput").value =
    clickedEvent.reminder || "none";
document.getElementById("eventRepeatInterval").value =
    clickedEvent.repeatInterval || 1;
document.getElementById("eventRepeatUnit").value =
    clickedEvent.repeatUnit || "day";
document.getElementById("eventRepeatUntil").value =
    clickedEvent.repeatUntil
        ? calendarKeyToDateInput(clickedEvent.repeatUntil)
        : "";

resetDeleteConfirmation();
clearModalFormError();
updateCustomRepeatVisibility();
updateAllDayFields();
eventModalTitle.textContent = "📅 Event details";
document.getElementById("saveEventDetails").textContent = "Save changes";
deleteEventBtn.classList.remove("hidden");
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
    clearModalFormError();

    const updatedTitle = eventDetailsText.value.trim();
    const updatedCategory = document.getElementById("eventCategory").value;
    const updatedDate = dateInputToCalendarKey(eventDate.value);
    const updatedEndDate = dateInputToCalendarKey(
        document.getElementById("eventEndDate").value
    );
    const allDay = document.getElementById("eventAllDayInput").checked;
    const updatedStartTime = allDay
        ? ""
        : document.getElementById("eventTimeInput").value;
    const updatedEndTime = allDay
        ? ""
        : document.getElementById("eventEndTimeInput").value;
    const repeat = document.getElementById("eventRepeatInput").value;
    const repeatInterval = Math.max(
        1,
        Number(document.getElementById("eventRepeatInterval").value) || 1
    );
    const repeatUntilValue = document.getElementById("eventRepeatUntil").value;
    const repeatUntil = repeatUntilValue
        ? dateInputToCalendarKey(repeatUntilValue)
        : "";

    if (!updatedTitle) {
        showModalFormError("Please enter an event title.");
        eventDetailsText.focus();
        return;
    }

    if (!updatedDate || !updatedEndDate) {
        showModalFormError("Please select valid start and end dates.");
        return;
    }

    const durationDays = calendarKeyDayDifference(updatedDate, updatedEndDate);

    if (durationDays < 0) {
        showModalFormError("End date cannot be before start date.");
        return;
    }

    if (
        durationDays === 0 &&
        updatedStartTime &&
        updatedEndTime &&
        updatedEndTime <= updatedStartTime
    ) {
        showModalFormError("End time must be after start time on the same date.");
        return;
    }

    if (
        repeat === "custom" &&
        repeatUntil &&
        calendarKeyDayDifference(updatedDate, repeatUntil) < 0
    ) {
        showModalFormError("Repeat-until date cannot be before the start date.");
        return;
    }

    const eventData = {
        title: updatedCategory + ": " + updatedTitle,
        category: updatedCategory,
        notes: document.getElementById("eventNotesInput").value.trim(),
        time: updatedStartTime,
        endTime: updatedEndTime,
        allDay: allDay,
        location: document.getElementById("eventLocationInput").value.trim(),
        theme: document.getElementById("eventThemeInput").value,
        repeat: repeat,
        repeatInterval: repeat === "custom" ? repeatInterval : 1,
        repeatUnit: document.getElementById("eventRepeatUnit").value,
        repeatUntil: repeat === "custom" ? repeatUntil : "",
        reminder: document.getElementById("eventReminderInput").value,
        endDate: updatedEndDate,
        image: selectedImageData,
        images: selectedImageData ? [selectedImageData] : []
    };

    if (eventModalMode === "create") {
        if (!events[updatedDate]) {
            events[updatedDate] = [];
        } else if (!Array.isArray(events[updatedDate])) {
            events[updatedDate] = [events[updatedDate]];
        }

        events[updatedDate].push(eventData);
        selectedEventDate = updatedDate;
        selectedEventIndex = events[updatedDate].length - 1;
        selectedOccurrenceDate = updatedDate;
    } else {
        const sourceEvents = events[selectedEventDate];
        const selectedEvent = Array.isArray(sourceEvents)
            ? sourceEvents[selectedEventIndex]
            : null;

        if (!selectedEvent || typeof selectedEvent !== "object") {
            showModalFormError("This event could not be loaded. Please reopen it.");
            return;
        }

        eventData.images = Array.isArray(selectedEvent.images)
            ? [...selectedEvent.images]
            : [];

        if (selectedImageData && !eventData.images.includes(selectedImageData)) {
            eventData.images.push(selectedImageData);
        }

        Object.assign(selectedEvent, eventData);

        if (
            updatedDate !== selectedOccurrenceDate &&
            updatedDate !== selectedEventDate
        ) {
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
    }

    saveEvents();
    createDays();
    updateReminders();
    closeEventModalWindow();
    showToast(eventModalMode === "create" ? "Event created." : "Event updated.");
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
