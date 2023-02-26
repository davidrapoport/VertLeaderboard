import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUa0chNuyLtj19XSVyLgJzYyxJ5mZctfU",
  authDomain: "alodge-vert-leaderboard.firebaseapp.com",
  projectId: "alodge-vert-leaderboard",
  storageBucket: "alodge-vert-leaderboard.appspot.com",
  messagingSenderId: "344688106500",
  appId: "1:344688106500:web:235ac16e9adee3d9ade951",
  measurementId: "G-RFSV2MD421",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const updateOrRegisterUser = async (userInfo) => {
  console.log(userInfo);
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
};

const getDepartments = () => Object.keys(DEPARTMENTS);
const getDepartmentTeamName = (department) => {
  return DEPARTMENTS[department] + "( " + department + ")";
};

export {
  auth,
  db,
  updateOrRegisterUser,
  getDepartmentTeamName,
  getDepartments,
};
