 // Define dimensions
 const width = 1000;
 const height = 1000;
 const gridPadding = 50;  // Padding between grid cells
 var selectedUniversities = [];



 // Append SVG
 const svg = d3.select("#chart")
   .append("svg")
   .attr("width", width)
   .attr("height", height);

 const parallelCoordinatesWidth = 900;

 const parallelCoordinatesHeight = 500;

 var parallelCoordinatesSvg = d3.select("#parallel-coordinates");


 var data = [];

 // Load CSV data
 d3.csv("RankingsClean.csv").then(function (csvData) {
   data = csvData;
   const groupedData = d3.group(csvData, d => d.university_name);

   const uniqueUniversities = Array.from(groupedData, ([, universities]) => universities[0]);

   data = uniqueUniversities;

   const topN = +document.getElementById("topNSelector").value; // Get the selected top N value
   data.sort((a, b) => a.world_rank - b.world_rank);

   // Take the top N rows based on the sorted order
   const filteredData = data.slice(0, topN);

   drawChart(filteredData); // Call drawChart after loading the data


   const filteredData2 = data.slice(0, 10);
   drawParallelCoordinates(filteredData2);



   // const selectedUniversitieshtml = document.getElementById("selectedUniversities");
   //   const listItem = document.createElement("li");
   //  listItem.id = `descriptions`;

   // Create a span to hold the university name
   //  const universityNameSpan = document.createElement("span");
   //  universityNameSpan.textContent = 'Selected Universities:';
   //  listItem.appendChild(universityNameSpan);

   //  selectedUniversitieshtml.appendChild(listItem);


 });

// Function to add selected university to the list
function addSelectedUniversity(universityData, i) {
const selectedUniversitiesTable = document.getElementById("selectedUniversities");
const rowId = `selected_${universityData.university_name}`;

const row = selectedUniversitiesTable.insertRow();
row.id = rowId; // Set a unique identifier for the row

const cellName = row.insertCell(0);
cellName.textContent = universityData.university_name;

const cellActions = row.insertCell(1);
const deleteButton = document.createElement("button");
deleteButton.textContent = "Remove";
deleteButton.classList.add("bg-red-500", "text-white", "p-1", "ml-2");
deleteButton.addEventListener("click", function () {
 const dot = d3.select(`circle[data-id="${universityData.university_name}"]`);
 dot.classed("selected", false)
   .attr("fill", d => d3.rgb(10, 255 - i * 30, 255 - i * 20))
   .attr("data-id", null);

 removeSelectedUniversity(rowId); // Pass the row identifier

 // UpdateChartAndParallelCoordinates is now called outside the if block
 updateChartAndParallelCoordinates();
});

cellActions.appendChild(deleteButton);

selectedUniversities.push({ universityData, i, rowId });

updateChartAndParallelCoordinates();
}

// Function to remove selected university from the list
function removeSelectedUniversity(rowId) {
// Remove the universityData from the selectedUniversities array
selectedUniversities = selectedUniversities.filter(item => item.rowId !== rowId);

// Find the row corresponding to the rowId and remove it
const row = document.getElementById(rowId);
if (row) {
 row.remove(); // Remove the row
}
}

 // Function to check if a university is already selected
 function isUniversitySelected(universityData) {

   return selectedUniversities.some(item => item.universityData.university_name === universityData.university_name);
 }

 function handleDotClick(universityData, i) {
   const dot = d3.select(this);

   if (!isUniversitySelected(universityData)) {
     // Dot is not selected, mark it as selected
     dot.classed("selected", true)
       .attr("fill", "green")
       .attr("data-id", universityData.university_name); // Set a data-id attribute with the index i
     addSelectedUniversity(universityData, i);
   } else {
     // Dot is already selected, unselect it
     dot.classed("selected", false)
       .attr("fill", d => d3.rgb(10, 255 - i * 30, 255 - i * 20))
       .attr("data-id", null); // Remove the data-id attribute
       const selectedUniversity = selectedUniversities.find(item => item.universityData.university_name === universityData.university_name);
 if (selectedUniversity) {
   removeSelectedUniversity(selectedUniversity.rowId);
 }
   }
 }

