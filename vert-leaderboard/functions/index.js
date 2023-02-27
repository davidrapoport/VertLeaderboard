const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const { scrapeRides } = require("./Scraper");
const {
  getVertSinceMonday,
  getBestStreak,
  getCurrentStreak,
  getFastestCollinsLap,
} = require("./RideUtils");
admin.initializeApp();

exports.refreshData = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();
  const usersCollection = await db.collection("users");
  console.log("here");
  const users = await usersCollection.get();
  let numUsers = 0;
  users.forEach(async (user) => {
    // if (user.failedScraping) {
    //   return;
    // }
    const webId = user.get("webId");
    let updateData = {};
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
      updateData.failedScraping = false;
      updateData.lastUpdateTime = new Date().toISOString();
    } catch (e) {
      console.log(e);
      updateData.failedScraping = true;
    } finally {
      user.ref.update(updateData);
    }
    numUsers++;
  });
  res.status(200).send("Processed users: " + numUsers);
});
