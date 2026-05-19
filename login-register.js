// Function to change language
function changeLanguage(lang) {
    const title = document.getElementById("title");
    const langLabel = document.getElementById("langLabel");
    const emailLabel = document.getElementById("emailLabel");
    const passwordLabel = document.getElementById("passwordLabel");
    const button = document.getElementById("mainButton");
    const switchText = document.getElementById("switchText");
    const nameLabel = document.getElementById("nameLabel");

    // French
    if (lang === "fr") {
        if (title.innerText.includes("Login")) {
            title.innerText = "Connexion";
            button.innerText = "Connexion";
            switchText.innerHTML =
                'Je n’ai pas de compte <a href="register.html">S’inscrire</a>';
        } else {
            title.innerText = "Inscription";
            button.innerText = "S’inscrire";
            switchText.innerHTML =
                'J’ai déjà un compte <a href="login.html">Connexion</a>';
            if (nameLabel) nameLabel.innerText = "Nom complet";
        }

        langLabel.innerText = "Langue";
        emailLabel.innerText = "E-mail";
        passwordLabel.innerText = "Mot de passe";
    }

    // Kinyarwanda
    else if (lang === "rw") {
        if (title.innerText.includes("Login")) {
            title.innerText = "Injira";
            button.innerText = "Injira";
            switchText.innerHTML =
                'Nta konti mfite <a href="register.html">Iyandikishe</a>';
        } else {
            title.innerText = "Iyandikishe";
            button.innerText = "Iyandikishe";
            switchText.innerHTML =
                'Mfite konti <a href="login.html">Injira</a>';
            if (nameLabel) nameLabel.innerText = "Amazina";
        }

        langLabel.innerText = "Ururimi";
        emailLabel.innerText = "Imeyili";
        passwordLabel.innerText = "Ijambo banga";
    }

    // English
    else {
        if (title) title.innerText = "Login Form";
        if (button) button.innerText = "Login";
        if (switchText)
            switchText.innerHTML =
                'I don\'t have an account? <a href="register.html">Register</a>';
        if (nameLabel) nameLabel.innerText = "Full Name";

        if (langLabel) langLabel.innerText = "Language";
        if (emailLabel) emailLabel.innerText = "Email";
        if (passwordLabel) passwordLabel.innerText = "Password";
    }
}

// Basic role navigation
// - Regular login button goes to course.html (no auth implemented in this project)
// - Admin login button goes to admin.html
function handleLoginClick() {
    const email = document.getElementById("emailInput")?.value?.trim();
    const password = document.getElementById("passwordInput")?.value?.trim();

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    // This project uses a simple localStorage flag (see course.js)
    localStorage.setItem("loggedIn", "true");
    window.location.href = "./course.html";
}

function handleRegisterClick() {
    const name = document.getElementById("nameInput")?.value?.trim();
    const email = document.getElementById("emailInput")?.value?.trim();
    const password = document.getElementById("passwordInput")?.value?.trim();

    if (!name || !email || !password) {
        alert("Please fill in all required fields.");
        return;
    }

    // Demo behavior: immediately consider the user logged in (no backend/auth).
    localStorage.setItem("loggedIn", "true");
    window.location.href = "./course.html";
}


