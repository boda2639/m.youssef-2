// ======================================================
// M.YOUSSEF PLATFORM
// dashboard.js
// Part 1
// ======================================================


// ======================================================
// FIREBASE
// ======================================================

import { auth, db } from "./firebase.js";

import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

    doc,

    getDoc,

    collection,

    getDocs,

    updateDoc,

    arrayUnion,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ======================================================
// HTML ELEMENTS
// ======================================================

const coursesContainer =
    document.getElementById("coursesContainer");

const loadingBox =
    document.getElementById("loadingBox");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("courseSearch");

const coursesCount =
    document.getElementById("coursesCount");



// ======================================================
// APP DATA
// ======================================================

let currentUser = null;

let studentData = null;

let studentWallet = 0;

let purchasedCourses = [];

let allCourses = [];



// ======================================================
// AUTH CHECK
// ======================================================

onAuthStateChanged(

    auth,

    async (user) => {

        if (!user) {

            window.location.replace("login.html");

            return;

        }

        currentUser = user;

        await loadStudentData();

        await loadCourses();

    }

);



// ======================================================
// LOAD STUDENT
// ======================================================

async function loadStudentData() {

    try {

        const studentRef =

            doc(

                db,

                "students",

                currentUser.uid

            );

        const studentSnap =

            await getDoc(studentRef);

        if (!studentSnap.exists()) {

            alert("بيانات الطالب غير موجودة.");

            await signOut(auth);

            window.location.replace("login.html");

            return;

        }

        studentData =
            studentSnap.data();

        studentWallet =

            Number(

                studentData.wallet || 0

            );

        purchasedCourses =

            Array.isArray(

                studentData.purchasedCourses

            )

                ? studentData.purchasedCourses

                : [];



        // =====================================
        // DEVICE CHECK
        // =====================================

        const localDevice =

            localStorage.getItem(

                "deviceId"

            );

        if (

            studentData.deviceId &&

            localDevice &&

            studentData.deviceId !== localDevice

        ) {

            alert(

                "هذا الحساب مرتبط بجهاز آخر."

            );

            await signOut(auth);

            localStorage.clear();

            window.location.replace(

                "login.html"

            );

            return;

        }

        console.log(

            "Student Loaded",

            studentData

        );

    }

    catch (error) {

        console.error(

            "Student Error:",

            error

        );

        alert(

            "حدث خطأ أثناء تحميل بيانات الطالب."

        );

    }

}



// ======================================================
// SHOW LOADING
// ======================================================

function showLoading() {

    loadingBox.style.display = "flex";

    emptyState.style.display = "none";

    coursesContainer.innerHTML = "";

}



// ======================================================
// HIDE LOADING
// ======================================================

function hideLoading() {

    loadingBox.style.display = "none";

}



// ======================================================
// READY
// ======================================================

console.log(

    "%cDashboard Part 1 Ready",

    "color:#00c853;font-size:15px;font-weight:bold"

);
// ======================================================
// LOAD COURSES
// ======================================================

async function loadCourses() {

    try {

        showLoading();

        allCourses = [];

        const coursesRef =

            collection(

                db,

                "courses"

            );

        const snapshot =

            await getDocs(

                coursesRef

            );

        snapshot.forEach((courseDoc) => {

            const data =

                courseDoc.data();

            allCourses.push({

                id:
                    courseDoc.id,

                title:
                    data.title ||
                    data.courseName ||
                    "بدون عنوان",

                description:
                    data.description ||
                    "",

                image:
                    data.image ||
                    data.courseImage ||
                    "",

                subject:
                    data.subject ||
                    "عام",

                grade:
                    data.grade ||
                    "",

                teacher:
                    data.teacher ||
                    "مستر محمد يوسف",

                price:
                    Number(
                        data.price || 0
                    ),

                order:
                    Number(
                        data.order || 0
                    ),

                lessonsCount:
                    Number(
                        data.lessonsCount || 0
                    ),

                filesCount:
                    Number(
                        data.filesCount || 0
                    ),

                duration:
                    data.duration ||
                    "",

                enabled:
                    data.enabled !== false

            });

        });

        allCourses.sort(

            (a, b) =>

                a.order - b.order

        );

        hideLoading();

        if (coursesCount) {

            coursesCount.textContent =

                `عدد الكورسات : ${allCourses.length}`;

        }

        if (allCourses.length === 0) {

            emptyState.style.display =

                "flex";

            return;

        }

        emptyState.style.display =

            "none";

        renderCourses(

            allCourses

        );

    }

    catch (error) {

        console.error(

            "Courses Error:",

            error

        );

        hideLoading();

        if (coursesCount) {

            coursesCount.textContent =

                "حدث خطأ أثناء تحميل الكورسات";

        }

        emptyState.style.display =

            "flex";

    }

}



