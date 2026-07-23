// ========================================
// M.YOUSSEF PLATFORM
// PROFILE.JS
// PART 1
// ========================================


// ========================================
// FIREBASE
// ========================================

import {
    auth,
    db
} from "./firebase.js";

import {
    verifyDevice
} from "./security.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// USER DATA
// ========================================

let currentUser = null;
let currentStudent = null;


// ========================================
// HTML ELEMENTS
// ========================================


// Loading

const loadingBox =
document.getElementById(
    "loadingBox"
);


// Main Content

const profileContent =
document.getElementById(
    "profileContent"
);


// Error

const errorBox =
document.getElementById(
    "errorBox"
);

const errorText =
document.getElementById(
    "errorText"
);


// Student Header

const studentName =
document.getElementById(
    "studentName"
);

const studentImage =
document.getElementById(
    "studentImage"
);

const accountStatus =
document.getElementById(
    "accountStatus"
);


// Student Data

const name =
document.getElementById(
    "name"
);

const email =
document.getElementById(
    "email"
);

const phone =
document.getElementById(
    "phone"
);

const studentGrade =
document.getElementById(
    "studentGrade"
);

const studentCode =
document.getElementById(
    "studentCode"
);

const wallet =
document.getElementById(
    "wallet"
);

const purchasedCount =
document.getElementById(
    "purchasedCount"
);

const joinDate =
document.getElementById(
    "joinDate"
);


// Buttons

const logoutBtn =
document.getElementById(
    "logoutBtn"
);


// ========================================
// DEFAULT VALUES
// ========================================

const DEFAULT_NAME =
"طالب المنصة";

const DEFAULT_PHONE =
"غير مضاف";

const DEFAULT_CODE =
"غير مضاف";

const DEFAULT_GRADE =
"غير مضاف";

const DEFAULT_EMAIL =
"غير متوفر";

const DEFAULT_WALLET =
"0 جنيه";

const DEFAULT_DATE =
"غير معروف";
// ========================================
// AUTH CHECK
// ========================================

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }

        currentUser = user;

        try{

            showLoading();

            // التحقق من الجهاز
            const deviceAllowed =

            await verifyDevice(user);

            if(!deviceAllowed){

                hideLoading();

                return;

            }

            // تحميل بيانات الطالب
            await loadStudentData(
                user.uid
            );

        }

        catch(error){

            console.error(
                "Profile Error:",
                error
            );

            showError(
                "حدث خطأ أثناء تحميل الحساب."
            );

        }

    }

);




// ========================================
// LOAD STUDENT DATA
// ========================================

async function loadStudentData(uid){

    try{

        const studentRef =

        doc(

            db,

            "students",

            uid

        );

        const studentSnap =

        await getDoc(
            studentRef
        );

        if(!studentSnap.exists()){

            loadDefaultData();

            return;

        }

        currentStudent =

        studentSnap.data();

        console.log(
            "Student Data:",
            currentStudent
        );

        fillProfileData();

    }

    catch(error){

        console.error(
            "Firestore Error:",
            error
        );

        showError(
            "تعذر تحميل بيانات الطالب."
        );

    }

}




// ========================================
// DEFAULT DATA
// ========================================

function loadDefaultData(){

    setText(
        studentName,
        DEFAULT_NAME
    );

    setText(
        name,
        DEFAULT_NAME
    );

    setText(
        email,
        currentUser?.email ||
        DEFAULT_EMAIL
    );

    setText(
        phone,
        DEFAULT_PHONE
    );

    setText(
        studentGrade,
        DEFAULT_GRADE
    );

    setText(
        studentCode,
        DEFAULT_CODE
    );

    setText(
        wallet,
        DEFAULT_WALLET
    );

    setText(
        purchasedCount,
        "0"
    );

    setText(
        joinDate,
        DEFAULT_DATE
    );

    hideLoading();

}
// ========================================
// FILL PROFILE DATA
// ========================================

