import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const ADMIN_EMAIL = "teacher@physics.com";

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.replace("login.html");
        return;

    }

    if (
        user.email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        alert("ليس لديك صلاحية دخول لوحة الإدارة");

        window.location.replace("profile.html");

    }

});