// ======================================================
// REFRESH STUDENT DATA
// ======================================================

async function refreshStudentData() {

    const studentRef =

        doc(

            db,

            "students",

            currentUser.uid

        );

    const studentSnap =

        await getDoc(

            studentRef

        );

    if (!studentSnap.exists())

        return;

    studentData =

        studentSnap.data();

    studentWallet =

        Number(

            studentData.wallet || 0

        );

    purchasedCourses =

        Array.isArray(

            studentData.purchasedCourses

        )

            ? studentData.purchasedCourses

            : [];

}



// ======================================================
// UPDATE COUNTER
// ======================================================

function updateCoursesCounter(list) {

    if (!coursesCount)

        return;

    coursesCount.textContent =

        `عدد الكورسات : ${list.length}`;

}



// ======================================================
// READY
// ======================================================

console.log(

    "%cDashboard Part 2 Ready",

    "color:#03A9F4;font-size:15px;font-weight:bold"

);
// ======================================================
// RENDER COURSES
// ======================================================

function renderCourses(courses) {

    coursesContainer.innerHTML = "";

    updateCoursesCounter(courses);

    if (courses.length === 0) {

        emptyState.style.display = "flex";

        return;

    }

    emptyState.style.display = "none";

    courses.forEach((course) => {

        const isFree =
            Number(course.price) <= 0;

        const isPurchased =
            purchasedCourses.includes(course.id);

        let badge = "";
        let status = "";
        let buttonText = "";
        let buttonClass = "";



        // ==========================================
        // FREE COURSE
        // ==========================================

        if (isFree) {

            badge = `
                <span class="course-price free">
                    مجاني
                </span>
            `;

            status = `
                <div class="course-status free">
                    <i class="fa-solid fa-circle-check"></i>
                    الكورس مجاني
                </div>
            `;

            buttonText = "ابدأ الكورس";

            buttonClass = "free-btn";

        }



        // ==========================================
        // PURCHASED
        // ==========================================

        else if (isPurchased) {

            badge = `
                <span class="course-price purchased">
                    تم الشراء
                </span>
            `;

            status = `
                <div class="course-status purchased">
                    <i class="fa-solid fa-lock-open"></i>
                    الكورس مفتوح
                </div>
            `;

            buttonText = "فتح الكورس";

            buttonClass = "open-btn";

        }



        // ==========================================
        // LOCKED
        // ==========================================

        else {

            badge = `
                <span class="course-price paid">
                    ${course.price} جنيه
                </span>
            `;

            status = `
                <div class="course-status paid">
                    <i class="fa-solid fa-lock"></i>
                    الكورس مغلق
                </div>
            `;

            buttonText = "شراء الكورس";

            buttonClass = "buy-btn";

        }



        const card = document.createElement("article");

        card.className = "course-card";



        card.innerHTML = `

            <div class="course-image">

                <img
                    src="${course.image}"
                    alt="${escapeHTML(course.title)}"
                    loading="lazy"
                >

                ${badge}

            </div>



            <div class="course-body">

                <div class="course-subject">

                    ${escapeHTML(course.subject)}

                </div>



                <div class="course-grade">

                    ${escapeHTML(course.grade)}

                </div>



                <h2 class="course-title">

                    ${escapeHTML(course.title)}

                </h2>



                <p class="course-description">

                    ${escapeHTML(course.description)}

                </p>



                <div class="course-info">

                    <span>

                        <i class="fa-solid fa-video"></i>

                        ${course.lessonsCount} فيديو

                    </span>

                    <span>

                        <i class="fa-solid fa-file-lines"></i>

                        ${course.filesCount} ملف

                    </span>

                </div>



                ${status}



                <button

                    class="course-btn ${buttonClass}"

                    data-id="${course.id}"

                >

                    ${buttonText}

                </button>

            </div>

        `;



        const button =

            card.querySelector(".course-btn");



        button.addEventListener(

            "click",

            () => {

                handleCourseAction(course);

            }

        );



        coursesContainer.appendChild(card);

    });

}



// ======================================================
// SEARCH
// ======================================================

