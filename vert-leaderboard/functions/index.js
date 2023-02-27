const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const { scrapeRides } = require("./Scraper");
const {
  getVertSinceMonday,
  getBestStreak,
  getCurrentStreak,
  getFastestCollinsLap,
  getBiggestDay,
  getNumRidesPerLift,
} = require("./RideUtils");
admin.initializeApp();

const runRefresh = async () => {
  const db = admin.firestore();
  const usersCollection = db.collection("users");
  const users = await usersCollection.get();
  users.forEach(async (user) => {
    if (user.failedScraping) {
      return;
    }
    const webId = user.get("webId");
    const updateData = {};
    try {
      const rides = await scrapeRides(webId);
      updateData.vertSinceMonday = getVertSinceMonday(rides);
      updateData.bestStreak = getBestStreak(rides);
      updateData.currentStreak = getCurrentStreak(rides);
      const fastestCollins = getFastestCollinsLap(rides);
      updateData.fastestCollinsLap = fastestCollins
        ? fastestCollins.fastestTimeSec
        : 1000000;
      updateData.totalVert = rides.reduce((acc, { totalVert }) => {
        return acc + totalVert;
      }, 0);
      updateData.biggestDay = getBiggestDay(rides).vert;
      const numRidesPerLift = getNumRidesPerLift(rides);
      updateData.numberOfCucks = numRidesPerLift["Collins Angle"] ?? 0;
      updateData.failedScraping = false;
      updateData.lastUpdateTime = new Date().toISOString();
    } catch (e) {
      console.log(e);
      updateData.failedScraping = true;
    } finally {
      user.ref.update(updateData);
    }
  });
};

exports.refreshData = functions.https.onRequest(async (req, res) => {
  await runRefresh();
  res.status(200).send("Refreshed Users");
});

exports.addNewUser = functions.firestore
  .document("/users/{documentId}")
  .onCreate((snap, context) => {
    return runRefresh();
  });

exports.scheduledFunctionCrontab = functions.pubsub
  .schedule("9 10-17 * * *")
  .timeZone("America/Denver")
  .onRun((context) => {
    runRefresh();
  });
