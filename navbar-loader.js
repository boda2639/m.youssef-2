async function loadNavbar() {

    const container = document.getElementById("navbarContainer");

    if (!container) return;

    const response = await fetch("navbar.html");

    const html = await response.text();

    container.innerHTML = html;

    // تحميل CSS مرة واحدة
    if (!document.getElementById("navbar-style")) {

        const css = document.createElement("link");

        css.id = "navbar-style";

        css.rel = "stylesheet";

        css.href = "navbar.css";

        document.head.appendChild(css);

    }

    // تحميل JS مرة واحدة
    if (!document.getElementById("navbar-script")) {

        const script = document.createElement("script");

        script.type = "module";

        script.src = "navbar.js";

        script.id = "navbar-script";

        document.body.appendChild(script);

    }

}

loadNavbar();
