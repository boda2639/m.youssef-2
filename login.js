// ======================================================
// M.YOUSSEF PLATFORM
// login.js
// Part 1
// Firebase Imports + Auth + Device Security
// ======================================================


// ======================================================
// FIREBASE
// ======================================================

import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    signOut,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================================
// HTML
// ======================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("loginEmail");

const passwordInput =
    document.getElementById("loginPassword");

const rememberMe =
    document.getElementById("rememberMe");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const buttonLoader =
    document.getElementById("buttonLoader");

const buttonIcon =
    document.getElementById("buttonIcon");

const messageBox =
    document.getElementById("messageBox");

const forgotPassword =
    document.getElementById("forgotPassword");

const togglePassword =
    document.getElementById("togglePassword");


// ======================================================
// ADMIN
// ======================================================

const ADMIN_EMAIL = "teacher@physics.com";


// ======================================================
// LOCAL STORAGE KEYS
// ======================================================

const STORAGE = {

    DEVICE_ID: "deviceId",

    SESSION_ID: "sessionId",

    USER_UID: "userUID",

    USER_NAME: "userName",

    USER_EMAIL: "userEmail",

    USER_ROLE: "userRole"

};


// ======================================================
// AUTO LOGIN
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user)
        return;

    try {

        const studentRef =
            doc(db, "students", user.uid);

        const studentSnap =
            await getDoc(studentRef);

        if (!studentSnap.exists()) {

            await signOut(auth);

            return;

        }

        const data =
            studentSnap.data();

        const currentDevice =
            await generateDeviceId();

        // لو أول مرة
        if (!data.deviceId) {

            await updateDoc(studentRef, {

                deviceId: currentDevice,

                activeDeviceId: currentDevice,

                deviceName: getDeviceName(),

                lastLogin: serverTimestamp()

            });

        }

        // الجهاز مختلف

        else if (
            data.deviceId !== currentDevice
        ) {

            await signOut(auth);

            showMessage(
                "هذا الحساب مرتبط بجهاز آخر.",
                "error"
            );

            return;

        }

        window.location.replace(
            "dashboard.html"
        );

    }

    catch (e) {

        console.error(e);

    }

});


// ======================================================
// SESSION ID
// ======================================================

function generateSessionId() {

    if (crypto.randomUUID)
        return crypto.randomUUID();

    return (

        Date.now().toString(36) +

        Math.random()

        .toString(36)

        .substring(2)

    );

}


// ======================================================
// DEVICE ID
// ======================================================

async function generateDeviceId() {

    const raw = [

        navigator.userAgent,

        navigator.platform,

        navigator.language,

        navigator.hardwareConcurrency ||

        "",

        navigator.deviceMemory ||

        "",

        screen.width,

        screen.height,

        screen.colorDepth,

        Intl.DateTimeFormat()

        .resolvedOptions()

        .timeZone

    ].join("|");


    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(raw);

    const hash =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    return Array

        .from(
            new Uint8Array(hash)
        )

        .map(b =>
            b.toString(16)
            .padStart(2, "0")
        )

        .join("");

}


// ======================================================
// DEVICE NAME
// ======================================================

function getDeviceName() {

    return `${navigator.platform} | ${navigator.userAgent}`;

}


// ======================================================
// PASSWORD
// ======================================================

if (togglePassword) {

    togglePassword.onclick = () => {

        const hidden =
            passwordInput.type ===
            "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        togglePassword.classList.toggle(
            "fa-eye"
        );

        togglePassword.classList.toggle(
            "fa-eye-slash"
        );

    };

}


// ======================================================
// READY
// ======================================================

