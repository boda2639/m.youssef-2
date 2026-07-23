// ========================================
// FIREBASE
// ========================================

import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// ========================================
// ELEMENTS
// ========================================


const walletBalance =
document.getElementById("walletBalance");


const studentName =
document.getElementById("studentName");


const studentCode =
document.getElementById("studentCode");


const studentEmail =
document.getElementById("studentEmail");


const coursesCount =
document.getElementById("coursesCount");


const spentMoney =
document.getElementById("spentMoney");


const historyList =
document.getElementById("historyList");


const loadingBox =
document.getElementById("loadingBox");


const refreshWallet =
document.getElementById("refreshWallet");


const backBtn =
document.getElementById("backBtn");






// ========================================
// AUTH
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


    loadWallet(user.uid);


});







// ========================================
// LOAD WALLET
// ========================================


async function loadWallet(uid){


try{


    if(loadingBox)
        loadingBox.style.display="flex";



    const studentRef =
    doc(
        db,
        "students",
        uid
    );



    const snap =
    await getDoc(studentRef);



    if(!snap.exists()){

        alert(
            "بيانات الطالب غير موجودة"
        );

        return;

    }



    const student =
    snap.data();





    studentName.textContent =

    student.studentName ||

    student.name ||

    student.fullName ||

    "طالب المنصة";





    studentCode.textContent =

    student.studentCode ||

    student.code ||

    "-";





    studentEmail.textContent =

    student.email ||

    auth.currentUser.email ||

    "-";





    const balance =

    Number(
        student.wallet || 0
    );



    walletBalance.textContent =

    `${balance.toLocaleString("ar-EG")} جنيه`;





    const courses =

    Array.isArray(
        student.purchasedCourses
    )

    ?

    student.purchasedCourses

    :

    [];




    coursesCount.textContent =

    courses.length;



    loadHistory(uid);



}

catch(error){


    console.error(
        error
    );


}


finally{


    if(loadingBox)

    loadingBox.style.display="none";


}



}









// ========================================
// HISTORY
// ========================================


async function loadHistory(uid){


try{


historyList.innerHTML="";



let totalSpent=0;




const q = query(

    collection(
        db,
        "walletHistory"
    ),


    where(
        "uid",
        "==",
        uid
    ),


    orderBy(
        "createdAt",
        "desc"
    )

);



const snap =
await getDocs(q);




if(snap.empty){


historyList.innerHTML=`

<div class="empty-history">

<i class="fa-solid fa-wallet"></i>

<p>
لا توجد عمليات شراء
</p>

</div>

`;

spentMoney.textContent="0";

return;


}




snap.forEach(item=>{


const data =
item.data();



const amount =
Number(
data.amount || 0
);



totalSpent += amount;




let date="";



if(data.createdAt){


if(data.createdAt.seconds){

date =
new Date(
data.createdAt.seconds*1000
)
.toLocaleString(
"ar-EG"
);


}

else{


date =
new Date(
data.createdAt
)
.toLocaleString(
"ar-EG"
);


}



}




historyList.innerHTML += `

<div class="history-item">


<div>


<h4>

${data.courseName || "شراء كورس"}

</h4>


<p>

${date}

</p>


</div>



<div class="price">


-${amount.toLocaleString("ar-EG")} جنيه


</div>



</div>

`;



});



spentMoney.textContent =

totalSpent.toLocaleString("ar-EG");



}

catch(error){


console.error(
"History Error",
error
);


}

}









// ========================================
// REFRESH
// ========================================


if(refreshWallet){


refreshWallet.onclick=()=>{


if(auth.currentUser){


loadWallet(
auth.currentUser.uid
);


}


};


}







// ========================================
// BACK
// ========================================


if(backBtn){


backBtn.onclick=()=>{


window.history.back();


};


}