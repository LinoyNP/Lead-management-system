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

// Function to handle registration and email
async function handleRegistration(event) {
  event.preventDefault();

  const fullName = document.getElementById('full-name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate inputs
  let errorMessage = "";
  const passwordValidationErrors = validatePassword(password);
  if (passwordValidationErrors.length > 0) errorMessage += passwordValidationErrors.join("<br>");
  if (!validateEmail(email)) errorMessage += "<br>Please enter a valid email address.";

  if (errorMessage) {
      document.getElementById('signup-error').innerHTML = errorMessage;
      return;
  }

  try {
      // Register the user
      const registerResponse = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password }),
      });

      if (!registerResponse.ok) {
          throw new Error('Registration failed');
      }

      // Send verification email
      const emailResponse = await fetch('http://localhost:3000/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              email,
              subject: 'Welcome to Our Platform',
              message: `${fullName}`, 
          }),
      });

      /*if (!emailResponse.ok) {
          alert('Registration successful, but failed to send email.');
      } else {
          alert('Registration successful! Verification email sent.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
  }*/
      const emailData = await emailResponse.json();

      // Check the message from the server
      if (emailData.message === 'Email sent successfully') {
          alert('Registration successful! Verification email sent.');
      } else {
          alert('Registration successful, but failed to send email.');
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
  }

}

// Attach event listener
document.getElementById('signup-form').addEventListener('submit', handleRegistration);
