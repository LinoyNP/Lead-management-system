/*
-----Searching--------
*/
const agentEmail = localStorage.getItem('userEmail');

function filteringSearchBy(){
    // Open the "Filter by" menu
    const button = document.getElementById("openSearchingBY");
    const panel = document.getElementById("panel-SearchingBY");
    const buttonRect = button.getBoundingClientRect();
    panel.style.left = `${buttonRect.left + window.scrollX}px`;
    
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
    } 
    else {
        panel.classList.add("open");
    }
}

//Listener of "search by" option
const radioButtonsSearchBY = document.querySelectorAll('input[name="radio-buttons-search"]');
let selectedSearchBy = "name"; //The default search is by name.
radioButtonsSearchBY.forEach((radio) => {
    radio.addEventListener("change", (event) => {
        selectedSearchBy = event.target.value;
        });
});

function ListenersForSearchAndFiltering(){
    // this function changes the description in the search engine according to the "Search by" selection.
    const searchInput = document.getElementById("Search");
    // const radioButtonsSearchBY = document.querySelectorAll('input[name="radio-buttons-search"]');
    const searchButton = document.getElementById("submitSearching");
    const panel = document.getElementById("panel-SearchingBY");

    // let selectedSearchBy = "name"; //The default search is by name.
    
    radioButtonsSearchBY.forEach((radio) => {
        radio.addEventListener("change", (event) => {
            selectedSearchBy = event.target.value;
            switch (selectedSearchBy) {
                case "productName":
                    searchInput.placeholder = "Search by Product";
                    break;
                case "email":
                    searchInput.placeholder = "Search by Email";
                    break;
                case "location":
                    searchInput.placeholder = "Search by Location";
                    break;
                case "company":
                    searchInput.placeholder = "Search by Company";
                    break;
                default:
                    searchInput.placeholder = "Search by Name";
            }
            setTimeout(() => {
            panel.classList.remove("open");
            radio.checked = false;//After the selection is saved in selectedSearchBy reset the selection in the menu
            }, 250);
        });
    });

}

// document.addEventListener("DOMContentLoaded", () => 
//     {
    
async function inputFromEngineSearch(typeOfAction)
{
    const textContentMyOrNewLeads = document.getElementById("toggle-leads-btn");
    const searchInput = document.getElementById("Search");
    const searchValue = searchInput.value; // The value typed in the search field
    const noResultsMessage = document.getElementById("noResultsMessage");
    const resultsList = document.getElementById("results");
    noResultsMessage.style.display = "none";    
    
    if (!searchValue && typeOfAction=='button') {
        noResultsMessage.textContent = "No leads found, please enter a search value."; 
        noResultsMessage.style.display = 'block'; 
        return;
    }

    if ((searchValue.length > 21 && selectedSearchBy=='name') || (searchValue.length > 15 && (selectedSearchBy=='productName' || selectedSearchBy=='company'))){
        noResultsMessage.textContent = " No leads found for this search.";
        noResultsMessage.style.display = 'block';
        resultsList.innerHTML = ''; 
        searchInput.value = '';
        return; 
    }
    
    let response;
    try {
        //If the caption on the button is "New Leads," it means you are currently on the "My Leads" page.
        if (textContentMyOrNewLeads.textContent === "New Leads") {
            //Sending a request to the server to obtain information from the DB
            response = await fetch(`/searchBy`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                //Search by criteria the user selected in "Search by" and by the value the user entered in the search engine
                body: JSON.stringify({ selectedSearchBy, searchValue, agentEmail }), 
            });
        }
        
        else{
            //Sending a request to the server to obtain information from the DB
            response = await fetch(`/searchByForNewLeads`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                //Search by criteria the user selected in "Search by" and by the value the user entered in the search engine
                body: JSON.stringify({ selectedSearchBy, searchValue }), 
            });
        }
    
        if (!response.ok) {
            console.error('Server returned an error:', response.status);
            return;
        }
        // getting data from server
        const data = await response.json();
        leadsData = data[0]; //Result leads by criterion
        dataOfCriterion = data[1]; //Results - the criterion themselfs
        
        resultsList.innerHTML = ""; 
        //Show options when typing in a search engine
        dataOfCriterion.forEach(item => {
            const fieldName = selectedSearchBy.toLowerCase(); 
            const resultItem = document.createElement("li");
            resultItem.textContent = item[fieldName];    
            resultItem.onclick = () => { 
                searchInput.value = item[fieldName];; // Selecting the value by clicking
                resultsList.innerHTML = ""; 
            };
            resultsList.appendChild(resultItem);
        });
        if(typeOfAction == 'button'){
            if (leadsData.length === 0){
                noResultsMessage.textContent = " No leads found for this search.";
                noResultsMessage.style.display = "block";
            }
            
            searchInput.value = '';
            searchInput.placeholder = "Search by Name";
            resultsList.innerHTML = "";
            
            
            showLeadsSearchBy(leadsData); // present data in table
        }
            
    } catch (error) {
        console.error('Error occurred:', error);
    }
    
}

// func that show leads in table by "search by"
async function showLeadsSearchBy(leads) {
    const productsPane = document.getElementById("productsPane");
    const closePaneButton = document.querySelector(".close-btn");

    // Close the products pane when the close button is clicked
    closePaneButton.addEventListener("click", closeProductPane);

    function closeProductPane() {
        productsPane.style.display = "none";   // Hide the products pane
    }
    const leadsBody = document.getElementById("leadsBody");
    // if(!leads || leads.length == 0){
    //     //TODO messege - empty
    //     return;
    // }
    
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
    styleStatusCells();

}
// });

