// // Prevent going back to the previous page after logging out
// if (window.history && window.history.pushState) {
//     window.history.pushState(null, null, window.location.href);
//     window.onpopstate = function () {
//       window.history.go(1); // Prevents going back to the previous page
//     };
//   }
  
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    // Prevent going back after logging out
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        alert('You cannot go back. Please log in again.');
        window.history.go(1);
    };

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clearing existing error messages
        document.getElementById('email-error').textContent = "";
        document.getElementById('password-error').textContent = "";

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        // Basic validation
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
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('userEmail', email); //Saving the email in local storage
                window.location.href = '/home'; // go to the home page
            } else {
                // Handling server-side errors
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
