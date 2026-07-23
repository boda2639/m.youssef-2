import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// DEVICE ID
// ========================================

let deviceId = localStorage.getItem("deviceId");

if (!deviceId) {

    deviceId = "device-" +
        Math.random().toString(36).substring(2) +
        Date.now().toString(36);

    localStorage.setItem(
        "deviceId",
        deviceId
    );

}


// ========================================
// AUTH GUARD
// ========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");
        return;

    }

    try {

        const userRef = doc(
            db,
            "students",
            user.uid
        );

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            await signOut(auth);

            window.location.replace("login.html");
            return;

        }

        const userData = userSnap.data();

        if (

            userData.deviceId &&
            userData.deviceId !== deviceId

        ) {

            alert("هذا الحساب يعمل على جهاز آخر.");

            await signOut(auth);

            localStorage.clear();

            window.location.replace("login.html");

            return;

        }

        localStorage.setItem(
            "userUID",
            user.uid
        );

        localStorage.setItem(
            "userEmail",
            user.email || ""
        );

    }

    catch (error) {

        console.error(error);

        await signOut(auth);

        window.location.replace("login.html");

    }

});