function fillProfileData(){

    if(!currentStudent){

        loadDefaultData();

        return;

    }


    // ==========================
    // NAME
    // ==========================

    const fullName =

        currentStudent.studentName ||

        currentStudent.name ||

        currentStudent.fullName ||

        DEFAULT_NAME;


    setText(
        studentName,
        fullName
    );

    setText(
        name,
        fullName
    );


    // ==========================
    // EMAIL
    // ==========================

    setText(

        email,

        currentStudent.email ||

        currentUser.email ||

        DEFAULT_EMAIL

    );


    // ==========================
    // PHONE
    // ==========================

    setText(

        phone,

        currentStudent.phone ||

        currentStudent.phoneNumber ||

        DEFAULT_PHONE

    );


    // ==========================
    // GRADE
    // ==========================

    setText(

        studentGrade,

        currentStudent.grade ||

        currentStudent.studentGrade ||

        currentStudent.class ||

        DEFAULT_GRADE

    );


    // ==========================
    // STUDENT CODE
    // ==========================

    setText(

        studentCode,

        currentStudent.studentCode ||

        currentStudent.code ||

        DEFAULT_CODE

    );


    // ==========================
    // WALLET
    // ==========================

    const balance =

    Number(
        currentStudent.wallet || 0
    );


    setText(

        wallet,

        `${balance.toLocaleString("ar-EG")} جنيه`

    );


    // ==========================
    // PURCHASED COURSES
    // ==========================

    const courses =

    Array.isArray(

        currentStudent.purchasedCourses

    )

    ?

    currentStudent.purchasedCourses

    :

    [];


    setText(

        purchasedCount,

        courses.length

    );


    // ==========================
    // JOIN DATE
    // ==========================

    if(currentStudent.createdAt){

        try{

            let date;

            if(

                currentStudent.createdAt.seconds

            ){

                date =

                new Date(

                    currentStudent.createdAt.seconds * 1000

                );

            }

            else{

                date =

                new Date(

                    currentStudent.createdAt

                );

            }

            setText(

                joinDate,

                date.toLocaleDateString(

                    "ar-EG"

                )

            );

        }

        catch{

            setText(

                joinDate,

                DEFAULT_DATE

            );

        }

    }

    else{

        setText(

            joinDate,

            DEFAULT_DATE

        );

    }


    // ==========================
    // ACCOUNT STATUS
    // ==========================

    if(accountStatus){

        accountStatus.innerHTML =

        `<i class="fa-solid fa-circle-check"></i> نشط`;

    }


    // ==========================
    // STUDENT IMAGE
    // ==========================

    if(

        studentImage &&

        currentStudent.photoURL

    ){

        studentImage.src =

        currentStudent.photoURL;

    }


    // ==========================
    // FINISH
    // ==========================

    hideLoading();

}
// ========================================
// SHOW LOADING
// ========================================

function showLoading(){

    if(loadingBox){

        loadingBox.classList.remove(
            "hidden"
        );

    }

    if(profileContent){

        profileContent.classList.add(
            "hidden"
        );

    }

    if(errorBox){

        errorBox.classList.add(
            "hidden"
        );

    }

}




// ========================================
// HIDE LOADING
// ========================================

function hideLoading(){

    if(loadingBox){

        loadingBox.classList.add(
            "hidden"
        );

    }

    if(profileContent){

        profileContent.classList.remove(
            "hidden"
        );

    }

}




// ========================================
// SET TEXT
// ========================================

function setText(element,value){

    if(!element) return;

    if(
        value === undefined ||
        value === null ||
        value === ""
    ){

        element.textContent =
        "غير متوفر";

        return;

    }

    element.textContent =
    value;

}




// ========================================
// SHOW ERROR
// ========================================

function showError(message){

    hideLoading();

    if(errorBox){

        errorBox.classList.remove(
            "hidden"
        );

    }

    if(errorText){

        errorText.textContent =
        message;

    }

}




// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue){

    if(!dateValue){

        return DEFAULT_DATE;

    }

    try{

        let date;

        if(dateValue.seconds){

            date = new Date(
                dateValue.seconds * 1000
            );

        }

        else{

            date = new Date(
                dateValue
            );

        }

        return date.toLocaleDateString(
            "ar-EG",
            {

                year:"numeric",

                month:"long",

                day:"numeric"

            }
        );

    }

    catch{

        return DEFAULT_DATE;

    }

}




// ========================================
// LOGOUT
// ========================================

if(logoutBtn){

    logoutBtn.onclick = async()=>{

        try{

            await signOut(auth);

            localStorage.clear();

            sessionStorage.clear();

            window.location.replace(
                "login.html"
            );

        }

        catch(error){

            console.error(
                "Logout Error:",
                error
            );

            alert(
                "حدث خطأ أثناء تسجيل الخروج."
            );

        }

    };

}
// ========================================
// UPDATE PROFILE
// ========================================

async function refreshProfile(){

    if(!currentUser){

        return;

    }

    try{

        const studentRef =

        doc(

            db,

            "students",

            currentUser.uid

        );

        const snap =

        await getDoc(
            studentRef
        );

        if(!snap.exists()){

            return;

        }

        currentStudent =

        snap.data();

        fillProfileData();

    }

    catch(error){

        console.error(

            "Refresh Error:",

            error

        );

    }

}




