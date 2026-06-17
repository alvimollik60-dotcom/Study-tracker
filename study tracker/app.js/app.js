import { auth, provider, db } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

let user = null;

/* 🔐 LOGIN */
window.login = function () {
  signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, (u) => {
  if (u) {
    user = u;
    setUserOnline();
  }
});

/* 🟢 ONLINE STATUS */
function setUserOnline() {
  setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    isOnline: true,
    lastSeen: Date.now()
  }, { merge: true });
}

/* 👥 LIVE USERS */
onSnapshot(collection(db, "users"), (snap) => {
  let html = "";

  snap.forEach(d => {
    let u = d.data();
    html += `<p>${u.name} - ${u.isOnline ? "🟢" : "⚫"}</p>`;
  });

  document.getElementById("users").innerHTML = html;
});

/* 💬 CHAT */
window.sendMsg = async function () {
  let text = document.getElementById("msg").value;

  await addDoc(collection(db, "chat"), {
    name: user.displayName,
    text,
    time: Date.now()
  });
};

onSnapshot(collection(db, "chat"), (snap) => {
  let html = "";

  snap.forEach(d => {
    let c = d.data();
    html += `<p><b>${c.name}:</b> ${c.text}</p>`;
  });

  document.getElementById("chatBox").innerHTML = html;
});

/* 📁 FILE SHARE */
window.sendFile = async function () {
  let link = document.getElementById("file").value;

  await addDoc(collection(db, "files"), {
    name: user.displayName,
    link,
    time: Date.now()
  });
};

onSnapshot(collection(db, "files"), (snap) => {
  let html = "";

  snap.forEach(d => {
    let f = d.data();
    html += `<p><a href="${f.link}" target="_blank">${f.link}</a></p>`;
  });

  document.getElementById("files").innerHTML = html;
});