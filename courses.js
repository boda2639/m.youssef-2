/* =====================================================
        COURSES.JS
        CHAPTER CONTENT SYSTEM
===================================================== */


// ==========================================
// FIREBASE
// ==========================================

import {

    db,
    auth

} from "./firebase.js";


import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {

    doc,
    getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";




// ==========================================
// VARIABLES
// ==========================================


let currentUser = null;

let currentStudent = null;

let currentChapter = null;



// ==========================================
// GET CHAPTER ID
// ==========================================


const params =

new URLSearchParams(
    window.location.search
);



const chapterId =

params.get("chapterId");




// ==========================================
// HTML ELEMENTS
// ==========================================


const loadingBox =

document.getElementById(
    "loadingBox"
);



const courseContent =

document.getElementById(
    "courseContent"
);



const errorBox =

document.getElementById(
    "errorBox"
);



const errorText =

document.getElementById(
    "errorText"
);



const courseTitle =

document.getElementById(
    "courseTitle"
);



const courseDescription =

document.getElementById(
    "courseDescription"
);



const videosContainer =

document.getElementById(
    "videosContainer"
);



const filesContainer =

document.getElementById(
    "filesContainer"
);



const videosCount =

document.getElementById(
    "videosCount"
);



const filesCount =

document.getElementById(
    "filesCount"
);



const noVideos =

document.getElementById(
    "noVideos"
);



const noFiles =

document.getElementById(
    "noFiles"
);




// ==========================================
// START PAGE
// ==========================================


if(!chapterId){


    showError(
        "لم يتم تحديد الفصل المطلوب."
    );


}

else{


    checkAuth();


}





// ==========================================
// CHECK AUTH
// ==========================================


function checkAuth(){


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



            await loadStudent(
                user.uid
            );


        }

    );


}






// ==========================================
// LOAD STUDENT
// ==========================================


async function loadStudent(uid){


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


        showError(
            "بيانات الطالب غير موجودة."
        );


        return;


    }



    currentStudent =

    studentSnap.data();



    loadChapter();



}



catch(error){


    console.error(

        "Student Error:",

        error

    );


    showError(

        "حدث خطأ أثناء تحميل بيانات الطالب."

    );


}



}

// ==========================================
// LOAD CHAPTER FROM FIREBASE
// ==========================================


async function loadChapter(){


try{


    const chapterRef =

    doc(

        db,

        "chapters",

        chapterId

    );



    const chapterSnap =

    await getDoc(
        chapterRef
    );



    if(!chapterSnap.exists()){


        showError(

            "الفصل غير موجود."

        );


        return;


    }



    currentChapter = {


        id:

        chapterSnap.id,


        ...chapterSnap.data()


    };



    console.log(

        "Chapter Data:",

        currentChapter

    );



    // ============================
    // CHECK ACCESS
    // ============================


    const allowed =

    checkChapterAccess();



    if(!allowed){


        showError(

            "ليس لديك صلاحية دخول هذا الفصل."

        );


        return;


    }




    displayChapter();



    renderVideos();



    renderFiles();




    loadingBox.classList.add(

        "hidden"

    );



    courseContent.classList.remove(

        "hidden"

    );



}



catch(error){



    console.error(

        "Chapter Error:",

        error

    );



    showError(

        "حدث خطأ أثناء تحميل محتوى الفصل."

    );



}



}







// ==========================================
// CHECK CHAPTER ACCESS
// ==========================================


function checkChapterAccess(){



    if(!currentChapter){


        return false;


    }



    // لو الكورس مجاني

    if(

        currentChapter.isFree === true

    ){


        return true;


    }



    // لو السعر صفر

    if(

        Number(

            currentChapter.price || 0

        ) === 0

    ){


        return true;


    }




    const purchased =


    Array.isArray(

        currentStudent.purchasedCourses

    )


    ?


    currentStudent.purchasedCourses


    :


    [];





    return purchased.includes(

        currentChapter.courseId

    );



}







// ==========================================
// DISPLAY CHAPTER INFO
// ==========================================


