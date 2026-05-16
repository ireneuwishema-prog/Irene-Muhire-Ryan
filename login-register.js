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
        if (switchText) switchText.innerHTML =
            'I don\'t have an account? <a href="register.html">Register</a>';
        if (nameLabel) nameLabel.innerText = "Full Name";

        if (langLabel) langLabel.innerText = "Language";
        if (emailLabel) emailLabel.innerText = "Email";
        if (passwordLabel) passwordLabel.innerText = "Password";
    }
}