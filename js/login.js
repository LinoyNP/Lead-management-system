
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // ניקוי הודעות שגיאה קיימות
        document.getElementById('email-error').textContent = "";
        document.getElementById('password-error').textContent = "";

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // ולידציה בסיסית
        if (!email || !password) {
            if (!email) {
                document.getElementById('email-error').textContent = "Please enter your email.";
            }
            if (!password) {
                document.getElementById('password-error').textContent = "Please enter your password.";
            }
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful!');
                window.location.href = '/home'; // מעבר לעמוד הבית
            } else {
                // טיפול בשגיאות מצד השרת
                if (data.error && data.error.toLowerCase().includes('email')) {
                    document.getElementById('email-error').textContent = data.error;
                    return;
                } else if (data.error && data.error.toLowerCase().includes('password')) {
                    document.getElementById('password-error').textContent = data.error;
                    return;
                } else {
                    alert(data.error || 'An unknown error occurred.');
                    return;
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while connecting to the server. Please try again later.');
        }
    });
});
