// Function to validate password
function validatePassword(password) {
    const passwordErrors = [];
  
    // Check minimum 8 characters
    if (password.length < 8) {
      passwordErrors.push("Password must be at least 8 characters long.");
    }
  
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("Password must contain at least one uppercase letter (A-Z).");
    }
  
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("Password must contain at least one lowercase letter (a-z).");
    }
  
    // Check for at least one digit
    if (!/\d/.test(password)) {
      passwordErrors.push("Password must contain at least one digit (0-9).");
    }
  
    return passwordErrors;
  }
  
  // Function to validate email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Handle sign up form submission
  document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    let errorMessage = "";
  
    // Validate password
    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      errorMessage += passwordValidationErrors.join("<br>");
    }
  
    // Validate email
    if (!validateEmail(email)) {
      errorMessage += "<br>Please enter a valid email address.";
    }
  
    // Show errors if any
    if (errorMessage) {
      document.getElementById('signup-error').innerHTML = errorMessage;
      return;
    }
  
    // Simulate sending email verification
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('email-verification').style.display = 'block';
  
    // Simulate sending an email and waiting for user verification
    setTimeout(() => {
      alert('Verification email sent! Check your inbox to activate your account.');
    }, 1000);
  });
  