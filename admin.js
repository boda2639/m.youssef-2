// ======================================
// Firebase
// ======================================

import { auth, db } from "./firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ======================================
// HTML Elements
// ======================================

const menuItems =
document.querySelectorAll(".menu li[data-page]");

const pages =
document.querySelectorAll(".page");

const logoutBtn =
document.getElementById("logoutBtn");

const pendingTable =
document.getElementById("pendingStudentsTable");

const studentsTable =
document.getElementById("studentsTable");

const walletTable =
document.getElementById("walletTable");

const coursesGrid =
document.getElementById("coursesGrid");


// Dashboard

const studentsCount =
document.getElementById("studentsCount");

const requestsCount =
document.getElementById("requestsCount");

const coursesCount =
document.getElementById("coursesCount");

const walletTotal =
document.getElementById("walletTotal");

const pendingBadge =
document.getElementById("pendingCount");


// ======================================
// Navigation
// ======================================

menuItems.forEach(item=>{

    item.addEventListener("click",()=>{

        menuItems.forEach(i=>i.classList.remove("active"));

        pages.forEach(page=>{

            page.classList.remove("active-page");

        });

        item.classList.add("active");

        const pageName =
        item.dataset.page;

        document
        .getElementById(pageName)
        .classList
        .add("active-page");

    });

});


// ======================================
// Logout
// ======================================

logoutBtn.addEventListener(

    "click",

    async()=>{

        await signOut(auth);

        window.location.href="login.html";

    }

);


// ======================================
// Load Dashboard
// ======================================

window.addEventListener(

"load",

()=>{

    loadPendingStudents();

    loadStudents();

    loadCourses();

}

);


// ======================================
// Pending Students
// ======================================

async function loadPendingStudents(){

    pendingTable.innerHTML="";

    const snapshot =
    await getDocs(

        collection(
            db,
            "pendingStudents"
        )

    );

    pendingBadge.textContent =
    snapshot.size;

    requestsCount.textContent =
    snapshot.size;

    snapshot.forEach(docSnap=>{

        const data =
        docSnap.data();

        pendingTable.innerHTML += `

<tr>

<td>${data.fullName || ""}</td>

<td>${data.email || ""}</td>

<td>${data.grade || ""}</td>

<td>${data.studentPhone || ""}</td>

<td>${data.parentPhone || ""}</td>

<td>${data.governorate || ""}</td>

<td>${data.city || ""}</td>

<td>

<button
class="action-btn accept-btn"
onclick="approveStudent('${docSnap.id}')">

<i class="fa-solid fa-check"></i>

</button>

<button
class="action-btn reject-btn"
onclick="rejectStudent('${docSnap.id}')">

<i class="fa-solid fa-xmark"></i>

</button>

</td>

</tr>

`;

    });

}
// ======================================
// Approve Student
// ======================================

window.approveStudent = async function(uid){

    try{

        const pendingRef = doc(db,"pendingStudents",uid);

        const pendingSnap = await getDoc(pendingRef);

        if(!pendingSnap.exists()){

            alert("الطالب غير موجود.");

            return;

        }

        const data = pendingSnap.data();

        await setDoc(doc(db,"students",uid),{

            uid:uid,

            fullName:data.fullName || "",

            email:data.email || "",

            grade:data.grade || "",

            studentPhone:data.studentPhone || "",

            parentPhone:data.parentPhone || "",

            governorate:data.governorate || "",

            city:data.city || "",

            wallet:0,

            purchasedCourses:[],

            approved:true,

            createdAt:data.createdAt || serverTimestamp()

        });

        await deleteDoc(
            doc(db,"pendingStudents",uid)
        );

        alert("تمت الموافقة على الطالب بنجاح.");

        loadPendingStudents();

        loadStudents();

    }

    catch(error){

        console.error(error);

        alert("حدث خطأ أثناء الموافقة.");

    }

};


// ======================================
// Reject Student
// ======================================

window.rejectStudent = async function(uid){

    if(!confirm("هل تريد رفض هذا الطالب؟")){

        return;

    }

    try{

        await deleteDoc(
            doc(db,"pendingStudents",uid)
        );

        alert("تم حذف الطلب.");

        loadPendingStudents();

    }

    catch(error){

        console.error(error);

        alert("حدث خطأ.");

    }

};


// ======================================
// Students
// ======================================

async function loadStudents(){

    studentsTable.innerHTML="";

    let walletSum = 0;

    const snapshot = await getDocs(

        collection(
            db,
            "students"
        )

    );

    studentsCount.textContent =
    snapshot.size;

    snapshot.forEach(docSnap=>{

        const data = docSnap.data();

        walletSum += Number(data.wallet || 0);

        studentsTable.innerHTML += `

<tr>

<td>${data.fullName}</td>

<td>${data.email}</td>

<td>${data.wallet || 0} جنيه</td>

<td>${(data.purchasedCourses || []).length}</td>

<td>

<button

class="action-btn edit-btn"

onclick="editWallet('${docSnap.id}')">

<i class="fa-solid fa-wallet"></i>

</button>

<button

class="action-btn delete-btn"

onclick="deleteStudent('${docSnap.id}')">

<i class="fa-solid fa-trash"></i>

</button>

</td>

</tr>

`;

    });

    walletTotal.textContent =
    walletSum + " جنيه";

}
// ======================================
// Wallet Management
// ======================================

let selectedStudentId = null;

const walletModal =
document.getElementById("walletModal");

const walletAmount =
document.getElementById("walletAmount");

const addWalletBtn =
document.getElementById("addWalletBtn");

const removeWalletBtn =
document.getElementById("removeWalletBtn");

const closeWalletModal =
document.getElementById("closeWalletModal");


// فتح نافذة المحفظة

window.editWallet = function(uid){

    selectedStudentId = uid;

    walletAmount.value = "";

    walletModal.classList.add("active");

};


// إغلاق النافذة

closeWalletModal.onclick = ()=>{

    walletModal.classList.remove("active");

};


// إضافة رصيد

addWalletBtn.onclick = async()=>{

    const amount = Number(walletAmount.value);

    if(amount <= 0){

        alert("أدخل مبلغ صحيح");

        return;

    }

    const ref =
    doc(db,"students",selectedStudentId);

    const snap =
    await getDoc(ref);

    if(!snap.exists()) return;

    const data = snap.data();

    const currentWallet =
    Number(data.wallet || 0);

    await updateDoc(ref,{

        wallet:
        currentWallet + amount

    });

    walletModal.classList.remove("active");

    loadStudents();

};


// خصم رصيد

removeWalletBtn.onclick = async()=>{

    const amount = Number(walletAmount.value);

    if(amount <= 0){

        alert("أدخل مبلغ صحيح");

        return;

    }

    const ref =
    doc(db,"students",selectedStudentId);

    const snap =
    await getDoc(ref);

    if(!snap.exists()) return;

    const data = snap.data();

    let wallet =
    Number(data.wallet || 0);

    wallet -= amount;

    if(wallet < 0){

        wallet = 0;

    }

    await updateDoc(ref,{

        wallet

    });

    walletModal.classList.remove("active");

    loadStudents();

};


// حذف طالب

window.deleteStudent = async(uid)=>{

    const ok = confirm("هل تريد حذف الطالب؟");

    if(!ok) return;

    try{

        await deleteDoc(
            doc(db,"students",uid)
        );

        loadStudents();

        alert("تم حذف الطالب");

    }

    catch(error){

        console.log(error);

        alert("حدث خطأ");

    }

};