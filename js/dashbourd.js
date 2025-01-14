document.addEventListener("DOMContentLoaded", () => {
    const dashboardBtn = document.getElementById("dashboardBtn");

    const pieChartCtx = document.getElementById("pieChart").getContext("2d");
    const barChartCtx = document.getElementById("barChart").getContext("2d");

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    async function leadStatusPai(){
        try {
            const response = await fetch("http://localhost:3000/   ", {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Server returned an error:', response.status);
                return;
            }

            const dataFromQuery = await response.json();
            console.log('Data received:', dataFromQuery); 
        } catch (error) {
            console.error('Error occurred:', error);
        }
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([])
    }
    
    
    
    
    
    
    
    
    
    
    
    // Data for Pie Chart
    const leadStatusData = {
        labels: ["New", "In Process", "Closed"],
        datasets: [
            {
                label: "Lead Status",
                data: [50, 30, 20], // Replace with dynamic data
                backgroundColor: ["#ff0000", "#ffd700", "#008000"],
            },
        ],
    };

    // Render Pie Chart
    const pieChart = new Chart(pieChartCtx, {
        type: "pie",
        data: leadStatusData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    });

    // Display status details
    const statusDetails = document.getElementById("statusDetails");
    leadStatusData.labels.forEach((label, index) => {
        const percentage = leadStatusData.datasets[0].data[index];
        const totalLeads = leadStatusData.datasets[0].data.reduce((a, b) => a + b, 0);
        const count = leadStatusData.datasets[0].data[index];
        const listItem = document.createElement("li");
        listItem.textContent = `${label} - ${(percentage / totalLeads * 100).toFixed(1)}% (${count} leads)`;
        statusDetails.appendChild(listItem);
    });

    // Data for Bar Chart
    const salesPerformanceData = {
        labels: ["Alice", "Bob", "Charlie"], // Replace with dynamic data
        datasets: [
            {
                label: "Leads Closed",
                data: [10, 15, 20], // Replace with dynamic data
                backgroundColor: "#0078d7",
            },
        ],
    };

    // Render Bar Chart
    const barChart = new Chart(barChartCtx, {
        type: "bar",
        data: salesPerformanceData,
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Sales Representatives",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Leads Closed",
                    },
                },
            },
        },
    });

    // Refresh data on button click
    dashboardBtn.addEventListener("click", () => {
        pieChart.update();
        barChart.update();
        alert("Dashboard data has been refreshed!");
    });
});
