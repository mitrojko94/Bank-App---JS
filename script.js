"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Zorane Sojic",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-128T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "en-US", // de-DE
};

const account2 = {
  owner: "Frzo Radmilo",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2022-02-22T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  //Razlika koliko je proslo dana od nastanka neke promene
  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  //Cak nam i ne treba else dole, jer ce on biti izvrsen samo ako su if uslove false. Ako su false, aktivira se else koji vraca godinu, dan i mesec dobitka ili odbitka

  // const day = `${date.getDate()}`.padStart(2, 0); //Pravim da mi je duzina dana uvek dva broja, a ako je jedan, dodaje se automatski 0
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); //Jer krece od 0, kad sam dodao + 1, nece kretati od 0
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  //return new Intl.DateTimeFormat(locale).format(date); //Ovo je date koji dobijam kao input u liniji koda 83
};

//Pravim f-ju za formatiranje brojeva
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency, //Pristupam property currency
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  //Prosledio sam ceo account, da bih imao pristup celom accountu, svim propertima
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]); //Koristim trenutni index, da dobijem podatke o trenutnim vremenima
    const displayDate = formatMovementDate(date, acc.locale);

    //Podesavanje brojeva tj. INTERNATIONALIZING NUMBERS
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div> 
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  //labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
  const formattedMov = formatCur(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formattedMov}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map(name => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//Pravim timer - Implementing a Countdown Timer
const startLogOutTimer = function () {
  const tick = function () {
    //Pretvaranje sekundi u minute i sekunde
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //In each call, print the remaining time to UI(User Interface)
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds, stop timer and log out user
    if (time === 0) {
      //Koristim metodu clearInterval() koja zaustavlja rad te f-je, a prosledim joj varijablu koja sadrzi nas timer, nasu f-ju
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    //Decrease 1s
    time = time - 1; //Moze da se napise i time --
  };

  //Set time to 5 minutes
  let time = 120;

  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer; //Moram da vratim timer, jer da bih izbrisao timer, treba mi njegova varijabla
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

//FAKE ALWAYS LOGGED IN - da smo uvek ulogovani
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//EXPERIMENTING API - INTERNATIONALIZING DATES
//const nowAgain = new Date();

//Podesavanja vremena, dodavanje nekih metoda na DateTimeFormat. Kad ovo dodam, prosledim ime objekta kao drugi parametar metode DateTimeFormat
// const options = {
//   hour: "numeric",
//   minute: "numeric",
//   day: "numeric",
//   month: "long", //numeric znaci da ce biti samo broj, a ako stavim "long", izbaci ime tog meseca. Postoji i "2-digit", onda izbaci dva broja, tj. koji je mesec, ali u broju, dodaje 0 ako je broj manji od 10
//   year: "numeric",
//   weekday: "long", //Izbaci koji je dan u nedelji, tipa Monday. Ako stavim "short" izbaci skraceno ime tog dana, a ako stavim "narrow" izbaci samo prvo slovo tog dana
// };

// //Dobavljanje podataka automatski, pomocu pregledaca - izbaci u konzoli ime jezika koji ima pregledac
// const locale = navigator.language;
// console.log(locale);

// labelDate.textContent = new Intl.DateTimeFormat("srb-SR", options).format(
//   nowAgain
//); //Kao parametar prosledim jezik - drzava(drzava je uvek velikim slovom) i ako hocu vreme dodam i drugi parametar koji prethodno definisem

//Create current date and time
// const options = {
//   hour: "numeric",
//   minute: "numeric",
//   day: "numeric",
//   month: "numeric", //numeric znaci da ce biti samo broj, a ako stavim "long", izbaci ime tog meseca. Postoji i "2-digit", onda izbaci dva broja, tj. koji je mesec, ali u broju, dodaje 0 ako je broj manji od 10
//   year: "numeric",
//   //weekday: "long", //Izbaci koji je dan u nedelji, tipa Monday. Ako stavim "short" izbaci skraceno ime tog dana, a ako stavim "narrow" izbaci samo prvo slovo tog dana
// };

//Dobavljanje podataka automatski, pomocu pregledaca - izbaci u konzoli ime jezika koji ima pregledac
// const locale = navigator.language;
// console.log(locale);

// labelDate.textContent = new Intl.DateTimeFormat(
//   currentAccount.locale,
//   options
// ).format(nowAgain); //Stavio sam currentAccount.locale, jer mi je to jezik trenutnog naloga. Znaci ako udjem na nalog, koji ima locale portugalski, bice mi na portugalskom
// const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0); //Pravim da mi je duzina dana uvek dva broja, a ako je jedan, dodaje se automatski 0
// const month = `${now.getMonth() + 1}`.padStart(2, 0); //Jer krece od 0, kad sam dodao + 1, nece kretati od 0
// const year = now.getFullYear();
// const hour = `${now.getHours()}`.padStart(2, 0);
// const min = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

//Adding dates
//const now = new Date();
// const day = `${now.getDate()}`.padStart(2, 0); //Pravim da mi je duzina dana uvek dva broja, a ako je jedan, dodaje se automatski 0
// const month = `${now.getMonth() + 1}`.padStart(2, 0); //Jer krece od 0, kad sam dodao + 1, nece kretati od 0
// const year = now.getFullYear();
// const hour = now.getHours();
// const min = now.getMinutes();

//labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`; //Izbaci mi trenutno vreme i datum

// day/month/year - ovako se predstavlja u Evropi i ovako mi hocemo

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    //Timer function
    if (timer) clearInterval(timer); //Ako timer vec postoji izbrisati ga i preci na kod u liniji 315(krenuti iz pocetka sa timerom)
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Reset timer
    //Jako je bitno da varijabla timer bude globalna, van handler f-ja, da bi moglo da joj pristupimo. Meni je varijabla timer globalna i nalazi se u liniji koda 227
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //Pravim setTimeout() metodu, da mi se ne desi da mi odmah izadje loan, vec posle nekog vremena
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString()); //Stavio sam ovu metodu toISOString da bih imao ispis ovog rezultata u istom formatu kao i sacuvane rezultate

      // Update UI
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//THE REMAINDER OPERATOR
labelBalance.addEventListener("click", function () {
  [...document.querySelectorAll(".movements__row")].forEach(function (
    row,
    index,
    arr
  ) {
    //Koristio sam index, jer mi je to trenutni index, dok je row trenutni element
    if (index % 2 === 0) {
      row.style.backgroundColor = "orangered";
    }
    //Svaki treci red je obojen plavom bojom
    if (index % 3 === 0) {
      row.style.backgroundColor = "blue";
    }
  });
});
