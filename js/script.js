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


function ListenersForSearchAndFiltering(){
    // this function changes the description in the search engine according to the "Search by" selection.
    const searchInput = document.getElementById("Search");
    const radioButtonsSearchBY = document.querySelectorAll('input[name="radio-buttons-search"]');
    const searchButton = document.getElementById("submitSearching");
    const panel = document.getElementById("panel-SearchingBY");

    let selectedSearchBy = "name"; //The default search is by name.
    
    radioButtonsSearchBY.forEach((radio) => {
        radio.addEventListener("change", (event) => {
            selectedSearchBy = event.target.value;
            switch (selectedSearchBy) {
                case "Product":
                    searchInput.placeholder = "Search by Product";
                    break;
                case "Email":
                    searchInput.placeholder = "Search by Email";
                    break;
                case "Location":
                    searchInput.placeholder = "Search by Location";
                    break;
                case "Company":
                    searchInput.placeholder = "Search by Company";
                    break;
                default:
                    searchInput.placeholder = "Search by Name";
            }
            setTimeout(() => {
            panel.classList.remove("open");
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

function inputFromEngineSearch(){
    const searchInput = document.getElementById("Search");
    const searchValue = searchInput.value; // The value typed in the search field
    const radioButtonsSearchBY = document.querySelectorAll('input[name="radio-buttons-search"]');

        if (!searchValue) {
            alert("Please enter a search value.");
            return;
        }
        
        radioButtonsSearchBY.forEach((radio) => {
            radio.addEventListener("change", (event) => {
                selectedSearchBy = event.target.value;
                SearchingFromDB(searchValue);
        });
    });
}

function SearchingFromDB(content, searchKind){
    prompt(`your search is: ${content} by kind: ${searchKind}`);
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