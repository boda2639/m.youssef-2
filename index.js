// ==========================================
// IMPORT NAVBAR
// ==========================================

async function loadNavbar() {

    try {

        const response = await fetch("navbar.html");

        const html = await response.text();

        document.getElementById("navbarContainer").innerHTML = html;

        const css = document.createElement("link");

        css.rel = "stylesheet";

        css.href = "navbar.css";

        document.head.appendChild(css);

        const script = document.createElement("script");

        script.src = "navbar.js";

        script.type = "module";

        document.body.appendChild(script);

    } catch (err) {

        console.error(err);

    }

}

loadNavbar();


// ==========================================
// COUNTER
// ==========================================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const counter = entry.target;

        const target = Number(counter.dataset.target);

        let value = 0;

        const speed = target / 120;

        function updateCounter() {

            value += speed;

            if (value < target) {

                counter.innerText = Math.floor(value);

                requestAnimationFrame(updateCounter);

            } else {

                counter.innerText = target.toLocaleString();

            }

        }

        updateCounter();

        counterObserver.unobserve(counter);

    });

}, {

    threshold: .4

});

counters.forEach(counter => {

    counterObserver.observe(counter);

});


// ==========================================
// SCROLL REVEAL
// ==========================================

const reveals = document.querySelectorAll(

".feature-card,.course-card,.review-card,.teacher-container,.stat-card,.cta-box"

);

const revealObserver = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";

}

});

},{

threshold:.15

});

reveals.forEach(el=>{

el.style.opacity="0";

el.style.transform="translateY(60px)";

el.style.transition=".8s";

revealObserver.observe(el);

});
// ==========================================
// FAQ ACCORDION
// ==========================================

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const btn = item.querySelector(".faq-question");

    btn.addEventListener("click", () => {

        faqItems.forEach(box => {

            if (box !== item) {

                box.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

// ==========================================
// HERO PARALLAX
// ==========================================

const hero = document.querySelector(".hero");

const physicsScene = document.querySelector(".physics-scene");

window.addEventListener("mousemove", (e) => {

    if (!physicsScene) return;

    const x = (window.innerWidth / 2 - e.clientX) / 40;

    const y = (window.innerHeight / 2 - e.clientY) / 40;

    physicsScene.style.transform =
        `rotateY(${x}deg) rotateX(${-y}deg)`;

});

// ==========================================
// FLOATING EFFECT
// ==========================================

const floating = document.querySelectorAll(

".formula,.physics-icon"

);

floating.forEach((item,index)=>{

item.style.animationDelay=`${index*.4}s`;

});

// ==========================================
// SMOOTH SCROLL
// ==========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

const target=document.querySelector(this.getAttribute("href"));

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

// ==========================================
// ACTIVE SECTION
// ==========================================

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-150;

if(scrollY>=top){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#" + current){

link.classList.add("active");

}

});

});

// ==========================================
// BACK TO TOP
// ==========================================

const topBtn=document.createElement("button");

topBtn.className="backToTop";

topBtn.innerHTML='<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

topBtn.classList.add("show");

}else{

topBtn.classList.remove("show");

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

// ==========================================
// PROGRESS BAR
// ==========================================

const progress=document.createElement("div");

progress.className="scroll-progress";

document.body.appendChild(progress);

window.addEventListener("scroll",()=>{

const total=document.documentElement.scrollHeight-window.innerHeight;

const percent=(window.scrollY/total)*100;

progress.style.width=percent+"%";

});

// ==========================================
// RANDOM FLOATING
// ==========================================

setInterval(()=>{

floating.forEach(item=>{

const x=(Math.random()*8)-4;

const y=(Math.random()*8)-4;

item.style.transform=`translate(${x}px,${y}px)`;

});

},2500);

// ==========================================
// BUTTON RIPPLE EFFECT
// ==========================================

document.querySelectorAll(".primary-btn").forEach(btn=>{

btn.addEventListener("click",function(e){

const circle=document.createElement("span");

const d=Math.max(this.clientWidth,this.clientHeight);

circle.style.width=d+"px";

circle.style.height=d+"px";

circle.style.left=e.offsetX-d/2+"px";

circle.style.top=e.offsetY-d/2+"px";

circle.classList.add("ripple");

this.appendChild(circle);

setTimeout(()=>{

circle.remove();

},600);

});

});
// ==========================================
// LOADING SCREEN
// ==========================================

window.addEventListener("load", () => {

    const loader = document.querySelector(".loader");

    if (loader) {

        loader.style.opacity = "0";

        loader.style.pointerEvents = "none";

        setTimeout(() => {

            loader.remove();

        }, 600);

    }

});

// ==========================================
// TYPE WRITER
// ==========================================

const heroTitle = document.querySelector(".hero h1");

if (heroTitle) {

    heroTitle.style.opacity = "1";

}

// ==========================================
// LAZY IMAGES
// ==========================================

const lazyImages = document.querySelectorAll("img[data-src]");

const lazyObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const img = entry.target;

        img.src = img.dataset.src;

        img.removeAttribute("data-src");

        lazyObserver.unobserve(img);

    });

});

lazyImages.forEach(img => {

    lazyObserver.observe(img);

});

// ==========================================
// GLOW FOLLOW MOUSE
// ==========================================

const glow = document.createElement("div");

glow.className = "mouse-glow";

document.body.appendChild(glow);

window.addEventListener("mousemove", e => {

    glow.style.left = e.clientX + "px";

    glow.style.top = e.clientY + "px";

});

// ==========================================
// RANDOM FLOATING CARDS
// ==========================================

document.querySelectorAll(".feature-card,.course-card").forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-12px) scale(1.03)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "";

    });

});

// ==========================================
// NAVBAR SHADOW
// ==========================================

const navbar = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (!navbar) return;

    if (window.scrollY > 50) {

        navbar.classList.add("navbar-scroll");

    } else {

        navbar.classList.remove("navbar-scroll");

    }

});

// ==========================================
// BUTTON HOVER SOUND (OPTIONAL)
// ==========================================

// const audio = new Audio("hover.mp3");

// document.querySelectorAll("button,a").forEach(btn=>{

// btn.addEventListener("mouseenter",()=>{

// audio.currentTime=0;

// audio.play();

// });

// });

// ==========================================
// SIMPLE TOAST
// ==========================================

function showToast(message) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 500);

    }, 3000);

}

// مثال

// showToast("أهلاً بك في منصة محمد يوسف");

// ==========================================
// PREVENT DOUBLE CLICK
// ==========================================

document.querySelectorAll(".primary-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        btn.style.pointerEvents = "none";

        setTimeout(() => {

            btn.style.pointerEvents = "auto";

        }, 1200);

    });

});

// ==========================================
// YEAR
// ==========================================

const year = document.querySelector(".currentYear");

if (year) {

    year.textContent = new Date().getFullYear();

}

// ==========================================
// END
// ==========================================

console.log(

"%cM.YOUSSEF PLATFORM",

"color:#ff7a00;font-size:22px;font-weight:bold;"

);

console.log(

"%cDeveloped Successfully",

"color:#00bfff;font-size:15px;"

);