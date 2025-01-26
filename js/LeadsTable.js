document.addEventListener("DOMContentLoaded", () => {
    const email = localStorage.getItem('userEmail');
    const productsPane = document.getElementById("productsPane");
    const closePaneButton = document.querySelector(".close-btn");
    const productTableBody = document.getElementById("productTableBody");

    // Close the products pane when the close button is clicked
    closePaneButton.addEventListener("click", closeProductPane);

    function closeProductPane() {
        productsPane.style.display = "none";   // Hide the products pane
    }

    // func to add leads to the table
    async function fetchLeads() {
        const response = await fetch(`http://localhost:3000/leads?email=${email}`);  // Server endpoint
        const leads = await response.json();
        console.log("Leads fetched from server:", leads);
        const leadsBody = document.getElementById("leadsBody");
        leadsBody.innerHTML = ""; // clean the table first

        // Sort leads by joinDate in descending order
        leads.sort((a, b) => new Date(b.joindate) - new Date(a.joindate)); 

        leads.forEach(lead => {
            const row = document.createElement("tr");

             // First add NAME, then PHONE, then the other fields
            const nameCell = document.createElement("td");
            nameCell.textContent = lead.name;
            nameCell.classList.add("editable");
            nameCell.ondblclick = () => makeEditable(nameCell, lead.phone, "name");
            row.appendChild(nameCell);

            const phoneCell = document.createElement("td");
            phoneCell.textContent = lead.phone;
            phoneCell.classList.add("editable");
            phoneCell.ondblclick = () => makeEditable(phoneCell, lead.phone, "phone");
            row.appendChild(phoneCell);

            // rows with the rest of leads data
            Object.entries(lead).forEach(([key, value]) => {
                // don't show the id
                if (key === "id" || key === "additional_info" || key === "name" || key === "phone") return;

                const cell = document.createElement("td");

                // format of the joinDate (handle invalid date)
                if (key === "joindate") {
                    const date = new Date(value);
                    if (isNaN(date)) {
                        cell.textContent = "Invalid Date";  // if not valid, show an error message
                    } else {
                        const formattedDate = DateFormat(date) // year-month-day hour:min:sec
                        cell.textContent = formattedDate;
                    }
                } else {
                    cell.textContent = value;
                }

                cell.classList.add("editable");
                cell.ondblclick = () => makeEditable(cell, lead.phone, key);  // 'phone' is the primary key

                row.appendChild(cell);
            });

            // Create the "Products" button column right after the "agent" column
            const buttonCell = document.createElement("td");  // New cell for the button
            const button = document.createElement("button");
            button.textContent = "Products";
            button.addEventListener("click", () => {
                productsPane.style.display = "block";
                showProducts(lead.phone);  // pass the lead's phone number to fetch the products
            });
            buttonCell.appendChild(button);
            row.appendChild(buttonCell); // Add the button cell to the row

            leadsBody.appendChild(row);
        });

        // Add styling to status cells after table population
        styleStatusCells();
    }

    // Show products for a given lead, this functiom is global because it has use in other files
    window.showProducts  = async function (leadPhone) {
        try {
            const response = await fetch(`http://localhost:3000/leads/${leadPhone}/products`);
            const products = await response.json();
            console.log("Products fetched from server:", products);

            const productTable = document.getElementById("productTable");
            const productTableBody = document.getElementById("productTableBody");
            productTableBody.innerHTML = "";  // clear previous products

            products.forEach(product => {
                const row = document.createElement("tr");

                // Add product data to the row
                Object.entries(product).forEach(([key, value]) => {
                    const cell = document.createElement("td");
                    // Handle date formatting
                    console.log(key);
                    if (key === "viewdate") {
                        const dateCell = document.createElement("td");
                        const formattedDate = DateFormat(product.viewdate); // Show formatted date
                        dateCell.textContent = formattedDate;
                        row.appendChild(dateCell);
                    } else {
                        cell.textContent = value;
                        row.appendChild(cell);
                    }
                    

                });

                productTableBody.appendChild(row);
            });

            productsPane.style.display = "block";  // Show the products pane

        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // Edit fields in the table
    function makeEditable(cell, leadId, fieldName) {
        const originalText = cell.textContent;
        cell.innerHTML = `<input type='text' value='${originalText}' />`;
        const input = cell.querySelector("input");
        input.focus();
    
        input.onblur = async () => {
            let newValue = input.value.trim();
    
            // if (fieldName === "status") {
            //     newValue = capitalizeFirstLetter(newValue);
    
            //     if (newValue!="New" && newValue!="In Progress" && newValue!="Closed") {
            //         alert("Invalid status. You can only enter: 'New', 'In Progress', 'Closed'.");
            //         cell.textContent = originalText;
            //         return;
            //     }
            // }

            // if (fieldName === "source") {
            //     newValue = capitalizeFirstLetter(newValue);
    
            //     if (newValue!="Advertising" && newValue!="Recommendation" && newValue!="Social Media" && newValue!="Website" && newValue!="Phone Call") {
            //         alert("Invalid sorce. You can only enter: 'Advertising', 'Recommendation', 'Social Media' , 'Website' Or 'Phone Call' .");
            //         cell.textContent = originalText;
            //         return;
            //     }
            // }

            // if (fieldName === "name" || fieldName === "phone" || fieldName === "email") {
    
            //     if (newValue === null) {
            //         alert("Invalid input. Not Null filed.");
            //         cell.textContent = originalText;
            //         return;
            //     }
            // }

            // if (fieldName === "location" || fieldName === "company") {
            //     newValue = capitalizeFirstLetter(newValue);
            // }

            // if (fieldName === "agent") {
            //     if (newValue === "") {newValue = null;}
            //     if (newValue != null){
            //         const agentExists = await checkAgentExists(newValue);
            //         if (!agentExists ) {
            //             alert("The agent does not exist in the system.");
            //             return;
            //         }
            //     }
            // }
    
            cell.textContent = newValue;
            await updateLead(leadId, fieldName, newValue);
            if (fieldName === "status") {
                updateStatusColor(cell, newValue);
            }
        };
    
        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        };
    
        function capitalizeFirstLetter(text) {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        }
    }

    // Update Lead in the SQL database
    async function updateLead(id, field, value) {
        console.log(`Updating lead with ID: ${id}, field: ${field}, value: ${value}`);
        const response = await fetch(`http://localhost:3000/leads/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fieldName: field, newValue: value})
        });

        const result = await response.json();
        console.log("Update result:", result);
    }

    // Add new lead to the server
    async function addLead(newLead) {
        console.log("Sending new lead to server:", newLead);
        const response = await fetch(`http://localhost:3000/leads?email=${email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newLead)
        });

        if (!response.ok) {
            throw new Error(`Failed to add lead: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Lead add result:", result);
    }

    // loading leads
    fetchLeads(); 
});


// // ask the server if the agent exsist
// async function checkAgentExists(agentName) {
//     try {
//         const response = await fetch(`http://localhost:3000/check-agent?agentName=${agentName}`);
//         const data = await response.json();
//         return data.exists;
//     } catch (error) {
//         console.error("Error checking agent:", error);
//         return false;
//     }
// }


// Function to format date
function DateFormat(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // year-month-day hour:min:sec
}


// JavaScript for toggling and pane control
function toggleLeadsView(button) {
    const leadsTable = document.getElementById("leadsTable");
    const newLeadsTable = document.getElementById("newLeadsTable");
    if (button.textContent === "New Leads") {
        button.textContent = "My Leads";
        leadsTable.classList.add("hidden");
        newLeadsTable.classList.remove("hidden");
    } else {
        button.textContent = "New Leads";
        leadsTable.classList.remove("hidden");
        newLeadsTable.classList.add("hidden");
    }
}

// Function to style the status cells
function styleStatusCells() {
    const rows = document.querySelectorAll("#leadsBody tr");

    rows.forEach(row => {
        // const statusCell = row.querySelector(".status"); // Select the status column
        const statusCell = row.querySelector("td:nth-child(6)"); // Assuming status is in the 3rd column (adjust as needed)
        if (statusCell) {
            const statusText = statusCell.textContent.trim();

            if (statusText === "New") {
                statusCell.classList.add("new");
            } else if (statusText === "In Process") {
                statusCell.classList.add("in-process");
            } else if (statusText === "Closed") {
                statusCell.classList.add("closed");
            }
        }
    });
}

// Function to update the style of the status cells
function updateStatusColor(cell, statusText) {
    cell.classList.remove("new", "in-process", "closed");

    if (statusText === "New") {
        cell.classList.add("new");
    } else if (statusText === "In Process") {
        cell.classList.add("in-process");
    } else if (statusText === "Closed") {
        cell.classList.add("closed");
    }
}