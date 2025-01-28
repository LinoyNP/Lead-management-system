// Function to validate password
function validatePassword(password) {
  const passwordErrors = [];
  if (password.length < 8) passwordErrors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) passwordErrors.push("Password must contain at least one uppercase letter (A-Z).");
  if (!/[a-z]/.test(password)) passwordErrors.push("Password must contain at least one lowercase letter (a-z).");
  if (!/\d/.test(password)) passwordErrors.push("Password must contain at least one digit (0-9).");
  return passwordErrors;
}

// Function to validate email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate Initial_password
async function validateInitialPassword(InitialPassword) {
    try {
      const response = await fetch('http://localhost:3000/verify-initialPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ InitialPassword }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify initial password.');
      }
  
      return true;
    } catch (error) {
      console.error('Error verifying initial password:', error.message);
      return false;
    }
  }

async function handleRegistration(event) {
    event.preventDefault();

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const InitialPassword = document.getElementById('Initial_password').value;


    // Validate inputs
    let errorMessage = "";
    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) errorMessage += passwordValidationErrors.join("<br>");
    if (!validateEmail(email)) errorMessage += "<br>Please enter a valid email address.";
    const isInitialPasswordValid = await validateInitialPassword(InitialPassword);
    if (!isInitialPasswordValid) errorMessage += "<br>Invalid initial password.";

    if (errorMessage) {
        document.getElementById('signup-error').innerHTML = errorMessage;
        return;
    }

    try {
        // Register the user
        const registerResponse = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password }),
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            // Display specific error message from server
            document.getElementById('signup-error').innerHTML = registerData.error || 'An error occurred during registration.';
            return;
        }

        alert('Registration successful! Verification email sent.');
        document.getElementById('signup-form').reset(); // Reset form
        document.getElementById('signup-error').innerHTML = ''; // Clear error messages
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Attach event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('signup-form').addEventListener('submit', handleRegistration);
  });
