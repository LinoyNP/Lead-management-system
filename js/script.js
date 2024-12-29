function filteringSearchBy(){
    // Open the "Filter by" menu
    const panel = document.getElementById("panel-SearchingBY");
    
    if (panel.classList.contains("open")) {
        panel.classList.remove("open");
    } 
    else {
        panel.classList.add("open");
    }
}

function Sort(){
     // Open the "sorting" menu
     const panel = document.getElementById("panel-sorting");
    
     if (panel.classList.contains("open")) {
         panel.classList.remove("open");
     } 
     else {
         panel.classList.add("open");
     }
}