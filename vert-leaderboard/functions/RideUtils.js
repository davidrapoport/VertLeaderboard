const {
  differenceInDays,
  isAfter,
  isMonday,
  isSameDay,
  subDays,
} = require("date-fns");

const getNumRidesPerLift = (ridesData) => {
  const flattenedRides = [];
  ridesData.forEach((daysRides) =>
    daysRides.rides.forEach((ride) => flattenedRides.push(ride))
  );
  const numRidesPerLift = {};
  flattenedRides.forEach((ride) => {
    if (!(ride.lift in numRidesPerLift)) {
      numRidesPerLift[ride.lift] = 0;
    }
    numRidesPerLift[ride.lift] += 1;
  });
  return numRidesPerLift;
};

const getFastestCollinsLap = (ridesData) => {
  const MAX_TIME_SEC = 60 * 60 * 24;
  let fastestDate = "";
  let fastestTime = MAX_TIME_SEC;
  ridesData.forEach(({ date, rides }) => {
    if (rides.length < 1) {
      return;
    }
    rides.sort((a, b) => a.time.localeCompare(b.time));
    for (let i = 1; i < rides.length; i++) {
      if (rides[i].lift === "Collins" && rides[i - 1].lift === "Collins") {
        const time1 = new Date("1970-01-01T" + rides[i].time).getTime();
        const time2 = new Date("1970-01-01T" + rides[i - 1].time).getTime();
        const diffSec = (time1 - time2) / 1000;
        if (diffSec < fastestTime) {
          fastestTime = diffSec;
          fastestDate = date;
        }
      }
    }
  });
  if (fastestTime === MAX_TIME_SEC) {
    return null;
  }
  const fastestTimeString = `${Math.floor(fastestTime / 60)} minutes and ${
    fastestTime % 60
  } seconds`;
  return {
    fastestTime: fastestTimeString,
    fastestDate: fastestDate,
    fastestTimeSec: fastestTime,
  };
};

const getBiggestDay = (ridesData) => {
  ridesData.sort((a, b) => {
    if (a.totalVert < b.totalVert) {
      return 1;
    } else if (a.totalVert > b.totalVert) {
      return -1;
    }
  });
  return { vert: ridesData[0].totalVert, date: ridesData[0].date };
};

const sortByDate = (ridesData, sortAscending) => {
  ridesData.sort((a, b) => {
    if (a.date < b.date) {
      return sortAscending ? -1 : 1;
    } else if (b.date < a.date) {
      return sortAscending ? 1 : -1;
    }
  });
  return ridesData;
};

const sortAscending = (ridesData) => sortByDate(ridesData, true);
const sortDescending = (ridesData) => sortByDate(ridesData, false);

// Since we don't need to compare with local time, we can just
// use UTC dates to compare here.
const getBestStreak = (ridesData) => {
  ridesData = sortAscending(ridesData);
  let bestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < ridesData.length; i++) {
    const currentDay = new Date(ridesData[i].date);
    const lastSkiDay = new Date(ridesData[i - 1].date);
    if (
      differenceInDays(currentDay, lastSkiDay) === 1 ||
      (ridesData[i].date === "2023-01-02" &&
        ridesData[i - 1].date === "2022-12-31")
    ) {
      currentStreak++;
    } else {
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
      currentStreak = 1;
    }
  }
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }
  return bestStreak;
};

// Use local dates here since we want to see if the day has ended.
// And if we mix local dates and UTC dates we'll get some off by one errors.
const getCurrentStreak = (ridesData) => {
  ridesData = sortDescending(ridesData);
  const today = getCurrentDateAlta();
  let excludeTodayIfMissing = true;
  if (
    today.getHours() >= 16 ||
    (today.getHours() === 16 && today.getMinutes() > 30)
  ) {
    excludeTodayIfMissing = false;
  }
  let lastSkiDay = convertStringToLocalDate(ridesData[0].date);
  if (differenceInDays(today, lastSkiDay) >= 2) {
    return 0;
  }
  if (differenceInDays(today, lastSkiDay) === 1 && !excludeTodayIfMissing) {
    return 0;
  }
  let currentStreak = 1;
  for (let i = 1; i < ridesData.length; i++) {
    const currentDay = new Date(ridesData[i].date);
    lastSkiDay = new Date(ridesData[i - 1].date);
    if (differenceInDays(lastSkiDay, currentDay) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  return currentStreak;
};

const getVertSinceMonday = (ridesData) => {
  ridesData = sortDescending(ridesData);
  let lastMonday = getCurrentDateAlta();
  while (!isMonday(lastMonday)) {
    lastMonday = subDays(lastMonday, 1);
  }
  let totalVert = 0;
  let i = 0;
  let currentDay = convertStringToLocalDate(ridesData[i].date);
  while (
    i < ridesData.length &&
    (isAfter(currentDay, lastMonday) || isSameDay(currentDay, lastMonday))
  ) {
    totalVert += ridesData[i].totalVert;
    i++;
    currentDay = convertStringToLocalDate(ridesData[i].date);
  }
  return totalVert;
};

const getCurrentDateAlta = () => {
  const date = new Date();
  return new Date(date.getTime() - 420 * 60000);
};

const convertStringToLocalDate = (stringDate) => {
  const date = new Date(stringDate);
  const localDate = new Date();
  return new Date(date.getTime() - localDate.getTimezoneOffset() * 60000);
};

exports.getVertSinceMonday = getVertSinceMonday;
exports.getBestStreak = getBestStreak;
exports.getCurrentStreak = getCurrentStreak;
exports.getFastestCollinsLap = getFastestCollinsLap;
exports.getBiggestDay = getBiggestDay;
exports.getNumRidesPerLift = getNumRidesPerLift;
