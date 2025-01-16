
document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById('logoutButton');
    if (!logoutButton) return;

    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            // Perform the logout action by sending a POST request to the server
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify({ message: "Logout request" })
            });

            // Check if the response was successful
            if (response.ok) {
                // If logout is successful, redirect the user to the login page
                const data = await response.json();
                alert(data.message);

                window.history.pushState(null, null, window.location.href); // Prevent going back
                window.onpopstate = function () {
                    window.history.go(1);
                };
                window.location.replace('/login');

            } else {
                // Handle any errors returned by the server
                alert("There was an error logging you out. Please try again.");
            }
        } catch (error) {
            // Handle any network or other errors
            console.error('Logout failed:', error);
            alert('An error occurred while trying to log you out. Please try again later.');
        }
    });
});