if (searchInput) {

    searchInput.addEventListener(

        "input",

        () => {

            const keyword =

                searchInput.value

                .trim()

                .toLowerCase();



            if (!keyword) {

                renderCourses(allCourses);

                return;

            }



            const filtered =

                allCourses.filter((course) => {

                    return (

                        course.title

                            .toLowerCase()

                            .includes(keyword)

                        ||

                        course.subject

                            .toLowerCase()

                            .includes(keyword)

                        ||

                        course.grade

                            .toLowerCase()

                            .includes(keyword)

                        ||

                        course.description

                            .toLowerCase()

                            .includes(keyword)

                    );

                });



            renderCourses(filtered);

        }

    );

}



// ======================================================
// READY
// ======================================================

console.log(

    "%cDashboard Part 3 Ready",

    "color:#ff9800;font-size:15px;font-weight:bold"

);
// ======================================================
// COURSE ACTION
// ======================================================

async function handleCourseAction(course) {

    const isFree =
        Number(course.price) <= 0;

    const isPurchased =
        purchasedCourses.includes(course.id);

    // ==========================================
    // OPEN COURSE
    // ==========================================

    if (isFree || isPurchased) {

        window.location.href =
            `chapters.html?courseId=${course.id}`;

        return;

    }

    // ==========================================
    // CHECK WALLET
    // ==========================================

    if (studentWallet < Number(course.price)) {

        alert(

`❌ لا يوجد رصيد كافٍ

رصيدك الحالي : ${studentWallet} جنيه

سعر الكورس : ${course.price} جنيه`

        );

        return;

    }

    // ==========================================
    // CONFIRM
    // ==========================================

    const confirmBuy = confirm(

`سيتم خصم ${course.price} جنيه من محفظتك.

هل تريد إكمال عملية الشراء؟`

    );

    if (!confirmBuy)
        return;

    try {

        const studentRef =

            doc(
                db,
                "students",
                currentUser.uid
            );

        const newWallet =

            studentWallet -

            Number(course.price);

        // ==========================================
        // UPDATE FIRESTORE
        // ==========================================

        await updateDoc(

            studentRef,

            {

                wallet: newWallet,

                purchasedCourses:

                    arrayUnion(

                        course.id

                    ),

                lastPurchase:

                    serverTimestamp()

            }

        );

        // ==========================================
        // UPDATE LOCAL DATA
        // ==========================================

        studentWallet =

            newWallet;

        purchasedCourses.push(

            course.id

        );

        studentData.wallet =

            newWallet;

        studentData.purchasedCourses =

            purchasedCourses;

        // ==========================================
        // REFRESH UI
        // ==========================================

        renderCourses(

            allCourses

        );

        alert(

            "✅ تم شراء الكورس بنجاح."

        );

        // ==========================================
        // OPEN CHAPTERS
        // ==========================================

        setTimeout(() => {

            window.location.href =

                `chapters.html?courseId=${course.id}`;

        }, 400);

    }

    catch (error) {

        console.error(

            "Purchase Error:",

            error

        );

        alert(

            `حدث خطأ أثناء الشراء

${error.message}`

        );

    }

}
// ======================================================
// LOGOUT
// ======================================================

const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener(

        "click",

        async () => {

            const ok = confirm(

                "هل تريد تسجيل الخروج؟"

            );

            if (!ok) return;

            try {

                await signOut(auth);

                localStorage.clear();

                sessionStorage.clear();

                window.location.replace("login.html");

            }

            catch (error) {

                console.error(error);

                alert("حدث خطأ أثناء تسجيل الخروج.");

            }

        }

    );

}



// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(text = "") {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}



// ======================================================
// IMAGE ERROR
// ======================================================

document.addEventListener(

    "error",

    (event) => {

        if (

            event.target.tagName === "IMG"

        ) {

            event.target.src =

                "assets/images/course-placeholder.png";

        }

    },

    true

);



// ======================================================
// REFRESH STUDENT
// ======================================================

async function refreshStudent() {

    try {

        const studentRef =

            doc(

                db,

                "students",

                currentUser.uid

            );

        const studentSnap =

            await getDoc(studentRef);

        if (!studentSnap.exists()) return;

        studentData = studentSnap.data();

        studentWallet = Number(studentData.wallet || 0);

        purchasedCourses =

            Array.isArray(studentData.purchasedCourses)

                ? studentData.purchasedCourses

                : [];

    }

    catch (error) {

        console.error(error);

    }

}



// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(async () => {

    if (!currentUser) return;

    await refreshStudent();

}, 60000);



// ======================================================
// PAGE READY
// ======================================================

console.log(

    "%cDashboard Ready",

    "color:#00c853;font-size:16px;font-weight:bold"

);
