function closeForm() {
    document.getElementById('interestForm').reset();
    document.getElementById('interestForm').style.display = 'none';
}

function resetForm() {
    document.getElementById('successMessage').textContent = "";
}

function submitForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const country = document.getElementById('country').value.trim();
    const company = document.getElementById('company').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => error.textContent = "");

    // Full Name validation
    if (!fullName) {
        document.getElementById('fullNameError').textContent = "This field is required.";
        isValid = false;
    } else if (!/^[a-zA-Z\s]{1,20}$/.test(fullName)) {
        document.getElementById('fullNameError').textContent = "Must contain up to 20 letters only.";
        isValid = false;
    }

    // Phone validation
    if (!phone) {
        document.getElementById('phoneError').textContent = "This field is required.";
        isValid = false;
    } else if (!/^0\d{9}$/.test(phone)) {
        document.getElementById('phoneError').textContent = "Must be 10 digits starting with 0.";
        isValid = false;
    }

    // Email validation
    if (!email) {
        document.getElementById('emailError').textContent = "This field is required.";
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.includes('@gmail.com') || email.includes('@yahoo.com') || email.includes('@hotmail.com')) {
        document.getElementById('emailError').textContent = "Please enter a valid professional email (e.g., name@company.com).";
        isValid = false;
    }

    // Country validation
    if (country && !/^[a-zA-Z\s]{1,15}$/.test(country)) {
        document.getElementById('countryError').textContent = "Must contain up to 15 letters only.";
        isValid = false;
    }

    // Company validation
    if (company && !/^[a-zA-Z\s]{1,15}$/.test(company)) {
        document.getElementById('companyError').textContent = "Must contain up to 15 letters only.";
        isValid = false;
    }

    // Additional Info validation
    if (additionalInfo.length > 500) {
        document.getElementById('additionalInfoError').textContent = "Must be up to 500 characters.";
        isValid = false;
    }

    // If valid, display success message
    if (isValid) {
        submitValidForm().then(Massage => {
            document.getElementById('successMessage').textContent = Massage;
        });
        document.getElementById('interestForm').reset();
    }
}
function submitValidForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const source = document.getElementById('source').value.trim();
    const country = document.getElementById('country').value.trim();
    const company = document.getElementById('company').value.trim();
    const additionalInfo = document.getElementById('additionalInfo').value.trim();

    const formData = {
        fullName,
        phone,
        email,
        source,
        country,
        company,
        additionalInfo,
    };

    fetch('/submitForm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                //return "The form has been submitted successfully, we will contact you soon."
                document.getElementById('successMessage').textContent = "The form has been submitted successfully, we will contact you soon.";
                document.getElementById('successMessage').style.color = "green";
                document.getElementById('interestForm').reset();
            } else if (data.error) {
                if (data.error.includes("phone")) {
                    document.getElementById('successMessage').textContent = "This lead already exists in the system.(change phone number)";
                    document.getElementById('successMessage').style.color = "red";
                } else {
                    document.getElementById('successMessage').textContent = data.error;
                    document.getElementById('successMessage').style.color = "red";
            }
        }
    })
        .catch(error => {
            return "This lead already exists in the system."
        });
}