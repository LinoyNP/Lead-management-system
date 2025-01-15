document.addEventListener("DOMContentLoaded", () => {
    
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
        const response = await fetch("http://localhost:3000/leads");  // Server endpoint
        const leads = await response.json();
        console.log("Leads fetched from server:", leads);
        const leadsBody = document.getElementById("leadsBody");
        leadsBody.innerHTML = ""; // clean the table first

        leads.forEach(lead => {
            const row = document.createElement("tr");

            // rows with the leads data
            Object.entries(lead).forEach(([key, value]) => {
                // don't show the id
                if (key === "id") return;

                const cell = document.createElement("td");

                // format of the joinDate (handle invalid date)
                if (key === "joinDate") {
                    const date = new Date(value);
                    if (isNaN(date)) {
                        cell.textContent = "Invalid Date";  // if not valid, show an error message
                    } else {
                        const formattedDate = date.toISOString().split('T').join(' ').split('.')[0]; // year-month-day hour:min:sec
                        cell.textContent = formattedDate;
                    }
                } else {
                    cell.textContent = value;
                }

                cell.classList.add("editable");
                cell.ondblclick = () => makeEditable(cell, lead.phone, key);  // assuming 'phone' is the primary key

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

                    // // Check if the value is a valid date and format it
                    // if (key === "viewDate") {
                    //     const date = new Date(value);
                    //     if (isNaN(date)) {
                    //         cell.textContent = "Invalid Date";
                    //     } else {
                    //         const formattedDate = date.toISOString().split('T').join(' ').split('.')[0];
                    //         cell.textContent = formattedDate;
                    //     }
                    // } else {
                    //     cell.textContent = value;
                    // }

                    // row.appendChild(cell);

                    // Handle date formatting
                    if (key === "viewDate") {
                        const date = new Date(value);
                        const formattedDate = date.toISOString().split('T').join(' ').split('.')[0];
                        cell.textContent = formattedDate;
                    } else {
                        cell.textContent = value;
                    }

                    row.appendChild(cell);

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
            const newValue = input.value;
            cell.textContent = newValue;
            await updateLead(leadId, fieldName, newValue);
        };
        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        };
    }

    // Update Lead in the SQL database
    async function updateLead(id, field, value) {
        console.log(`Updating lead with ID: ${id}, field: ${field}, value: ${value}`);
        const response = await fetch(`http://localhost:3000/leads/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ field, value })
        });

        const result = await response.json();
        console.log("Update result:", result);
    }

    // Add new lead to the server
    async function addLead(newLead) {
        console.log("Sending new lead to server:", newLead);
        const response = await fetch("http://localhost:3000/leads", {
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

// function to show products
async function showProducts(leadPhone) {
    const response = await fetch(`http://localhost:3000/leads/${leadPhone}/products`);
    const products = await response.json();
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = "";  // clear the table before displaying new products

    products.forEach(product => {
        const row = document.createElement("tr");

        // Display only product name and formatted date, not the product ID or lead phone number
        const productNameCell = document.createElement("td");
        productNameCell.textContent = product.productName;  // Show product name
        row.appendChild(productNameCell);

        const dateCell = document.createElement("td");
        const date = new Date(product.viewDate);
        const formattedDate = date.toISOString().split('T').join(' ').split('.')[0]; // year-month-day hour:min:sec
        dateCell.textContent = formattedDate;  // Show formatted date
        row.appendChild(dateCell);

        productTableBody.appendChild(row);
    });
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