function displayChapter(){



    if(courseTitle){



        courseTitle.textContent =


        currentChapter.title ||


        currentChapter.chapterName ||


        "محتوى الفصل";



    }





    if(courseDescription){



        courseDescription.textContent =


        currentChapter.description ||


        "شاهد محتوى الفصل والملفات الخاصة به";



    }



}

// ==========================================
// RENDER VIDEOS
// ==========================================


function renderVideos(){


    videosContainer.innerHTML = "";


    const videos =


    Array.isArray(

        currentChapter.videos

    )

    ?


    currentChapter.videos


    :


    [];





    videosCount.textContent =


    `${videos.length} فيديو متاح`;





    if(videos.length === 0){



        noVideos.classList.remove(

            "hidden"

        );


        return;


    }





    noVideos.classList.add(

        "hidden"

    );





    videos.forEach(

        (video,index)=>{



            const title =


            video.title ||


            video.videoTitle ||


            `الفيديو ${index + 1}`;





            const videoUrl =


            video.videoUrl ||


            video.url ||


            "";





            const youtubeUrl =


            video.youtubeUrl ||


            "";







            const card =

            document.createElement(

                "article"

            );



            card.className =

            "item-card";







            card.innerHTML = `


            <div class="item-number">

                <i class="fa-solid fa-play"></i>

                فيديو ${index + 1}

            </div>



            <h3 class="item-title">

                ${escapeHTML(title)}

            </h3>



            <button

            class="item-btn video-btn">


                <i class="fa-solid fa-circle-play"></i>


                تشغيل الفيديو


            </button>


            `;






            const button =

            card.querySelector(

                ".video-btn"

            );






            button.onclick = ()=>{


                if(

                    !videoUrl &&

                    !youtubeUrl

                ){


                    alert(

                        "رابط الفيديو غير موجود"

                    );


                    return;


                }




                sessionStorage.setItem(

                    "currentVideoUrl",

                    videoUrl

                );



                sessionStorage.setItem(

                    "currentYoutubeUrl",

                    youtubeUrl

                );



                sessionStorage.setItem(

                    "currentVideoTitle",

                    title

                );



                sessionStorage.setItem(

                    "currentCourseTitle",

                    currentChapter.title || ""

                );






                window.location.href =


                `course-details.html?chapterId=${chapterId}&videoIndex=${index}`;



            };





            videosContainer.appendChild(

                card

            );



        }

    );


}







// ==========================================
// RENDER PDF FILES
// ==========================================


function renderFiles(){



    filesContainer.innerHTML = "";



    const files =


    Array.isArray(

        currentChapter.pdfs

    )


    ?


    currentChapter.pdfs


    :


    [];





    filesCount.textContent =


    `${files.length} ملف متاح`;





    if(files.length === 0){



        noFiles.classList.remove(

            "hidden"

        );


        return;


    }




    noFiles.classList.add(

        "hidden"

    );






    files.forEach(

        (file,index)=>{



            const title =


            file.title ||


            file.pdfTitle ||


            `ملف ${index + 1}`;





            const url =


            file.pdfUrl ||


            file.url ||


            "";







            const card =

            document.createElement(

                "article"

            );



            card.className =

            "item-card";





            card.innerHTML = `


            <div class="item-number">


                <i class="fa-solid fa-file-pdf"></i>


                ملف ${index + 1}


            </div>



            <h3 class="item-title">

                ${escapeHTML(title)}

            </h3>



            <button class="item-btn file-btn">


                <i class="fa-solid fa-file-arrow-down"></i>


                فتح الملف


            </button>


            `;





            const button =

            card.querySelector(

                ".file-btn"

            );





            button.onclick = ()=>{



                if(!url){


                    alert(

                    "رابط الملف غير موجود"

                    );


                    return;


                }





                window.open(

                    url,

                    "_blank"

                );



            };





            filesContainer.appendChild(

                card

            );



        }

    );



}

// ==========================================
// SHOW ERROR
// ==========================================


function showError(message){



    if(loadingBox){


        loadingBox.classList.add(

            "hidden"

        );


    }





    if(courseContent){


        courseContent.classList.add(

            "hidden"

        );


    }





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







// ==========================================
// PAGE READY
// ==========================================


console.log(

    "Courses Chapter System Loaded"

);