// Function to show map in the tooltip
function showMapInTooltip(latitude, longitude, tooltip) {
const mapContainer = document.createElement("div");
mapContainer.id = "mapContainer";
mapContainer.style.margin = "20px";
mapContainer.style.width = "400px";
mapContainer.style.height = "200px";

tooltip.node().appendChild(mapContainer);

const map = L.map(mapContainer).setView([latitude, longitude], 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker([latitude, longitude]).addTo(map);
}

// Function to hide map in the tooltip
function hideMapInTooltip() {
const mapContainer = document.getElementById("mapContainer");
if (mapContainer) {
 mapContainer.remove();
}
}

 function drawChart(data) {
   // Define scales

   // Group data by country
   const groupedData = d3.group(data, d => d.country);

   // Create a grid layout for countries
   const countries = Array.from(groupedData.keys());
   const gridCols = 5;  // Number of columns in the grid
   const gridRows = Math.ceil(countries.length / gridCols);  // Calculate the number of rows

   // Calculate cell dimensions
   const cellWidth = (width - (gridCols - 1) * gridPadding) / gridCols;
   const cellHeight = 120;//(((height - (gridRows - 1) * gridPadding) )/ gridRows)+50;

   const group = svg.append("g")
     .attr("transform", "translate(" + (100) + "," + (-100) + ")")

   const numpitch = 40;
   const tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .attr("id", "tooltip");
   // Create array of objects with normalizedQuery and avgCount
   const datosa = Array.from(groupedData).map(([normalizedQuery, universities]) => ({
     normalizedQuery,
     universities: universities,
     avgCount: universities.length
   }));
   const datos = datosa.sort((a, b) => b.avgCount - a.avgCount);

   for (let i = 0; i < datos.length; i++) {
     const row = Math.floor(i / gridCols);
     const col = i % gridCols;

     const dots = group.append("g")
       .attr("transform", function () {
         return "translate(" + (numpitch + 120 * col) + "," + (cellHeight * row) + ")rotate(0)";
       });

      

     const balls = datos[i].avgCount;
     const brack = 10;
     const filas = balls / brack;
     const enteros = Math.ceil(balls / brack) - 1;
     const resto = (filas - enteros) * 10;

     if (resto >= 0) {
       for (let lev = 0; lev < enteros; lev++) {
         for (let k = 1; k <= brack; k++) {
           const universityData = datos[i].universities[brack * lev + k - 1];
           const isSelected = selectedUniversities.some(selected => selected.i === i);

           dots.append("circle")
             .attr("cx", k * 10)
             .attr("cy", 300 - lev * 10)
             .attr("r", 4)
             .attr("opacity", 1)
             .attr("fill", isSelected ? "green" : d3.rgb(10, 255 - i * 30, 255 - i * 20))
             .on("mousedown", function () {
               handleDotClick.call(this, universityData, i);
             })
             .on("mouseover", function () {
               const tooltipContent = `
               University: ${universityData.university_name}<br>
               Rank: ${universityData.world_rank}<br>
               Country: ${universityData.country}<br>
               Teaching: ${universityData.teaching}<br>
               International: ${universityData.international}<br>
             `;
               tooltip.html(tooltipContent)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY - 10) + "px")
                 .style("opacity", 1);

                 showMapInTooltip(universityData.latitude, universityData.longitude, tooltip);

             })
             .on("mouseout", function () {
               tooltip.style("opacity", 0);

               hideMapInTooltip();

             });
         }
       }

       for (let r = 1; r <= resto; r++) {
         const universityData = datos[i].universities[brack * enteros + r - 1];
         const isSelected = selectedUniversities.some(selected => selected.i === i);

         dots.append("circle")
           .attr("cx", r * 10)
           .attr("cy", 300 - (enteros) * 10)
           .attr("r", 4)
           .attr("opacity", 1)
           .attr("fill", isSelected ? "green" : d3.rgb(10, 255 - i * 30, 255 - i * 20))
           .on("mouseover", function () {

             const tooltipContent = `
               University: ${universityData.university_name}<br>
               Rank: ${universityData.world_rank}<br>
               Country: ${universityData.country}<br>
               Teaching: ${universityData.teaching}<br>
               International: ${universityData.international}<br>
             `;
             tooltip.html(tooltipContent)
               .style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 10) + "px")
               .style("opacity", 1);
           })
           .on("mousedown", function () {
             handleDotClick.call(this, universityData, i);
           })
           .on("mouseout", function () {
             tooltip.style("opacity", 0);
           });
       }
     }

     dots.append("text")
       .attr("x", 5)
       .attr("y", 320)
       .text(function (d) { return datos[i].avgCount; })
       .attr("font-family", "Gill Sans, sans-serif")
       .attr("font-size", 12)
       .attr("text-anchor", "start")
       .style("fill", "black")
       ;


       dots.append("foreignObject")
       .attr("x", 90)
       .attr("y", 325)
       .attr("width", 20)
       .attr("height", 15)
       .attr("class", "flag-container")
      .html(d => `<img class="flag" src="gif/${datos[i].universities[0]["country-iso"].toLowerCase()}.gif" alt="${datos[i].universities[0]["country-iso"]}"/>`);

     const text = dots.append("text")
       .attr("x", 5)
       .attr("y", 335)
       .attr("font-family", "Gill Sans, Century Gothic, sans-serif")
       .attr("font-size", 12)
       .attr("opacity", 1)
       .style("fill", "black");

     const nameWords = datos[i].normalizedQuery.toUpperCase().split(/\s+/);
     const lineHeight = 1.1;
     const dy = 12;

     text.selectAll("tspan")
       .data(nameWords)
       .enter().append("tspan")
       .attr("x", 5)
       .attr("dy", (d, i) => i ? lineHeight + dy : 0)
       .text(d => d);
   }


 }


 function drawParallelCoordinates(data) {
   function getUniversityDetailsHTML(d) {
     return `
   <strong>University:</strong> ${d.university_name}<br>

   <strong>Teaching:</strong> ${d.teaching}<br>
   <strong>International:</strong> ${d.international}<br>
   <strong>Research:</strong> ${d.research}<br>
   <strong>Citations:</strong> ${d.citations}<br>
   <strong>Income:</strong> ${d.income}<br>
   <strong>Total Score:</strong> ${d.total_score}<br>
   <strong>Rank:</strong> ${d.world_rank}<br>

 `;
   }
   // Extract the list of columns from the data
   // Extract the list of columns from the data
   let columns = ['teaching', 'international', 'research', 'citations', 'income', 'total_score'];

   // Get selected columns from checkboxes
   columns = columns.filter(column => {
     const checkbox = document.getElementById(`${column.toLowerCase()}Checkbox`);

     return checkbox && checkbox.checked;
   });


   data = data.filter(d => columns.every(column => !isNaN(+d[column])));

   

// Get minimum values for each column
const minValues = {};
columns.forEach(column => {
minValues[column] = d3.min(data, d => +d[column]);
});

// Get the global minimum value
const globalMinValue = d3.min(Object.values(minValues));




   parallelCoordinatesSvg = parallelCoordinatesSvg
     .append("svg")
     .attr("width", parallelCoordinatesWidth)
     .attr("height", parallelCoordinatesHeight);

   // Define margins
   const margin = { top: 30, right: 40, bottom: 40, left: 40 };
   const width = parallelCoordinatesWidth - margin.left - margin.right;
   const height = parallelCoordinatesHeight - margin.top - margin.bottom;

   const tooltip1 = d3.select("body").append("div")
     .attr("class", "tooltip")
     .attr("id", "tooltip1");
   // Define scales for parallel coordinates with margins
   const xScale = d3.scalePoint()
     .domain(columns)
     .range([0, width]);

   const yScale = {};

   columns.forEach(column => {
     yScale[column] = d3.scaleLinear()
       .domain([globalMinValue, 100])  // Set a fixed range from 0 to 100 for all columns
       .range([height, 0]);
   });
   const colorScale = d3.scaleSequential(d3.interpolateBlues)
 .domain([data.length, 1]); // Reverse the domain to make lower ranks more prominent

   parallelCoordinatesSvg.append("g")
     .attr("class", "axis-labels")
     .attr("transform", `translate(${margin.left}, ${margin.top - 10})`)
     .selectAll(".axis-label")
     .data(columns)
     .enter().append("text")
     .attr("class", "axis-label")
     .attr("x", d => xScale(d))
     .attr("y", 0)
     .attr("text-anchor", "middle")
     .text(d => d);



   // Add axes
   const parallelCoordinatesAxes = parallelCoordinatesSvg.append("g")
     .attr("class", "axes")
     .attr("transform", `translate(${margin.left}, ${margin.top})`)
     .selectAll(".axis")
     .data(columns)
     .enter().append("g")
     .attr("class", "axis")
     .attr("transform", d => `translate(${xScale(d)}, 0)`)
     .each(function (d) { d3.select(this).call(d3.axisLeft(yScale[d])); });
   const parallelCoordinatesLines = parallelCoordinatesSvg.append("g")
     .attr("transform", `translate(${margin.left}, ${margin.top})`)
     .selectAll(".line")
     .data(data)
     .enter().append("path")
     .attr("class", "line")
     .attr("d", d => d3.line()(columns.map(column => [xScale(column), yScale[column](d[column])])))
     .attr("fill", "none")
     .attr("stroke", (d, i) => colorScale(i + 1))
     .attr("stroke-width", 2)
     .on("mouseover", function (event, d) {
       // Show tooltip on mouseover
       tooltip1.html(getUniversityDetailsHTML(d))
         .style("left", (event.pageX + 10) + "px")
         .style("top", (event.pageY - 10) + "px")
         .style("opacity", 1);
         const initialColor = colorScale(data.indexOf(d)+ 1);

       d3.select(this).attr("stroke", "orange").attr("stroke-width", 4).attr("data-initial-color", initialColor);
;

     })
     .on("mouseout", function (event, d) {
       // Hide tooltip on mouseout
       const line = d3.select(this);
tooltip1.style("opacity", 0);
// Get the initial color based on the world rank
const initialColor = line.attr("data-initial-color");

       d3.select(this).attr("stroke", initialColor).attr("stroke-width", 2);

     })
     .on("mousemove", function (event, d) {
       // Update tooltip position on mousemove
       tooltip1.style("left", (event.pageX + 10) + "px")
         .style("top", (event.pageY - 10) + "px");
     });
 }



 function updateChart() {
   const topN = +document.getElementById("topNSelector").value;
   data.sort((a, b) => a.world_rank - b.world_rank);

   const filteredData = data.slice(0, topN);

   svg.selectAll("*").remove();
   parallelCoordinatesSvg.selectAll("*").remove();

   selectedUniversities.forEach(item => removeSelectedUniversity(item.universityData, item.i));

   drawChart(filteredData);

   //parallelCoordinatesSvg.selectAll("*").remove();
   const filteredData2 = data.slice(0, 10);
   drawParallelCoordinates(filteredData2);



 }


 function updateChartAndParallelCoordinates() {
   console.log();
   const topN = +document.getElementById("topNSelector").value;
   data.sort((a, b) => a.world_rank - b.world_rank);

   const filteredData = data.slice(0, topN);

   // svg.selectAll("*").remove();
   // parallelCoordinatesSvg.selectAll("*").remove();

   // drawChart(filteredData);
   // Inside updateChartAndParallelCoordinates function
   parallelCoordinatesSvg.selectAll("*").remove();

   if (selectedUniversities.length > 0) {
     const selectedData = selectedUniversities.map(item => item.universityData);
     drawParallelCoordinates(selectedData);
   } else {
     const filteredData2 = data.slice(0, 10);
   drawParallelCoordinates(filteredData2);
   }
 }