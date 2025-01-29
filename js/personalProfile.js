
document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.getElementById("profileForm");

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();


        // Collecting form data
        const fullName = document.getElementById("fullName").value;
        const phoneNumber = document.getElementById("phoneNumber").value;
        const city = document.getElementById("city").value;
        const street = document.getElementById("street").value;
        const houseNumber = document.getElementById("houseNumber").value;

        // Variables to store error status
        let isValid = true;

        // Full name validation
        const fullNameError = document.getElementById("fullNameError");
        if (fullName.length > 20) {
            fullNameError.textContent = "Full name must be up to 20 characters.";
            isValid = false;
        } else {
            fullNameError.textContent = "";
        }

        // Phone number validation 
        const phoneNumberError = document.getElementById("phoneNumberError");
        const phonePattern = /^0\d{9}$/;
        if (!phonePattern.test(phoneNumber)) {
            phoneNumberError.textContent = "Phone number must be 10 digits and start with 0.";
            isValid = false;
        } else {
            phoneNumberError.textContent = "";
        }

        // City validation
        const cityError = document.getElementById("cityError");
        if (!city) {
            cityError.textContent = "City is required.";
            isValid = false;
        } else {
            cityError.textContent = "";
        }

        // Street validation
        const streetError = document.getElementById("streetError");
        if (!street) {
            streetError.textContent = "Street is required.";
            isValid = false;
        } else {
            streetError.textContent = "";
        }

        // House number validation
        const houseNumberError = document.getElementById("houseNumberError");
        if (!houseNumber || isNaN(houseNumber)) {
            houseNumberError.textContent = "House number must be a number.";
            isValid = false;
        } else {
            houseNumberError.textContent = "";
        }

        // If there are errors, do not submit the data
        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    phoneNumber,
                    city,
                    street,
                    houseNumber
                })
            });

            const data = await response.json();

            const successMessage = document.getElementById("successMessage");
            if (response.ok) {
                successMessage.textContent = "Profile updated successfully!";
                successMessage.classList.add("success");
                successMessage.classList.remove("error");
                setTimeout(() => {
                    window.location.href = "/home";
                }, 4000);
            } else {
                successMessage.textContent = "There was an error updating your profile.";
                successMessage.classList.add("error");
                successMessage.classList.remove("success");
            }
            // Message will disappear after 3 seconds
            setTimeout(() => {
                successMessage.textContent = "";  
            }, 3000);

        } catch (error) {
            const successMessage = document.getElementById("successMessage");
            if (successMessage) {
                successMessage.textContent = "There was an error updating your profile.";
                successMessage.classList.add("error");
                successMessage.classList.remove("success");
                console.error("Error:", error);
            }
        }

    });

});
