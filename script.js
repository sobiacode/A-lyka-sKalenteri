let month =3; // April (0 = Jan, 3= April)
let year = 2026;

const months = [
    "Tammikuu", "Helimkuu", "Maaliskuu", "Huhtikuu", "Toukokkuu", "Kesäkuu", 
    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu" ,"Joulukuu"
];

function updateMonth() 
{ 
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
  if (month === 1) return 28; // February (simple version)

  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  return 31;
}
function createDays() {
  daysBox.innerHTML = "";

  const daysInMonth = getDaysInMonth(month, year);

for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.innerText = i;
    daysBox.appendChild(day);
  }
}

createDays();
