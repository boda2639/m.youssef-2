/* =====================================================
        CHAPTERS.JS
        PART 1
        IMPORTS + START
===================================================== */

// =====================================================
// FIREBASE
// =====================================================

import {
    db,
    auth
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================================
// VARIABLES
// =====================================================

let currentUser = null;
let currentCourse = null;
let chapters = [];


// =====================================================
// URL PARAMS
// =====================================================

const params = new URLSearchParams(window.location.search);

const courseId = params.get("courseId");


// =====================================================
// HTML ELEMENTS
// =====================================================

const loadingBox =
document.getElementById("loadingBox");

const chaptersContent =
document.getElementById("chaptersContent");

const errorBox =
document.getElementById("errorBox");

const errorText =
document.getElementById("errorText");

const courseTitle =
document.getElementById("courseTitle");

const courseDescription =
document.getElementById("courseDescription");

const chaptersContainer =
document.getElementById("chaptersContainer");


// =====================================================
// START
// =====================================================

if (!courseId) {

    showError(
        "لم يتم تحديد الكورس."
    );

} else {

    startPage();

}


// =====================================================
// START PAGE
// =====================================================

function startPage() {

    showLoading();

    onAuthStateChanged(

        auth,

        async (user) => {

            if (!user) {

                window.location.replace(
                    "login.html"
                );

                return;

            }

            currentUser = user;

            await loadCourse();

        }

    );

}


// =====================================================
// LOAD COURSE
// =====================================================

async function loadCourse() {

    try {

        const courseRef = doc(

            db,

            "courses",

            courseId

        );

        const courseSnap =

        await getDoc(courseRef);

        if (!courseSnap.exists()) {

            showError(
                "الكورس غير موجود."
            );

            return;

        }

        currentCourse = {

            id: courseSnap.id,

            ...courseSnap.data()

        };

        courseTitle.textContent =

            currentCourse.title ||

            currentCourse.courseName ||

            "اسم الكورس";

        courseDescription.textContent =

            currentCourse.description ||

            "اختر الفصل الذي تريد دراسته";

        await loadChapters();

    }

    catch (error) {

        console.error(error);

        showError(
            "حدث خطأ أثناء تحميل الكورس."
        );

    }

}
/* =====================================================
        PART 2
        LOAD CHAPTERS
===================================================== */


// =====================================================
// LOAD CHAPTERS
// =====================================================

async function loadChapters() {

    try {

        chapters = [];

        const snapshot = await getDocs(

            collection(

                db,

                "chapters"

            )

        );

        snapshot.forEach((document) => {

            const data = document.data();

            // الفصول الخاصة بالكورس الحالي فقط
            if (String(data.courseId) !== String(courseId)) {

                return;

            }

            chapters.push({

                id: document.id,

                title:
                    data.title ||
                    data.chapterName ||
                    "فصل بدون عنوان",

                description:
                    data.description || "",

                order:
                    Number(data.order || 0),

                isFree:
                    data.isFree || false,

                price:
                    Number(data.price || 0),

                videos:
                    Array.isArray(data.videos)
                        ? data.videos
                        : [],

                pdfs:
                    Array.isArray(data.pdfs)
                        ? data.pdfs
                        : []

            });

        });

        // ترتيب الفصول
        chapters.sort((a, b) => {

            return a.order - b.order;

        });

        hideLoading();

        renderChapters();

    }

    catch (error) {

        console.error(

            "Load Chapters Error:",

            error

        );

        showError(

            "حدث خطأ أثناء تحميل الفصول."

        );

    }

}



/* =====================================================
        RENDER CHAPTERS
===================================================== */

function renderChapters() {

    chaptersContainer.innerHTML = "";

    chaptersContent.classList.remove(

        "hidden"

    );

    if (chapters.length === 0) {

        chaptersContainer.innerHTML = `

        <div class="empty-content">

            <i class="fa-solid fa-folder-open"></i>

            <h3>لا توجد فصول</h3>

            <p>

                لم يتم إضافة أي فصل لهذا الكورس حتى الآن.

            </p>

        </div>

        `;

        return;

    }

    chapters.forEach((chapter, index) => {

        createChapterCard(

            chapter,

            index

        );

    });

}
/* =====================================================
        PART 3
        CREATE CHAPTER CARD
===================================================== */


function createChapterCard(chapter, index) {

    const videosCount =

        Array.isArray(chapter.videos)

        ? chapter.videos.length

        : 0;

    const pdfsCount =

        Array.isArray(chapter.pdfs)

        ? chapter.pdfs.length

        : 0;


    const card = document.createElement("article");

    card.className = "chapter-card";


    card.innerHTML = `

        ${chapter.isFree ? `
            <div class="free-badge">
                <i class="fa-solid fa-unlock"></i>
                مجاني
            </div>
        ` : ""}


        <div class="chapter-top">

            <div class="chapter-number">

                ${index + 1}

            </div>

            <div class="chapter-info">

                <h2 class="chapter-title">

                    ${escapeHTML(chapter.title)}

                </h2>

                <p class="chapter-description">

                    ${escapeHTML(chapter.description)}

                </p>

            </div>

        </div>


        <div class="chapter-divider"></div>


        <div class="chapter-details">

            <div class="detail-item">

                <i class="fa-solid fa-video"></i>

                <span>

                    ${videosCount} فيديو

                </span>

            </div>

            <div class="detail-item">

                <i class="fa-solid fa-file-pdf"></i>

                <span>

                    ${pdfsCount} ملف

                </span>

            </div>

        </div>


        <button class="chapter-btn">

            <i class="fa-solid fa-play"></i>

            متابعة الفصل

        </button>

    `;


    const button =

        card.querySelector(".chapter-btn");


    button.addEventListener(

        "click",

        () => {

            window.location.href =

            `course.html?chapterId=${encodeURIComponent(chapter.id)}`;

        }

    );


    chaptersContainer.appendChild(card);

}
/* =====================================================
        PART 4
        HELPERS
===================================================== */


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    loadingBox?.classList.remove("hidden");

    chaptersContent?.classList.add("hidden");

    errorBox?.classList.add("hidden");

}


// =====================================================
// HIDE LOADING
// =====================================================

function hideLoading() {

    loadingBox?.classList.add("hidden");

    chaptersContent?.classList.remove("hidden");

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    loadingBox?.classList.add("hidden");

    chaptersContent?.classList.add("hidden");

    errorBox?.classList.remove("hidden");

    if (errorText) {

        errorText.textContent = message;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === undefined || value === null) {

        return "";

    }

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =====================================================
// DEBUG
// =====================================================

console.log("====================================");
console.log("Chapters Page Loaded");
console.log("Course ID :", courseId);
console.log("====================================");