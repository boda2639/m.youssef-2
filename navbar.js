/*=========================================
            Navbar JS
=========================================*/

const menuBtn = document.getElementById("menuBtn");

const closeMenu = document.getElementById("closeMenu");

const mobileMenu = document.getElementById("mobileMenu");

const overlay = document.getElementById("overlay");


/*=========================================
        Open Menu
=========================================*/

menuBtn.addEventListener("click",()=>{

    mobileMenu.classList.add("active");

    overlay.classList.add("active");

    document.body.style.overflow="hidden";

});


/*=========================================
        Close Menu
=========================================*/

function closeMobileMenu(){

    mobileMenu.classList.remove("active");

    overlay.classList.remove("active");

    document.body.style.overflow="auto";

}

closeMenu.addEventListener("click",closeMobileMenu);

overlay.addEventListener("click",closeMobileMenu);


/*=========================================
        ESC Close
=========================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeMobileMenu();

    }

});


/*=========================================
        Active Link
=========================================*/

const currentPage=window.location.pathname.split("/").pop();

document.querySelectorAll(".nav-links a").forEach(link=>{

    if(link.getAttribute("href")===currentPage){

        link.classList.add("active");

    }

});

document.querySelectorAll(".mobile-menu a").forEach(link=>{

    if(link.getAttribute("href")===currentPage){

        link.classList.add("active");

    }

});


/*=========================================
        Header Scroll
=========================================*/

const header=document.querySelector("header");

window.addEventListener("scroll",()=>{

    if(window.scrollY>30){

        header.classList.add("scrolled");

    }else{

        header.classList.remove("scrolled");

    }

});


/*=========================================
        Search
=========================================*/

const searchInput=document.getElementById("searchInput");

const searchBtn=document.getElementById("searchBtn");

function startSearch(){

    const value=searchInput.value.trim();

    if(value==="") return;

    window.location.href=`courses.html?search=${encodeURIComponent(value)}`;

}

searchBtn.addEventListener("click",startSearch);

searchInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        startSearch();

    }

});
/*=========================================
        Close Menu On Link Click
=========================================*/

document.querySelectorAll(".mobile-menu a").forEach(link=>{

    link.addEventListener("click",()=>{

        closeMobileMenu();

    });

});


/*=========================================
        Logo Animation
=========================================*/

const logo=document.querySelector(".logo");

logo.addEventListener("mouseenter",()=>{

    logo.style.transform="scale(1.05)";

});

logo.addEventListener("mouseleave",()=>{

    logo.style.transform="scale(1)";

});


/*=========================================
        Search Focus
=========================================*/

if(searchInput){

searchInput.addEventListener("focus",()=>{

searchInput.parentElement.style.boxShadow="0 0 15px rgba(255,140,0,.35)";

});

searchInput.addEventListener("blur",()=>{

searchInput.parentElement.style.boxShadow="none";

});

}


/*=========================================
        Navbar Shadow
=========================================*/

window.addEventListener("scroll",()=>{

const navbar=document.querySelector(".navbar");

if(window.scrollY>80){

navbar.style.boxShadow="0 15px 35px rgba(0,0,0,.55)";

}else{

navbar.style.boxShadow="0 10px 25px rgba(0,0,0,.35)";

}

});


/*=========================================
        Prevent Empty Search
=========================================*/

if(searchBtn){

searchBtn.addEventListener("click",()=>{

if(searchInput.value.trim()===""){

searchInput.focus();

}

});

}


/*=========================================
        Console
=========================================*/

console.log("================================");

console.log(" M.YOUSSEF Navbar Loaded ");

console.log(" Responsive Ready ");

console.log(" Mobile Menu Ready ");

console.log(" Search Ready ");

console.log("================================");