function showResultWhenSearching(){
    const query = document.getElementById('Search').value;

    if (query.length > 0) {
        fetch(`/searchBy?query=${query}?email=${agentEmail}`)
            .then(response => response.json())
            .then(data => {
                const results = document.getElementById('results');
                results.innerHTML = '';
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item.name;
                    results.appendChild(li);
                });
            });
    } else {
        document.getElementById('results').innerHTML = '';
    }
}

/*
-----Sorting--------
*/
document.addEventListener('DOMContentLoaded', function () {
    const sortButton = document.getElementById('openSorting');
    const panel = document.getElementById('panel-sorting');
    //const SubcategoryButton = document.getElementById('JoiningDate-btn');

    if (sortButton) {
        sortButton.addEventListener('click', function (event) {
            event.stopPropagation();

           // open panel sort
            if (panel.classList.contains('open')) {
                panel.classList.remove('open');
                Sort();
                clearAllCheckboxes();
            // close open sort and receiving data from the server
            } else {
                panel.classList.add('open');
            }
        });
    }
});

// A dictionary that will contain the selected values
const selectedValues = {};

// Attach listeners once when the page loads
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.checkboxs-sorting').forEach(categoryDiv => {
        const categoryLabel = categoryDiv.querySelector('label').getAttribute('for'); 
        selectedValues[categoryLabel] = [];

        categoryDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const value = this.value;

                if (this.checked) {
                    // Add selected value
                    if (!selectedValues[categoryLabel].includes(value)) {
                        selectedValues[categoryLabel].push(value);
                    }
                } else {
                    // Remove deselected value
                    selectedValues[categoryLabel] = selectedValues[categoryLabel].filter(item => item !== value);
                }

                console.log("Selected values:", selectedValues);
            });
        });
    });
});

function clearAllCheckboxes() {
    document.querySelectorAll('.checkboxs-sorting input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Clear selected values as well
    for (const key in selectedValues) {
        selectedValues[key] = [];
    }
    const allPanels = document.querySelectorAll('.sorting-options');
    allPanels.forEach((panel) => {
        panel.classList.remove('open');
    });
}

async function Sort(){
        if (Object.keys(selectedValues).length === 0)
        {
            return;
        }
        // ---Connecting to the server and receiving information about the leads that match the filter---
        const noResultsMessage = document.getElementById("noResultsMessage");
        noResultsMessage.style.display = "none";
        try{
            //Sending a request to the server to obtain information from the DB
            response = await fetch(`/sortingBy`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                //Search by criteria the user selected in "Search by" and by the value the user entered in the search engine
                body: JSON.stringify({ selectedValues, agentEmail }), 
            });
            if (!response.ok) {
                console.error('Server returned an error:', response.status);
                return;
            }
            
            // getting data from server
            const leadsData = await response.json();
            console.log("leadsData" , leadsData);
            if (leadsData.length === 0 || leadsData[0] === null){
                
                noResultsMessage.textContent = " No leads found for this search.";
                noResultsMessage.style.display = "block";
                const leadsBody = document.getElementById("leadsBody");
                leadsBody.innerHTML = ""; // clean the table first
                return;
            }

            // present data in table
            showLeadsSearchBy(leadsData); 
        }catch (error) {
            console.error('Error occurred:', error);
        }
    
}

function togglePanel(event, button) {
    // ---Opening and closing the Filter by panel---
    event.preventDefault();
    event.stopPropagation(); 
    
    // const allPanels = document.querySelectorAll('.sorting-options');
    // allPanels.forEach((panel) => {
    //     panel.classList.remove('open');
    // });

    // const panel = button.nextElementSibling; 
    // if (panel && panel.classList.contains('sorting-options')) {
    //     panel.classList.toggle('open'); 
    // }
    const panel = button.nextElementSibling;

    // בדיקה האם הפאנל כבר פתוח לפני הסרה
    const isPanelOpen = panel.classList.contains('open');

    // סגירת כל הפאנלים האחרים
    document.querySelectorAll('.sorting-options.open').forEach(openPanel => {
        openPanel.classList.remove('open');
    });

    // פתיחה/סגירה של הפאנל הנוכחי בהתאם למצבו
    if (!isPanelOpen) {
        panel.classList.add('open');
    }
}


// document.addEventListener('click', () => {
//     const allPanels = document.querySelectorAll('.sorting-options');
//     allPanels.forEach((panel) => {
//         panel.classList.remove('open');
//     });
// });


// function toggleStatus(event) {
//     event.stopPropagation();
//     const panel = document.getElementById("sorting-options");
//     const statusButton = document.getElementById("sorting-btn");
//     const buttonRect = statusButton.getBoundingClientRect();
//     // panel.style.left = `${buttonRect.left + window.scrollX}px`;

//     if (panel.classList.contains("open")) {
//         panel.classList.remove("open");
//     } 
//     else {
//         panel.classList.add("open");
//     }
    

//     // document.addEventListener("click", (event) => {
//     //     const dropdown = document.getElementById("status-options");
//     //     if (!event.target.closest(".checkboxs-status")) {
//     //         dropdown.classList.remove("open");
//     //     }
//     // });
// }