console.log(
    "Login Part 1 Loaded"
);
// ======================================================
// LOGIN
// ======================================================

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async (e) => {

            e.preventDefault();

            clearMessage();

            const email =
                emailInput.value
                .trim()
                .toLowerCase();

            const password =
                passwordInput.value.trim();

            if (!email || !password) {

                showMessage(
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
                    "error"
                );

                return;

            }

            setLoading(true);

            try {

                // =====================================
                // REMEMBER LOGIN
                // =====================================

                await setPersistence(

                    auth,

                    browserLocalPersistence

                );

                // =====================================
                // LOGIN FIREBASE
                // =====================================

                const credential =

                    await signInWithEmailAndPassword(

                        auth,

                        email,

                        password

                    );

                const user =
                    credential.user;

                // =====================================
                // FIRESTORE
                // =====================================

                const studentRef =

                    doc(
                        db,
                        "students",
                        user.uid
                    );

                const studentSnap =

                    await getDoc(studentRef);

                if (!studentSnap.exists()) {

                    await signOut(auth);

                    throw new Error(
                        "بيانات الطالب غير موجودة."
                    );

                }

                const student =
                    studentSnap.data();

                // =====================================
                // ACCOUNT STATUS
                // =====================================

                if (
                    student.accountStatus ===
                    "blocked"
                ) {

                    await signOut(auth);

                    showMessage(
                        "تم إيقاف هذا الحساب.",
                        "error"
                    );

                    setLoading(false);

                    return;

                }

                // =====================================
                // DEVICE
                // =====================================

                const currentDevice =

                    await generateDeviceId();

                const currentName =
                    getDeviceName();

                const currentSession =
                    generateSessionId();

                // =====================================
                // FIRST LOGIN
                // =====================================

                if (!student.deviceId) {

                    await updateDoc(

                        studentRef,

                        {

                            deviceId:
                                currentDevice,

                            activeDeviceId:
                                currentDevice,

                            currentSessionId:
                                currentSession,

                            deviceName:
                                currentName,

                            lastLogin:
                                serverTimestamp()

                        }

                    );

                }

                // =====================================
                // DEVICE LOCK
                // =====================================

                else if (

                    student.deviceId !==

                    currentDevice

                ) {

                    await signOut(auth);

                    showMessage(

                        "هذا الحساب يعمل على جهاز آخر.",

                        "error"

                    );

                    setLoading(false);

                    return;

                }

                // =====================================
                // UPDATE SESSION
                // =====================================

                else {

                    await updateDoc(

                        studentRef,

                        {

                            activeDeviceId:
                                currentDevice,

                            currentSessionId:
                                currentSession,

                            deviceName:
                                currentName,

                            lastLogin:
                                serverTimestamp()

                        }

                    );

                }

                // =====================================
                // LOCAL STORAGE
                // =====================================

                localStorage.setItem(

                    STORAGE.DEVICE_ID,

                    currentDevice

                );

                localStorage.setItem(

                    STORAGE.SESSION_ID,

                    currentSession

                );

                localStorage.setItem(

                    STORAGE.USER_UID,

                    user.uid

                );

                localStorage.setItem(

                    STORAGE.USER_EMAIL,

                    user.email

                );

                localStorage.setItem(

                    STORAGE.USER_NAME,

                    student.studentName ||

                    "طالب"

                );

                if (

                    user.email &&

                    user.email.toLowerCase() ===

                    ADMIN_EMAIL.toLowerCase()

                ) {

                    localStorage.setItem(

                        STORAGE.USER_ROLE,

                        "admin"

                    );

                }

                else {

                    localStorage.setItem(

                        STORAGE.USER_ROLE,

                        "student"

                    );

                }

                // =====================================
                // SUCCESS
                // =====================================

                showMessage(

                    "تم تسجيل الدخول بنجاح.",

                    "success"

                );

                setLoading(false);

                setTimeout(() => {

                    window.location.replace(

                        "dashboard.html"

                    );

                }, 600);

            }

            catch (error) {

                console.error(error);

                if (error.code) {

                    showMessage(

                        getFirebaseErrorMessage(

                            error.code

                        ),

                        "error"

                    );

                }

                else {

                    showMessage(

                        error.message ||

                        "حدث خطأ أثناء تسجيل الدخول.",

                        "error"

                    );

                }

                setLoading(false);

            }

        }

    );

}
// ======================================================
// FORGOT PASSWORD
// ======================================================

if (forgotPassword) {

    forgotPassword.addEventListener(

        "click",

        async (e) => {

            e.preventDefault();

            clearMessage();

            const email =
                emailInput.value
                .trim()
                .toLowerCase();

            if (!email) {

                showMessage(

                    "يرجى إدخال البريد الإلكتروني أولاً.",

                    "error"

                );

                emailInput.focus();

                return;

            }

            try {

                await sendPasswordResetEmail(

                    auth,

                    email

                );

                showMessage(

                    "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",

                    "success"

                );

            }

            catch (error) {

                console.error(error);

                showMessage(

                    getFirebaseErrorMessage(

                        error.code

                    ),

                    "error"

                );

            }

        }

    );

}



// ======================================================
// LOADING BUTTON
// ======================================================

function setLoading(isLoading) {

    if (loginButton) {

        loginButton.disabled = isLoading;

    }

    if (buttonLoader) {

        buttonLoader.style.display =

            isLoading

            ? "inline-flex"

            : "none";

    }

    if (buttonIcon) {

        buttonIcon.style.display =

            isLoading

            ? "none"

            : "inline-flex";

    }

    if (buttonText) {

        buttonText.textContent =

            isLoading

            ? "جاري تسجيل الدخول..."

            : "تسجيل الدخول";

    }

}



// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(message, type = "info") {

    if (!messageBox) return;

    messageBox.textContent = message;

    messageBox.className =

        `message-box ${type}`;

    messageBox.style.display =

        "block";

}



// ======================================================
// CLEAR MESSAGE
// ======================================================

function clearMessage() {

    if (!messageBox) return;

    messageBox.textContent = "";

    messageBox.className =

        "message-box";

    messageBox.style.display =

        "none";

}



// ======================================================
// PASSWORD VISIBILITY
// ======================================================

if (togglePassword) {

    togglePassword.addEventListener(

        "click",

        () => {

            const hidden =

                passwordInput.type ===

                "password";

            passwordInput.type =

                hidden

                ? "text"

                : "password";

            togglePassword.classList.toggle(

                "fa-eye"

            );

            togglePassword.classList.toggle(

                "fa-eye-slash"

            );

        }

    );

}



// ======================================================
// PAGE EVENTS
// ======================================================

window.addEventListener(

    "load",

    () => {

        clearMessage();

    }

);

window.addEventListener(

    "beforeunload",

    () => {

        clearMessage();

    }

);



// ======================================================
// READY
// ======================================================

console.log(

    "%cM.YOUSSEF Login Loaded",

    "color:#00c853;font-size:14px;font-weight:bold"

);
// ======================================================
// FIREBASE ERROR MESSAGES
// ======================================================

function getFirebaseErrorMessage(code) {

    switch (code) {

        case "auth/invalid-email":
            return "البريد الإلكتروني غير صحيح.";

        case "auth/invalid-credential":
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

        case "auth/user-not-found":
            return "الحساب غير موجود.";

        case "auth/wrong-password":
            return "كلمة المرور غير صحيحة.";

        case "auth/user-disabled":
            return "تم تعطيل هذا الحساب.";

        case "auth/network-request-failed":
            return "تحقق من اتصال الإنترنت.";

        case "auth/too-many-requests":
            return "عدد كبير من المحاولات، حاول مرة أخرى لاحقًا.";

        case "auth/missing-password":
            return "يرجى إدخال كلمة المرور.";

        case "auth/internal-error":
            return "حدث خطأ داخلي.";

        default:
            return "حدث خطأ أثناء تسجيل الدخول.";
    }

}



// ======================================================
// SESSION CHECK
// ======================================================

async function verifyCurrentSession(user) {

    try {

        const studentRef =
            doc(db, "students", user.uid);

        const studentSnap =
            await getDoc(studentRef);

        if (!studentSnap.exists()) {

            await signOut(auth);

            return false;

        }

        const data =
            studentSnap.data();

        const currentDevice =
            await generateDeviceId();

        const savedDevice =
            localStorage.getItem(STORAGE.DEVICE_ID);

        const savedSession =
            localStorage.getItem(STORAGE.SESSION_ID);

        if (
            data.deviceId !== currentDevice ||
            data.activeDeviceId !== currentDevice
        ) {

            localStorage.clear();

            await signOut(auth);

            alert("تم تسجيل الدخول من جهاز آخر.");

            window.location.replace("login.html");

            return false;

        }

        if (
            data.currentSessionId &&
            savedSession &&
            data.currentSessionId !== savedSession
        ) {

            localStorage.clear();

            await signOut(auth);

            alert("انتهت صلاحية جلسة تسجيل الدخول.");

            window.location.replace("login.html");

            return false;

        }

        if (
            savedDevice &&
            savedDevice !== currentDevice
        ) {

            localStorage.clear();

            await signOut(auth);

            window.location.replace("login.html");

            return false;

        }

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}



// ======================================================
// KEEP SESSION ALIVE
// ======================================================

onAuthStateChanged(

    auth,

    async (user) => {

        if (!user)
            return;

        await verifyCurrentSession(user);

    }

);



// ======================================================
// CHECK EVERY 30 SECONDS
// ======================================================

setInterval(async () => {

    const user = auth.currentUser;

    if (!user)
        return;

    await verifyCurrentSession(user);

}, 30000);



// ======================================================
// CLEAR DATA ON LOGOUT
// ======================================================

window.addEventListener("unload", () => {

    clearMessage();

});



// ======================================================
// LOGIN READY
// ======================================================

console.log(
    "%cM.YOUSSEF Login System Ready",
    "color:#ff9800;font-size:14px;font-weight:bold"
);
