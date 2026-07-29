// ======================================================
// M.YOUSSEF PLATFORM
// login.js
// Part 1
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

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    doc,

    getDoc,

    updateDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ======================================================
// HTML ELEMENTS
// ======================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("loginEmail");

const passwordInput =
    document.getElementById("loginPassword");

const rememberMe =
    document.getElementById("rememberMe");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPassword =
    document.getElementById("forgotPassword");

const messageBox =
    document.getElementById("messageBox");

const loginButton =
    document.getElementById("loginButton");

const buttonText =
    document.getElementById("buttonText");

const buttonIcon =
    document.getElementById("buttonIcon");

const buttonLoader =
    document.getElementById("buttonLoader");



// ======================================================
// CONSTANTS
// ======================================================

const ADMIN_EMAIL =
    "teacher@physics.com";

const STORAGE = {

    DEVICE_ID:
        "deviceId",

    SESSION_ID:
        "sessionId",

    USER_UID:
        "userUID",

    USER_NAME:
        "userName",

    USER_ROLE:
        "userRole",

    USER_EMAIL:
        "userEmail"

};



// ======================================================
// FINGERPRINT
// ======================================================

let fpPromise = null;

if (window.FingerprintJS) {

    fpPromise =
        FingerprintJS.load();

}



// ======================================================
// DEVICE ID
// ======================================================

