/*
-----Searching--------
*/
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


    // searchButton.addEventListener("click", () => {
    //     const searchValue = searchInput.value; // The value typed in the search field
    
    //     if (!searchValue) {
    //         alert("Please enter a search value.");
    //         return;
    //     }
    //     console.log(searchValue, selectedSearchBy);
    //     SearchingFromDB(searchValue, selectedSearchBy);
    // });
}

// document.addEventListener("DOMContentLoaded", () => 
//     {
    
async function inputFromEngineSearch(typeOfAction)
{
    const searchInput = document.getElementById("Search");
    const searchValue = searchInput.value; // The value typed in the search field
    // const radioButtonsSearchBY = document.querySelectorAll('input[name="radio-buttons-search"]');

    // let selectedSearchBy = "name"; //The default search is by name.
    
        if (!searchValue && typeOfAction=='button') {
            alert("Please enter a search value.");
            return;
        }
    // //"Search by" option
    // radioButtonsSearchBY.forEach((radio) => {
    //     radio.addEventListener("change", (event) => {
    //         selectedSearchBy = event.target.value;
    //       });
    // });

    //Sending a request to the server to obtain information from the DB
    try {
        const response = await fetch("http://localhost:3000/searchBy", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            //Search by criteria the user selected in "Search by" and by the value the user entered in the search engine
            body: JSON.stringify({ selectedSearchBy, searchValue }), 
        });

        if (!response.ok) {
            console.error('Server returned an error:', response.status);
            return;
        }
        // getting data from server
        const data = await response.json();
        console.log('Data received:', data); 
        const resultsList = document.getElementById("results");
        resultsList.innerHTML = ""; // נקה את הרשימה הקודמת

        data.forEach(item => {
            const resultItem = document.createElement("li");
            resultItem.textContent = item.name;    
            resultItem.onclick = () => { 
                searchInput.value = item.name; // Selecting the value by clicking
                resultsList.innerHTML = ""; 
            };
            resultsList.appendChild(resultItem);
        });
        if(typeOfAction == 'button')
            searchInput.value = '';
            searchInput.placeholder = "Search by Name";
            resultsList.innerHTML = "";
            showLeadsSearchBy(data); // present data in table
    } catch (error) {
        console.error('Error occurred:', error);
    }
    
}

// func that show leads in table by "search by"
async function showLeadsSearchBy(leads) {

    const leadsBody = document.getElementById("leadsBody");
    // if(!leads || leads.length == 0){
    //     //TODO messege - empty
    //     return;
    // }
    
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
            const productModal = document.getElementById("productsPane");
            const closeModal = document.querySelector(".close-btn");
            const productTableBody = document.getElementById("productTableBody");
            
            // Close product window
            closeModal.addEventListener("click", () => {
                productModal.style.display = "none";
            });
            productModal.style.display = "block";
            showProducts(lead.phone);  // pass the lead's phone number to fetch the products
        });
        buttonCell.appendChild(button);
        row.appendChild(buttonCell); // Add the button cell to the row
        console.log("Row is:", row);
        leadsBody.appendChild(row);
    });
}
// });

function showResultWhenSearching(){
    const query = document.getElementById('Search').value;

    if (query.length > 0) {
        fetch(`http://localhost:3000/searchBy?query=${query}`)
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
function Sort(event){
    // Open the "sorting" menu
    event.stopPropagation();
    const panel = document.getElementById("panel-sorting");
    const sortButton = document.getElementById("openSorting");
   
    const buttonRect = sortButton.getBoundingClientRect();
    panel.style.left = `${buttonRect.left + window.scrollX}px`;
    
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
    } 
    else {
        panel.classList.add("open");
    }
}

function togglePanel(event, button) {
    event.stopPropagation(); // מונע התפשטות האירוע
    
    // סוגר את כל הפאנלים האחרים
    const allPanels = document.querySelectorAll('.sorting-options');
    allPanels.forEach((panel) => {
        panel.classList.remove('open');
    });

    // מוצא את הפאנל הרלוונטי לכפתור שנלחץ
    const panel = button.nextElementSibling; // הפאנל הוא האלמנט הבא אחרי הכפתור
    if (panel && panel.classList.contains('sorting-options')) {
        panel.classList.toggle('open'); // פותח/סוגר את הפאנל
    }
}

// מאזין לסגירת כל הפאנלים בלחיצה מחוץ
document.addEventListener('click', () => {
    const allPanels = document.querySelectorAll('.sorting-options');
    allPanels.forEach((panel) => {
        panel.classList.remove('open');
    });
});


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