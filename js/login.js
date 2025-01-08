// script.js
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login");
    const resetPasswordForm = document.getElementById("reset-password");
    const setNewPasswordForm = document.getElementById("set-new-password");
    const forgotPasswordLink = document.getElementById("forgot-password");

    const loginContainer = document.getElementById("login-form");
    const resetContainer = document.getElementById("reset-password-form");
    const setNewPasswordContainer = document.getElementById("set-new-password-form");

    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const resetEmailError = document.getElementById("reset-email-error");
    const newPasswordError = document.getElementById("new-password-error");

    forgotPasswordLink.addEventListener("click", () => {
        loginContainer.classList.add("hidden");
        resetContainer.classList.remove("hidden");
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!validateEmail(email)) {
            emailError.textContent = "This email is not registered. Please check your email or sign up for an account.";
            emailError.style.display = "block";
        } else {
            emailError.style.display = "none";
        }

        if (!validatePassword(password)) {
            passwordError.textContent = "The password you entered is incorrect. Please try again.";
            passwordError.style.display = "block";
        } else {
            passwordError.style.display = "none";
        }
    });

    resetPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const resetEmail = document.getElementById("reset-email").value;

        if (!validateEmail(resetEmail)) {
            resetEmailError.textContent = "This email is not registered. Please check your email or sign up for an account.";
            resetEmailError.style.display = "block";
        } else {
            resetEmailError.style.display = "none";
            alert("A password reset link has been sent to your email address.");
        }
    });

    setNewPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            newPasswordError.textContent = "Passwords do not match. Please try again.";
            newPasswordError.style.display = "block";
        } else {
            newPasswordError.style.display = "none";
            alert("Password successfully set! Please log in again.");
            setNewPasswordContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        }
    });

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
        return passwordRegex.test(password);
    }
});
