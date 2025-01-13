document.addEventListener("DOMContentLoaded", () => {
    const productsPane = document.getElementById("productsPane");
    const closePaneButton = document.querySelector(".close-btn");
    const productTableBody = document.getElementById("productTableBody");

    // Close the products pane
    closePaneButton.addEventListener("click", () => {
        productsPane.classList.add("hidden");
    });

    // Function to fetch and display leads in the table
    async function fetchLeads() {
        try {
            const response = await fetch("http://localhost:3000/leads");
            if (!response.ok) throw new Error("Failed to fetch leads");
            const leads = await response.json();

            const leadsBody = document.getElementById("leadsBody");
            leadsBody.innerHTML = ""; // Clear existing rows

            leads.forEach(lead => {
                const row = document.createElement("tr");

                Object.entries(lead).forEach(([key, value]) => {
                    if (key === "id") return; // Skip the ID field

                    const cell = document.createElement("td");

                    if (key === "joinDate") {
                        const date = new Date(value);
                        cell.textContent = isNaN(date) ? "Invalid Date" : date.toISOString().split('T').join(' ').split('.')[0];
                    } else {
                        cell.textContent = value;
                    }

                    cell.classList.add("editable");
                    cell.ondblclick = () => makeEditable(cell, lead.phone, key);

                    row.appendChild(cell);
                });

                // Add the "Products" button
                const buttonCell = document.createElement("td");
                const button = document.createElement("button");
                button.textContent = "Products";
                button.addEventListener("click", () => showProducts(lead.phone));
                buttonCell.appendChild(button);
                row.appendChild(buttonCell);

                leadsBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error fetching leads:", error);
        }
    }

    // Function to fetch and display products for a specific lead
    async function showProducts(leadPhone) {
        try {
            const response = await fetch(`http://localhost:3000/leads/${leadPhone}/products`);
            if (!response.ok) throw new Error("Failed to fetch products");
            const products = await response.json();

            productTableBody.innerHTML = ""; // Clear previous products

            products.forEach(product => {
                const row = document.createElement("tr");

                const productNameCell = document.createElement("td");
                productNameCell.textContent = product.productName;
                row.appendChild(productNameCell);

                const dateCell = document.createElement("td");
                const date = new Date(product.viewDate);
                dateCell.textContent = isNaN(date) ? "Invalid Date" : date.toISOString().split('T').join(' ').split('.')[0];
                row.appendChild(dateCell);

                productTableBody.appendChild(row);
            });

            productsPane.classList.remove("hidden");
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }

    // Make a table cell editable
    function makeEditable(cell, leadPhone, fieldName) {
        const originalText = cell.textContent;
        cell.innerHTML = `<input type='text' value='${originalText}' />`;
        const input = cell.querySelector("input");
        input.focus();

        input.onblur = async () => {
            const newValue = input.value;
            cell.textContent = newValue;
            await updateLead(leadPhone, fieldName, newValue);
        };

        input.onkeypress = (e) => {
            if (e.key === "Enter") {
                input.blur();
            }
        };
    }

    // Update a lead field in the database
    async function updateLead(phone, field, value) {
        try {
            const response = await fetch(`http://localhost:3000/leads/${phone}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ field, value })
            });

            if (!response.ok) throw new Error("Failed to update lead");
            const result = await response.json();
            console.log("Lead updated:", result);
        } catch (error) {
            console.error("Error updating lead:", error);
        }
    }

    // Initial load of leads
    fetchLeads();
});
