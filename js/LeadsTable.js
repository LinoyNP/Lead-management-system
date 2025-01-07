//Manager the table of leads

document.addEventListener("DOMContentLoaded", () => {
    const productModal = document.getElementById("productModal");
    const closeModal = document.querySelector(".close");
    const productTableBody = document.getElementById("productTableBody");

    // Close product window
    closeModal.addEventListener("click", () => {
        productModal.style.display = "none";
    });

    // func to add leads to the table
    async function fetchLeads() {
        const response = await fetch("http://localhost:3000/leads");
        const leads = await response.json();
        const leadsBody = document.getElementById("leadsBody");
        leadsBody.innerHTML = ""; // clean the table first

        leads.forEach(lead => {
            const row = document.createElement("tr");

            // rows wuth the leads data
            Object.entries(lead).forEach(([key, value]) => {
                // dont show the id
                if (key === "_id") return;

                const cell = document.createElement("td");

                // format of the joinDate
                if (key === "joinDate") {
                    const date = new Date(value);
                    const formattedDate = date.toISOString().split('T').join(' ').split('.')[0]; // year-month-day hour:min:sec
                    cell.textContent = formattedDate;
                } else {
                    cell.textContent = value;
                }

                // in the prodect column make bottom product
                if (key === "products") {
                    const button = document.createElement("button");
                    button.textContent = "products";
                    button.addEventListener("click", () => {
                        // clicking the button opens the products window
                        productModal.style.display = "block";
                        showProducts(lead.products);
                    });
                    cell.appendChild(button);
                } else {
                    cell.classList.add("editable");
                    cell.ondblclick = () => makeEditable(cell, lead._id, key);
                }

                row.appendChild(cell);
            });

            leadsBody.appendChild(row);
        });
    }

    //show Products the lead watched
    function showProducts(products) {
        productTableBody.innerHTML = "";
        products.forEach(product => {
            const row = document.createElement("tr");
            const productCell = document.createElement("td");
            const dateCell = document.createElement("td");

            productCell.textContent = product.name;
            dateCell.textContent = product.date;

            row.appendChild(productCell);
            row.appendChild(dateCell);
            productTableBody.appendChild(row);
        });
    }

    // Edit fileds
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

    // update Lead
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

    /*/ Add new lead by User input
    document.getElementById("addLeadForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const newLead = {
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            location: document.getElementById("location").value,
            company: document.getElementById("company").value,
            status: document.getElementById("status").value,
            joinDate: new Date(),
            source: document.getElementById("source").value,
            agent: document.getElementById("agent").value,
            products: []
        };

        console.log("Sending new lead:", newLead);

        try {
            await addLead(newLead);
            alert("Lead added successfully!");
            await fetchLeads();
            this.reset();
        } catch (err) {
            alert("Failed to add lead. Check console for details.");
            console.error(err);
        }
    });*/

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

    //loading leads
    fetchLeads();
});