async function generateDeviceId() {

    try {

        if (fpPromise) {

            const fp =
                await fpPromise;

            const result =
                await fp.get();

            return result.visitorId;

        }

    }

    catch (error) {

        console.warn(
            "Fingerprint Error",
            error
        );

    }

    const raw = [

        navigator.userAgent,

        navigator.language,

        navigator.platform,

        screen.width,

        screen.height,

        Intl.DateTimeFormat()

            .resolvedOptions()

            .timeZone

    ].join("|");

    const encoder =
        new TextEncoder();

    const hash =
        await crypto.subtle.digest(

            "SHA-256",

            encoder.encode(raw)

        );

    return Array.from(

        new Uint8Array(hash)

    )

        .map(x =>
            x.toString(16)
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
// SESSION ID
// ======================================================

function generateSessionId() {

    if (crypto.randomUUID) {

        return crypto.randomUUID();

    }

    return (

        Date.now().toString(36) +

        Math.random()

            .toString(36)

            .substring(2)

    );

}



// ======================================================
// PASSWORD TOGGLE
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
// AUTO LOGIN
// ======================================================

onAuthStateChanged(

    auth,

    async (user) => {

        if (!user)
            return;

        try {

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

                return;

            }

            const student =
                studentSnap.data();

            const currentDevice =
                await generateDeviceId();

            if (

                student.deviceId &&

                student.deviceId !== currentDevice

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

        catch (error) {

            console.error(error);

        }

    }

);



// ======================================================
// READY
// ======================================================

console.log(

    "%cLogin Part 1 Ready",

    "color:#00c853;font-size:14px;font-weight:bold"

);
// ======================================================
// LOGIN
// ======================================================

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async (event) => {

            event.preventDefault();

            clearMessage();

            const email =
                emailInput.value
                .trim()
                .toLowerCase();

            const password =
                passwordInput.value;

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
                // SAVE LOGIN
                // =====================================

                await setPersistence(

                    auth,

                    browserLocalPersistence

                );

                // =====================================
                // LOGIN
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

                    await getDoc(

                        studentRef

                    );

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

                const currentDeviceName =
                    getDeviceName();

                const sessionId =
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

                            deviceName:
                                currentDeviceName,

                            currentSessionId:
                                sessionId,

                            lastLogin:
                                serverTimestamp()

                        }

                    );

                }

                // =====================================
                // DEVICE CHECK
                // =====================================

                else {

                    if (

                        student.deviceId !==

                        currentDevice

                    ) {

                        await signOut(auth);

                        showMessage(

                            "هذا الحساب مرتبط بجهاز آخر.",

                            "error"

                        );

                        setLoading(false);

                        return;

                    }

                    await updateDoc(

                        studentRef,

                        {

                            activeDeviceId:
                                currentDevice,

                            currentSessionId:
                                sessionId,

                            deviceName:
                                currentDeviceName,

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

                    sessionId

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

                }, 800);

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

        async (event) => {

            event.preventDefault();

            clearMessage();

            const email =
                emailInput.value
                .trim()
                .toLowerCase();

            if (!email) {

                showMessage(
                    "يرجى كتابة البريد الإلكتروني أولاً.",
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
// LOADING
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

    if (!messageBox)
        return;

    messageBox.style.display = "block";

    messageBox.textContent = message;

    messageBox.className =
        `message-box ${type}`;

}



// ======================================================
// CLEAR MESSAGE
// ======================================================

function clearMessage() {

    if (!messageBox)
        return;

    messageBox.textContent = "";

    messageBox.className =
        "message-box";

    messageBox.style.display =
        "none";

}



// ======================================================
// FIREBASE ERRORS
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

        case "auth/email-already-in-use":

            return "البريد الإلكتروني مستخدم بالفعل.";

        case "auth/weak-password":

            return "كلمة المرور ضعيفة.";

        case "auth/network-request-failed":

            return "تحقق من اتصال الإنترنت.";

        case "auth/too-many-requests":

            return "تم تجاوز عدد المحاولات المسموح بها.";

        case "auth/user-disabled":

            return "تم تعطيل الحساب.";

        case "permission-denied":

            return "ليس لديك صلاحية.";

        default:

            return "حدث خطأ أثناء تسجيل الدخول.";

    }

}



// ======================================================
// CHECK SESSION
// ======================================================

async function verifySession() {

    const user = auth.currentUser;

    if (!user)
        return;

    try {

        const studentRef =
            doc(
                db,
                "students",
                user.uid
            );

        const studentSnap =
            await getDoc(studentRef);

        if (!studentSnap.exists()) {

            localStorage.clear();

            await signOut(auth);

            window.location.replace(
                "login.html"
            );

            return;

        }

        const student =
            studentSnap.data();

        const currentDevice =
            await generateDeviceId();

        const localDevice =
            localStorage.getItem(
                STORAGE.DEVICE_ID
            );

        const localSession =
            localStorage.getItem(
                STORAGE.SESSION_ID
            );

        if (

            student.deviceId !== currentDevice ||

            student.activeDeviceId !== currentDevice ||

            student.currentSessionId !== localSession ||

            localDevice !== currentDevice

        ) {

            localStorage.clear();

            await signOut(auth);

            alert(
                "تم تسجيل خروجك لأن الحساب يعمل على جهاز آخر."
            );

            window.location.replace(
                "login.html"
            );

        }

    }

    catch (error) {

        console.error(error);

    }

}



// ======================================================
// CHECK EVERY 20 SECONDS
// ======================================================

setInterval(() => {

    verifySession();

}, 20000);



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

    "%cLogin Part 3 Loaded",

    "color:#00BCD4;font-size:14px;font-weight:bold"

);
// ======================================================
// ACTIVITY TRACKER
// ======================================================

async function updateLastSeen() {

    const user = auth.currentUser;

    if (!user) return;

    try {

        const studentRef =
            doc(db, "students", user.uid);

        await updateDoc(studentRef, {

            lastSeen: serverTimestamp()

        });

    }

    catch (error) {

        console.error(error);

    }

}



// ======================================================
// UPDATE LAST SEEN EVERY MINUTE
// ======================================================

setInterval(() => {

    if (auth.currentUser) {

        updateLastSeen();

    }

}, 60000);



// ======================================================
// NETWORK STATUS
// ======================================================

window.addEventListener("offline", () => {

    showMessage(

        "تم فقد الاتصال بالإنترنت.",

        "error"

    );

});

window.addEventListener("online", () => {

    showMessage(

        "تم استعادة الاتصال بالإنترنت.",

        "success"

    );

});



// ======================================================
// CLEAR STORAGE ON AUTH LOGOUT
// ======================================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        localStorage.removeItem(STORAGE.DEVICE_ID);
        localStorage.removeItem(STORAGE.SESSION_ID);
        localStorage.removeItem(STORAGE.USER_UID);
        localStorage.removeItem(STORAGE.USER_NAME);
        localStorage.removeItem(STORAGE.USER_EMAIL);
        localStorage.removeItem(STORAGE.USER_ROLE);

    }

});



// ======================================================
// FINAL READY
// ======================================================

console.log(
    "%cM.YOUSSEF Login System Ready",
    "color:#00E676;font-size:15px;font-weight:bold"
);
