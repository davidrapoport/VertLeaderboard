import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  updateDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// connectFirestoreEmulator(db, "localhost", 8080);

const getUserFromWebId = async (webId) => {
  const q = query(collection(db, "users"), where("webId", "==", webId));
  const docs = await getDocs(q);
  if (docs.docs.length === 0) {
    return null;
  }
  return docs.docs[0];
};

const updateOrRegisterUser = async (userInfo) => {
  const docFromServer = await getUserFromWebId(userInfo.webId);
  try {
    if (!docFromServer) {
      await addDoc(collection(db, "users"), userInfo);
      console.log("Successfully added a user");
    } else {
      console.log(docFromServer);
      await updateDoc(docFromServer.ref, userInfo);
      console.log("Successfully updated a user");
    }
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

const getAllUsers = async () => {
  const q = query(collection(db, "users"));
  const docs = await getDocs(q);
  return docs.docs
    .map((doc) => doc.data())
    .filter((user) => !user.failedScraping);
};

const DEPARTMENTS = {
  Kitchen: "The Broccoli Burners",
  Handie: "Emp Room Nappers",
  MOD: "Manager Off Duty",
  Desk: "Crossword All-Stars",
  Tron: "Gap Year",
  Housekeeping: "Garrett's Private Tutors",
  Reservations: "At least we have a window this year",
  Maintenance: "For the love of god shower before you go in the hot tubs",
  Bar: "David gets free beers for life",
  "Kids Club": "The Butt Wipers",
};

const getDepartments = () => Object.keys(DEPARTMENTS);
const getDepartmentTeamName = (department) => {
  return DEPARTMENTS[department] + "( " + department + ")";
};

export {
  auth,
  db,
  updateOrRegisterUser,
  getUserFromWebId,
  getAllUsers,
  getDepartmentTeamName,
  getDepartments,
};
