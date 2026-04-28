let month =3; // April (0 = Jan, 3= April)
let year = 2026;

const months = [
    "Tammikuu", "Helimkuu", " Maaliskuu", "Huhtikuu", "toukokkuu", "kesäkuu", 
    "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu" ,"Joulukuu"
];

function updateMonth() { 
    document.querySelector ("h2").innerText = months[month] + " " + year;

 }
 document.querySelector("button:nth-of-type(1)").onclick = function () {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  updateMonth();
};

document.querySelector("button:nth-of-type(2)").onclick = function () {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  updateMonth();
};
