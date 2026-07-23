// ==========================================
// FIREBASE
// ==========================================


import {

    auth,
    db

} from "./firebase.js";


import {

    onAuthStateChanged,
    signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// ==========================================
// HTML ELEMENTS
// ==========================================


const coursesContainer =

document.getElementById(
    "coursesContainer"
);



const loadingBox =

document.getElementById(
    "loadingBox"
);



const emptyBox =

document.getElementById(
    "emptyState"
);



const searchInput =

document.getElementById(
    "courseSearch"
);



const logoutBtn =

document.getElementById(
    "logoutBtn"
);




// ==========================================
// USER DATA
// ==========================================


let currentUser = null;


let studentData = null;


let studentWallet = 0;


let purchasedCourses = [];


let allCourses = [];




// ==========================================
// START PAGE
// ==========================================


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



        await loadStudent();


        await loadCourses();


    }

);




// ==========================================
// LOAD STUDENT
// ==========================================


async function loadStudent(){


try{


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




    if(!studentSnap.exists()){


        alert(
            "بيانات الطالب غير موجودة."
        );


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


    ?


    studentData.purchasedCourses


    :


    [];



}



catch(error){


    console.error(

        "Student Error:",

        error

    );


    alert(
        "حدث خطأ في تحميل بيانات الطالب."
    );


}



}
// ==========================================
// LOAD COURSES
// ==========================================


async function loadCourses(){


try{


    loadingBox?.classList.remove(
        "hidden"
    );


    emptyBox?.classList.add(
        "hidden"
    );


    coursesContainer.innerHTML = "";




    const snapshot =

    await getDocs(

        collection(

            db,

            "courses"

        )

    );




    allCourses = [];




    snapshot.forEach(

        (docSnap)=>{


            const data =

            docSnap.data();




            allCourses.push({


                id:

                docSnap.id,



                title:


                data.title ||


                data.courseName ||


                data.name ||


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




                price:


                Number(

                    data.price || 0

                ),




                order:


                Number(

                    data.order || 0

                )



            });



        }

    );







    allCourses.sort(

        (a,b)=>{


            return a.order - b.order;


        }

    );





    loadingBox?.classList.add(

        "hidden"

    );






    if(allCourses.length === 0){


        emptyBox?.classList.remove(

            "hidden"

        );


        return;


    }







    renderCourses(

        allCourses

    );





}



catch(error){



    console.error(

        "Courses Error:",

        error

    );



    loadingBox?.classList.add(

        "hidden"

    );



    alert(

        "حدث خطأ أثناء تحميل الكورسات."

    );



}



}






// ==========================================
// RENDER COURSES
// ==========================================


function renderCourses(courses){



    coursesContainer.innerHTML = "";





    courses.forEach(

        (course)=>{



            const isFree =

            Number(course.price) <= 0;





            const isPurchased =

            purchasedCourses.includes(

                course.id

            );





            const card =

            document.createElement(

                "article"

            );




            card.className =

            "course-card";





            let priceBadge = "";

            let statusBox = "";

            let buttonText = "";

            let buttonClass = "";





            // ==========================
            // FREE
            // ==========================


            if(isFree){



                priceBadge = `

                <span class="course-price free">

                    مجاني

                </span>

                `;



                statusBox = `

                <div class="course-status free">


                    <i class="fa-solid fa-circle-check"></i>


                    كورس مجاني


                </div>

                `;



                buttonText =

                "ابدأ الكورس";



                buttonClass =

                "free-btn";



            }



            // ==========================
            // PURCHASED
            // ==========================


            else if(isPurchased){



                priceBadge = `

                <span class="course-price purchased">

                    تم الشراء

                </span>

                `;



                statusBox = `

                <div class="course-status purchased">


                    <i class="fa-solid fa-lock-open"></i>


                    الكورس مفتوح


                </div>

                `;



                buttonText =

                "فتح الكورس";



                buttonClass =

                "open-btn";



            }




            // ==========================
            // LOCKED
            // ==========================


            else {



                priceBadge = `

                <span class="course-price paid">

                    ${course.price} جنيه

                </span>

                `;



                statusBox = `

                <div class="course-status paid">


                    <i class="fa-solid fa-lock"></i>


                    الكورس مغلق


                </div>

                `;



                buttonText =

                "شراء الكورس";



                buttonClass =

                "buy-btn";


            }





            card.innerHTML = `


            <div class="course-image">


                <img

                src="${course.image}"

                alt="${escapeHTML(course.title)}"

                >


                ${priceBadge}


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



                ${statusBox}




                <button

                class="course-btn ${buttonClass}"

                data-id="${course.id}"

                >

                    ${buttonText}

                </button>



            </div>


            `;






            const btn =

            card.querySelector(

                ".course-btn"

            );






            btn.onclick = ()=>{


                handleCourseAction(

                    course

                );


            };





            coursesContainer.appendChild(

                card

            );




        }

    );



}
// ==========================================
// COURSE ACTION
// ==========================================


async function handleCourseAction(course){


    const isFree =

    Number(course.price) <= 0;




    const isPurchased =

    purchasedCourses.includes(

        course.id

    );





    // ======================================
    // OPEN CHAPTERS
    // ======================================


    if(isFree || isPurchased){


        window.location.href =

        `chapters.html?courseId=${encodeURIComponent(course.id)}`;


        return;


    }







    // ======================================
    // CHECK WALLET
    // ======================================


    if(studentWallet < course.price){


        alert(

`❌ لا يوجد رصيد كافي.

رصيدك الحالي: ${studentWallet} جنيه

سعر الكورس: ${course.price} جنيه`

        );


        return;


    }







    const confirmBuy =

    confirm(

`سيتم خصم ${course.price} جنيه من المحفظة.

هل تريد شراء الكورس؟`

    );





    if(!confirmBuy){

        return;

    }







    try{



        const studentRef =

        doc(

            db,

            "students",

            currentUser.uid

        );







        await updateDoc(

            studentRef,

            {


                wallet:

                studentWallet - course.price,



                purchasedCourses:

                arrayUnion(

                    course.id

                )


            }

        );







        studentWallet -=

        course.price;





        purchasedCourses.push(

            course.id

        );






        alert(

            "✅ تم شراء الكورس بنجاح"

        );







        window.location.href =

        `chapters.html?courseId=${encodeURIComponent(course.id)}`;






    }



    catch(error){



        console.error(

            "Buy Error:",

            error

        );



        alert(

            "حدث خطأ أثناء شراء الكورس."

        );


    }


}







// ==========================================
// SEARCH
// ==========================================


if(searchInput){



searchInput.addEventListener(

"input",

()=>{



    const keyword =

    searchInput.value

    .trim()

    .toLowerCase();






    if(!keyword){


        renderCourses(

            allCourses

        );


        return;


    }






    const filtered =


    allCourses.filter(

    (course)=>{



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



    }

    );






    renderCourses(

        filtered

    );




}


);



}







// ==========================================
// LOGOUT
// ==========================================


if(logoutBtn){



logoutBtn.onclick = async()=>{



    const ok =

    confirm(

        "هل تريد تسجيل الخروج؟"

    );



    if(!ok){

        return;

    }






    try{


        await signOut(

            auth

        );



        localStorage.clear();

        sessionStorage.clear();



        window.location.replace(

            "login.html"

        );



    }



    catch(error){



        console.error(error);



        alert(

            "حدث خطأ أثناء تسجيل الخروج."

        );



    }




};



}








// ==========================================
// ESCAPE HTML
// ==========================================


function escapeHTML(value){


return String(value)

.replaceAll(

"&",

"&amp;"

)

.replaceAll(

"<",

"&lt;"

)

.replaceAll(

">",

"&gt;"

)

.replaceAll(

'"',

"&quot;"

)

.replaceAll(

"'",

"&#039;"

);


}






console.log(

"Dashboard Ready - Chapters System"

);