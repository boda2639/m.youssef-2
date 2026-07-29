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
