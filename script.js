let month =3; // April (0 = Jan, 3= April)
let year = 2026;

const months = [
    "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", 
    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu" ,"Joulukuu"
];

function updateMonth() { 
  document.getElementById("monthTitle").innerText = months[month] + " " + year;
  createDays();
 }
document.getElementById("prevBtn").onclick = function () {  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  updateMonth();
};
document.getElementById("nextBtn").onclick = function () {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
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
    if (
  i === today.getDate() &&
  month === today.getMonth() &&
  year === today.getFullYear()
) {
  day.style.background = "green";
  day.style.color = "white";
}
    daysBox.appendChild(day);
  }
}

createDays();
