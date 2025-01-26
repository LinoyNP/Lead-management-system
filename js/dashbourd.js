document.addEventListener("DOMContentLoaded", () => {
    const agentEmail = localStorage.getItem('userEmail');
    // console.log(agentEmail);
    const dchartContainer = document.getElementById("chart-container");
    const pieChart = document.getElementById("pieChart");
    const barChartCtx = document.getElementById("barChart");
    barChartCtx.innerText= '';
    let NewStatus = 0;
    let InProcessStatus = 0;
    let ClosedStatus = 0;
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(leadStatusPai);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    async function leadStatusPai(){
        pieChart.innerText= '';
        try {
            const response = await fetch(`http://localhost:3000/peiGraph?email=${agentEmail}`, {
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
            // console.log('Data received:', dataFromQuery);
            if (dataFromQuery.length != 3 ) {
                console.log("error- An array of 3 values ​​was not received.")
            }
            NewStatus = dataFromQuery[0];
            InProcessStatus = dataFromQuery[1];
            ClosedStatus = dataFromQuery[2];
        } catch (error) {
            console.error('Error occurred:', error);
        }
        var data = new google.visualization.DataTable();
        console.log(typeof(Number(NewStatus)));
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([ ['New', Number(NewStatus)],
            ['InProcess', Number(InProcessStatus)],
            ['Closed', Number(ClosedStatus)]
          ]);
        
        // Set chart options
        var options = {'title':'Segmentation of leads by status',
            'width':pieChart.width,
            'height':pieChart.height,
            slices: {
                0: { color: '#FF0000' }, // NewStatus -red
                1: { color: '#FFFF00' }, // InProcessStatus - yellow
                2: { color: '#008000' }  // ClosedStatus- green
              }
        };
        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.PieChart(pieChart);
        chart.draw(data, options);
    }

    async function SalesPerformance(){
        let dataFromQuery = NaN;
        try {
            const response = await fetch("http://localhost:3000/barGraphSalesPerformance", {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Server returned an error:', response.status);
                return;
            }

            dataFromQuery = await response.json();
            console.log(dataFromQuery);
            console.log('Data received:', dataFromQuery);
            if(!dataFromQuery){
                barChartCtx.innerText = "No agents for showing"; 
                barChartCtx.style.color = "red";
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }
        
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Agent');
        data.addColumn('number', 'Number of closed leads');
        dataFromQuery.forEach(agent => {
            data.addRow([agent.agent_name, Number(agent.lead_count)]);
            console.log(`Agent: ${agent.agent_name}, Lead Count: ${agent.lead_count}`);
          });

        const options = {
            title: 'Sales performance per agent',
            'width':pieChart.width,
            'height':pieChart.height,
            hAxis: { title: 'Agents'  },
            vAxis: { title: 'Number of closed leads', viewWindow: { min: 0 , max: 15}, viewWindowMode: 'explicit',  format: '0' },
            focusTarget: 'category',
            legend: 'none',
        };
        const chart = new google.visualization.ColumnChart(barChartCtx);
        chart.draw(data, options);
    }

    SalesPerformance();
    
});  