// ========================================
// WALLET ANIMATION
// ========================================

function animateWallet(value){

    if(!wallet){

        return;

    }

    const target =

    Number(value || 0);

    let current = 0;

    const speed =

    Math.max(

        1,

        Math.ceil(target / 60)

    );

    const timer =

    setInterval(()=>{

        current += speed;

        if(current >= target){

            current = target;

            clearInterval(timer);

        }

        wallet.textContent =

        `${current.toLocaleString("ar-EG")} جنيه`;

    },15);

}




// ========================================
// UPDATE LAST LOGIN
// ========================================

function updateLastLogin(){

    const lastLogin =

    document.getElementById(
        "lastLogin"
    );

    if(lastLogin){

        lastLogin.textContent =

        "اليوم";

    }

}




// ========================================
// UPDATE SUBJECT
// ========================================

function updateSubject(){

    const subject =

    document.getElementById(
        "subjectName"
    );

    if(subject){

        subject.textContent =

        "فيزياء • كيمياء";

    }

}




// ========================================
// PAGE VISIBILITY
// ========================================

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.visibilityState ===

            "visible"

        ){

            refreshProfile();

        }

    }

);




// ========================================
// WINDOW FOCUS
// ========================================

window.addEventListener(

    "focus",

    ()=>{

        refreshProfile();

    }

);




// ========================================
// START EXTRA FEATURES
// ========================================

setTimeout(()=>{

    if(currentStudent){

        animateWallet(

            currentStudent.wallet || 0

        );

    }

    updateLastLogin();

    updateSubject();

},300);
// ========================================
// PROFILE UTILITIES
// ========================================


// إعادة تحميل البيانات

async function reloadProfile(){

    if(!currentUser){

        return;

    }

    showLoading();

    await loadStudentData(

        currentUser.uid

    );

}



// ========================================
// RETRY BUTTON (اختياري)
// ========================================

const retryBtn =

document.getElementById(
    "retryBtn"
);

if(retryBtn){

    retryBtn.onclick = ()=>{

        reloadProfile();

    };

}



// ========================================
// ACCOUNT TYPE
// ========================================

function updateAccountType(){

    const accountType =

    document.getElementById(
        "accountType"
    );

    if(!accountType){

        return;

    }

    accountType.textContent =

    "طالب بالمنصة";

}



// ========================================
// ACCOUNT STATUS
// ========================================

function updateAccountStatus(){

    if(!accountStatus){

        return;

    }

    accountStatus.innerHTML =

    `

    <i class="fa-solid fa-circle-check"></i>

    الحساب نشط

    `;

}



// ========================================
// PROFILE IMAGE
// ========================================

function updateProfileImage(){

    if(

        !studentImage ||

        !currentStudent

    ){

        return;

    }

    if(currentStudent.photoURL){

        studentImage.src =

        currentStudent.photoURL;

    }

}



// ========================================
// UPDATE PAGE TITLE
// ========================================

function updatePageTitle(){

    if(!currentStudent){

        return;

    }

    const fullName =

    currentStudent.studentName ||

    currentStudent.name ||

    "طالب";

    document.title =

    `${fullName} | الملف الشخصي`;

}



// ========================================
// START UI
// ========================================

function initializeProfile(){

    updateAccountType();

    updateAccountStatus();

    updateProfileImage();

    updatePageTitle();

}



// ========================================
// START
// ========================================

window.addEventListener(

    "load",

    ()=>{

        initializeProfile();

    }

);



// ========================================
// EXPORT (اختياري)
// ========================================

export {

    reloadProfile

};
// ========================================
// AUTO REFRESH
// ========================================

let refreshTimer = null;

function startAutoRefresh(){

    stopAutoRefresh();

    refreshTimer = setInterval(

        async()=>{

            if(

                !currentUser ||

                document.hidden

            ){

                return;

            }

            try{

                await refreshProfile();

            }

            catch(error){

                console.log(

                    "Auto Refresh:",

                    error

                );

            }

        },

        60000

    );

}

function stopAutoRefresh(){

    if(refreshTimer){

        clearInterval(

            refreshTimer

        );

        refreshTimer = null;

    }

}



// ========================================
// PAGE EVENTS
// ========================================

window.addEventListener(

    "focus",

    ()=>{

        refreshProfile();

        startAutoRefresh();

    }

);

window.addEventListener(

    "blur",

    ()=>{

        stopAutoRefresh();

    }

);

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(document.hidden){

            stopAutoRefresh();

        }

        else{

            refreshProfile();

            startAutoRefresh();

        }

    }

);



// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener(

    "keydown",

    async(event)=>{

        // Ctrl + R

        if(

            event.ctrlKey &&

            event.key.toLowerCase()==="r"

        ){

            event.preventDefault();

            await reloadProfile();

        }

        // F5

        if(event.key==="F5"){

            event.preventDefault();

            await reloadProfile();

        }

    }

);



// ========================================
// NETWORK STATUS
// ========================================

window.addEventListener(

    "offline",

    ()=>{

        showError(

            "لا يوجد اتصال بالإنترنت."

        );

    }

);

window.addEventListener(

    "online",

    ()=>{

        refreshProfile();

    }

);



// ========================================
// START SERVICES
// ========================================

startAutoRefresh();
// ========================================
// AUTH STATE MONITOR
// ========================================

function monitorAuthState(){

    if(!auth.currentUser){

        localStorage.clear();

        sessionStorage.clear();

        window.location.replace(
            "login.html"
        );

    }

}

setInterval(

    monitorAuthState,

    30000

);




// ========================================
// DATA VALIDATION
// ========================================

function validateStudentData(data){

    if(!data){

        return false;

    }

    if(

        typeof data !== "object"

    ){

        return false;

    }

    return true;

}




// ========================================
// SAFE VALUE
// ========================================

function safeValue(

    value,

    defaultValue = "غير متوفر"

){

    if(

        value === undefined ||

        value === null ||

        value === ""

    ){

        return defaultValue;

    }

    return value;

}




// ========================================
// SAFE NUMBER
// ========================================

function safeNumber(value){

    const number = Number(value);

    if(

        isNaN(number)

    ){

        return 0;

    }

    return number;

}




// ========================================
// COPY STUDENT CODE
// ========================================

function copyStudentCode(){

    if(

        !currentStudent

    ){

        return;

    }

    const code =

        currentStudent.studentCode ||

        currentStudent.code;

    if(!code){

        return;

    }

    navigator.clipboard.writeText(

        code

    );

    alert(

        "تم نسخ كود الطالب."

    );

}




// ========================================
// DOUBLE CLICK COPY
// ========================================

if(studentCode){

    studentCode.addEventListener(

        "dblclick",

        copyStudentCode

    );

}




// ========================================
// PROFILE READY
// ========================================

function profileReady(){

    console.log(

        "Profile Loaded Successfully"

    );

}




// ========================================
// START
// ========================================

window.addEventListener(

    "load",

    ()=>{

        profileReady();

    }

);
// ========================================
// PART 9
// EXTRA UTILITIES
// ========================================


// ========================================
// GET FULL NAME
// ========================================

function getStudentName(){

    if(!currentStudent){

        return DEFAULT_NAME;

    }

    return (

        currentStudent.studentName ||

        currentStudent.name ||

        currentStudent.fullName ||

        DEFAULT_NAME

    );

}



// ========================================
// GET STUDENT EMAIL
// ========================================

function getStudentEmail(){

    if(!currentStudent){

        return currentUser?.email ||

        DEFAULT_EMAIL;

    }

    return (

        currentStudent.email ||

        currentUser?.email ||

        DEFAULT_EMAIL

    );

}



// ========================================
// GET WALLET BALANCE
// ========================================

function getWalletBalance(){

    if(!currentStudent){

        return 0;

    }

    return Number(

        currentStudent.wallet || 0

    );

}



// ========================================
// GET PURCHASED COURSES
// ========================================

function getPurchasedCourses(){

    if(

        !currentStudent ||

        !Array.isArray(

            currentStudent.purchasedCourses

        )

    ){

        return [];

    }

    return currentStudent.purchasedCourses;

}



// ========================================
// UPDATE COURSE COUNT
// ========================================

function updateCourseCount(){

    const count =

    getPurchasedCourses().length;

    setText(

        purchasedCount,

        count

    );

}



// ========================================
// UPDATE WALLET
// ========================================

function updateWallet(){

    animateWallet(

        getWalletBalance()

    );

}



// ========================================
// UPDATE PROFILE HEADER
// ========================================

function updateHeader(){

    setText(

        studentName,

        getStudentName()

    );

}



// ========================================
// UPDATE BASIC DATA
// ========================================

function updateBasicData(){

    setText(

        name,

        getStudentName()

    );

    setText(

        email,

        getStudentEmail()

    );

}



// ========================================
// REFRESH UI
// ========================================

function refreshUI(){

    updateHeader();

    updateBasicData();

    updateWallet();

    updateCourseCount();

}



// ========================================
// START UI
// ========================================

window.addEventListener(

    "load",

    ()=>{

        refreshUI();

    }

);



// ========================================
// END PART 9
// ========================================
