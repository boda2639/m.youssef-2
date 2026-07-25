// ========================================
// FIREBASE
// ========================================

import {
    auth,
    db
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// HTML ELEMENTS
// ========================================

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


// ========================================
// ADMIN EMAIL
// ========================================

const ADMIN_EMAIL =
    "teacher@physics.com";


// ========================================
// AUTO LOGIN
// لو الطالب مسجل دخول بالفعل
// يفتح البروفايل مباشرة
// ========================================

onAuthStateChanged(

    auth,

    (user) => {

        if (user) {

            window.location.replace(
                "dashboard.html"
            );

        }

    }

);


// ========================================
// SESSION ID
// ========================================

// يولد Session جديد عند كل Login

function generateSessionId() {

    if (
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }

    return (

        Date.now().toString(36) +

        Math.random()
            .toString(36)
            .substring(2)

    );

}


// ========================================
// DEVICE SECURITY
// ========================================

// إنشاء بصمة للجهاز

async function generateDeviceId() {

    const rawData = [

        navigator.userAgent,

        navigator.language,

        navigator.platform,

        screen.width,

        screen.height,

        screen.colorDepth,

        Intl.DateTimeFormat()

            .resolvedOptions()

            .timeZone,

        navigator.hardwareConcurrency || "",

        navigator.deviceMemory || ""

    ].join("|");


    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(rawData);

    const hashBuffer =
        await crypto.subtle.digest(

            "SHA-256",

            data

        );

    const hashArray =
        Array.from(

            new Uint8Array(
                hashBuffer
            )

        );

    return hashArray

        .map(

            b =>

                b.toString(16)

                    .padStart(2, "0")

        )

        .join("");

}


// ========================================
// DEVICE NAME
// ========================================

function getDeviceName() {

    return [

        navigator.platform,

        navigator.userAgent

    ].join(" | ");

}


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

if (togglePassword) {

    togglePassword.addEventListener(

        "click",

        () => {

            const isPassword =

                passwordInput.type ===

                "password";


            passwordInput.type =

                isPassword

                    ? "text"

                    : "password";


            togglePassword.classList.toggle(

                "fa-eye",

                !isPassword

            );

            togglePassword.classList.toggle(

                "fa-eye-slash",

                isPassword

            );

        }

    );

}
// ========================================
// LOGIN
// ========================================

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
                "من فضلك أدخل البريد الإلكتروني وكلمة المرور.",
                "error"
            );

            return;

        }

        setLoading(true);

        try {

            // ===============================
            // PERSISTENCE
            // ===============================

            const persistence =

                rememberMe?.checked

                    ? browserLocalPersistence

                    : browserSessionPersistence;


            await setPersistence(

                auth,

                persistence

            );


            // ===============================
            // LOGIN
            // ===============================

            const userCredential =

                await signInWithEmailAndPassword(

                    auth,

                    email,

                    password

                );


            const user =
                userCredential.user;


            // ===============================
            // DEVICE
            // ===============================

            const deviceId =
                await generateDeviceId();

            const deviceName =
                getDeviceName();


            // ===============================
            // SESSION ID
            // ===============================

            const sessionId =
                generateSessionId();


            // ===============================
            // STUDENT
            // ===============================

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


            if (

                !studentSnap.exists()

            ) {

                showMessage(

                    "لم يتم العثور على بيانات الطالب.",

                    "error"

                );

                await signOut(auth);

                setLoading(false);

                return;

            }


            const studentData =
                studentSnap.data();


            // ===============================
            // ACCOUNT STATUS
            // ===============================

            if (

                studentData.accountStatus ===
                "blocked"

            ) {

                showMessage(

                    "تم إيقاف الحساب بواسطة الإدارة.",

                    "error"

                );

                await signOut(auth);

                setLoading(false);

                return;

            }


            // ===============================
            // UPDATE FIRESTORE
            // ===============================

            await updateDoc(

                studentRef,

                {

                    currentSessionId:

                        sessionId,

                    deviceId:

                        deviceId,

                    deviceName:

                        deviceName,

                    lastLogin:

                        serverTimestamp()

                }

            );


            // ===============================
            // LOCAL STORAGE
            // ===============================

            localStorage.setItem(

                "sessionId",

                sessionId

            );

            localStorage.setItem(

                "deviceId",

                deviceId

            );

            localStorage.setItem(

                "userUID",

                user.uid

            );

            localStorage.setItem(

                "userEmail",

                user.email || email

            );


            // ===============================
            // ROLE
            // ===============================

            if (

                user.email &&

                user.email.toLowerCase() ===

                ADMIN_EMAIL.toLowerCase()

            ) {

                localStorage.setItem(

                    "userRole",

                    "admin"

                );

                localStorage.setItem(

                    "userName",

                    "مستر محمد يوسف"

                );

            }

            else {

                localStorage.setItem(

                    "userRole",

                    "student"

                );

                localStorage.setItem(

                    "userName",

                    studentData.studentName ||

                    "طالب"

                );

            }


            // ===============================
            // SUCCESS
            // ===============================

            showMessage(

                "تم تسجيل الدخول بنجاح",

                "success"

            );

            setLoading(false);


            setTimeout(

                () => {

                    window.location.replace(

                        "dashboard.html"

                    );

                },

                700

            );

        }

        catch (error) {

    console.error(error);

    showMessage(
        error.code + " | " + error.message,
        "error"
    );

    setLoading(false);

          }

     }

    

);
// ========================================
// FORGOT PASSWORD
// ========================================

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

                    "اكتب البريد الإلكتروني أولاً.",

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


// ========================================
// LOADING
// ========================================

function setLoading(isLoading) {

    if (loginButton) {

        loginButton.disabled = isLoading;

    }

    if (isLoading) {

        buttonText.textContent =
            "جاري تسجيل الدخول...";

        buttonIcon.style.display =
            "none";

        buttonLoader.style.display =
            "inline-block";

    }

    else {

        buttonText.textContent =
            "تسجيل الدخول";

        buttonIcon.style.display =
            "inline-block";

        buttonLoader.style.display =
            "none";

    }

}


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(message, type) {

    if (!messageBox) return;

    messageBox.textContent =
        message;

    messageBox.className =
        `message-box ${type}`;

}


// ========================================
// CLEAR MESSAGE
// ========================================

function clearMessage() {

    if (!messageBox) return;

    messageBox.textContent =
        "";

    messageBox.className =
        "message-box";

}


// ========================================
// FIREBASE ERRORS
// ========================================

function getFirebaseErrorMessage(errorCode) {

    switch (errorCode) {

        case "auth/invalid-email":

            return "البريد الإلكتروني غير صحيح.";

        case "auth/invalid-credential":

            return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

        case "auth/user-not-found":

            return "هذا الحساب غير موجود.";

        case "auth/wrong-password":

            return "كلمة المرور غير صحيحة.";

        case "auth/user-disabled":

            return "تم تعطيل الحساب.";

        case "auth/network-request-failed":

            return "تحقق من اتصال الإنترنت.";

        case "auth/too-many-requests":

            return "عدد كبير من المحاولات، حاول مرة أخرى لاحقًا.";

        case "auth/missing-password":

            return "أدخل كلمة المرور.";

        default:

            return "حدث خطأ أثناء تسجيل الدخول.";

    }

}


// ========================================
// PAGE UNLOAD
// ========================================

window.addEventListener(

    "beforeunload",

    () => {

        clearMessage();

    }

);


// ========================================
// LOGIN PAGE READY
// ========================================

console.log(

    "Login Ready"

);
