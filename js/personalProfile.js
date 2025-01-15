document.getElementById('profileForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let isValid = true;

    // Reset error messages
    document.querySelectorAll('.error-message').forEach(function(errorMessage) {
        errorMessage.textContent = '';
    });

    // Validate full name
    const fullName = document.getElementById('fullName').value;
    if (fullName.length > 20) {
        document.getElementById('fullNameError').textContent = 'Full name must include up to 20 characters only.';
        isValid = false;
    }

    // Validate phone number
    const phoneNumber = document.getElementById('phoneNumber').value;
    const phonePattern = /^0[0-9]{9}$/;
    if (!phonePattern.test(phoneNumber)) {
        document.getElementById('phoneNumberError').textContent = 'Phone number must include 10 digits and start with 0.';
        isValid = false;
    }

    // Validate city (auto-complete from list)
    const city = document.getElementById('city').value;
    const validCities = ['Tel Aviv', 'Haifa', 'Jerusalem', 'Beersheba'];
    if (!validCities.includes(city)) {
        document.getElementById('cityError').textContent = 'City must be selected from the auto-complete list or typed manually.';
        isValid = false;
    }

    // Validate street
    const street = document.getElementById('street').value;
    if (!street) {
        document.getElementById('streetError').textContent = 'Street must be entered.';
        isValid = false;
    }

    // Validate house number
    const houseNumber = document.getElementById('houseNumber').value;
    if (isNaN(houseNumber) || houseNumber <= 0) {
        document.getElementById('houseNumberError').textContent = 'House number must include digits only.';
        isValid = false;
    }

    if (isValid) {
        document.getElementById('successMessage').textContent = 'Your details have been updated successfully.';
        setTimeout(() =>{
            window.location.href = '/home' ; // Redirect to homepage after success
        }, 2000);
    }
});

