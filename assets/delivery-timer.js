class DeliveryTimer {
  constructor({
    timerSelector,
    deliveryDateSelector,
    getCurrentTime = null, // A function that returns the current date/time
    countdownTime = { hour: 14, minutes: 0, seconds: 0 },
    deliveryDays = {
      atWorkingDays: 1,   // next day (for Monday to Thursday and for Friday before 14:00)
      atWeekdays: 2       // Tuesday (for Friday after 14:00 and the weekend)
    }
  }) {
    this.timerContainer = document.querySelector(timerSelector);
    this.deliveryDateContainer = document.querySelector(deliveryDateSelector);

    this.countdownTime = countdownTime;
    this.deliveryDays = deliveryDays;
    this.timeLeft = 0;

    if (getCurrentTime) {
      this.nowDate = getCurrentTime();
      this.countdownDate = getCurrentTime();
      this.deliveryDate = getCurrentTime();
    } else {
      this.nowDate = new Date();
      this.countdownDate = new Date();
      this.deliveryDate = new Date();
    }

    if (this.timerContainer && this.deliveryDateContainer) {
      this.initTimer();
      this.startTimer();
    } else {
      console.error("Containers for displaying the timer on the page were not found! Timer not running!");
    }
  }

  startTimer = () => {
    const currentWeekDay = this.nowDate.getDay();
    if (1 <= currentWeekDay && currentWeekDay <= 4) { // Monday - Thursday
      if (isBeforeTime(this.nowDate, this.countdownTime)) {
        this.deliveryDate.setDate(this.deliveryDate.getDate() + this.deliveryDays.atWorkingDays);
        this.deliveryDateContainer.innerHTML = ` tomorrow, ${getStringDate(this.deliveryDate)}`;
      } else {
        this.deliveryDate.setDate(this.deliveryDate.getDate() + this.deliveryDays.atWorkingDays + 1);
        this.resetOrderWithin(false);
      }
    } else if (currentWeekDay === 5) { // Friday
      if (isBeforeTime(this.nowDate, this.countdownTime)) {
        this.deliveryDate.setDate(this.deliveryDate.getDate() + this.deliveryDays.atWorkingDays); // Saturday
        this.deliveryDateContainer.innerHTML = ` tomorrow, ${getStringDate(this.deliveryDate)}`;
      } else {
        this.deliveryDate.setDate(this.deliveryDate.getDate() + this.deliveryDays.atWeekdays + 2); //Tuesday
        this.resetOrderWithin(false);
      }
    } else { //weekend
      while (this.deliveryDate.getDay() !== this.deliveryDays.atWeekdays) { // Tuesday
        this.deliveryDate.setDate(this.deliveryDate.getDate() + 1)
      }
      this.resetOrderWithin(false);
    }
    this.timerOn();
  }

  initTimer = () => {
    this.countdownDate.setUTCHours(this.countdownTime.hour, this.countdownTime.minutes, this.countdownTime.seconds, 0);
    this.resetTimeLeft();
  }

  timerOn = () => {
    setInterval(() => {
      --this.timeLeft;
      if (this.timeLeft <= 0) {
        this.resetTimeLeft();
        this.resetOrderWithin();
      } else {
        const h = Math.trunc(this.timeLeft / 3600);
        const m = Math.trunc((this.timeLeft - h * 3600) / 60);
        const s = Math.trunc(this.timeLeft % 60);
        if (h !== 0) {
          this.timerContainer.innerHTML = `${h} hrs ${m} mins`;
        } else {
          if (m >= 1) {
            this.timerContainer.innerHTML = `${m} mins`;
          } else {
            this.timerContainer.innerHTML = `${s} s`;
          }
        }
      }
    }, 1000);
  }

  resetOrderWithin = (processDate = true) => {
    if (processDate) {
      if (this.nowDate.getDay() === 5) { // Friday
        this.deliveryDate.setDate(this.nowDate.getDate() + this.deliveryDays.atWeekdays + 2) // Tuesday
      } else {
        this.deliveryDate.setDate(this.nowDate.getDate() + this.deliveryDays.atWeekdays)
      }
    }
    this.deliveryDateContainer.innerHTML =
      ` ${getDayName(this.deliveryDate)}, ${getStringDate(this.deliveryDate)}`;
  }

  resetTimeLeft = () => {
    this.nowDate = this.getCurrentTime?.() ?? new Date();
    const currentWeekDay = this.nowDate.getDay();
    if (1 <= currentWeekDay && currentWeekDay <= 4) { // Monday - Thursday
      if (!isBeforeTime(this.nowDate, this.countdownTime)) {
        this.countdownDate.setDate(this.countdownDate.getDate() + this.deliveryDays.atWorkingDays)
      }
    } else if (currentWeekDay === 5) { // Friday
      if (!isBeforeTime(this.nowDate, this.countdownTime)) {
        this.countdownDate.setUTCHours(23, 59, 59, 999);
      }
    } else { // weekend
      this.countdownDate.setUTCHours(23, 59, 59, 999);
    }

    this.timeLeft = (this.countdownDate - this.nowDate) / 1000;
  }
};

const isBeforeTime = (date, time = { hour: 14, minutes: 0, seconds: 0 }) => {
  const tmpDate = new Date(date);
  tmpDate.setUTCHours(time.hour, time.minutes, time.seconds, 0);

  return tmpDate - date > 0;
}

const getStringDate = (date) => `${date.toLocaleString('en-GB', { month: 'long' })} ${date.getDate()}`;
const getDayName = (date) => date.toLocaleDateString('en-GB', { weekday: 'long' });