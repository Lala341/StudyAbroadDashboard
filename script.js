// Set dimensions and margins for the map
const widthMap = 1400;
const heightMap = 700;

// Append the svgMap object to the map container
const svgMap = d3.select("#map-container")
  .append("svg")
  .attr("width", widthMap)
  .attr("height", heightMap);

// Map and projection
const projection = d3.geoMercator()
  .center([-15, 55]) // Centered on Europe
  .scale(700) // Adjusted scale for Europe
  .translate([widthMap / 2, heightMap / 2]);


// Create a div for the tooltip and hide it initially
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute") // Important for correct positioning
  .style("font-size", "14px")
  .style("color", "#000")
  .style("background-color", "white")
  .style("padding", "5px")
  .style("border", "1px solid #000")
  .style("border-radius", "5px")
  .style("pointer-events", "none") // Make sure it doesn't interfere with other mouse events
  .style("opacity", 0) // Start it off invisible
  .style("transition", "opacity 0.2s"); // Smooth transition for the tooltip


// Set dimensions and position for the color bar
const colorBarwidthMap = 20; // widthMap of the color bar
const colorBarheightMap = 300; // heightMap of the color bar
const colorBarMargin = { top: 200, right: 60, bottom: 40, left: 40 }; // Margins for the color bar
const numStops = 10; // Number of stops in the gradient, you can increase this for a smoother gradient

// Create a color bar svgMap container
const colorBarsvgMap = d3.select("#map-container").append("svg")
  .attr("width", colorBarwidthMap + colorBarMargin.left + colorBarMargin.right)
  .attr("height", colorBarheightMap + colorBarMargin.top + colorBarMargin.bottom)
  .style("position", "absolute")
  .style("right", "0px") // This will align it to the right edge of the map-container
  .style("top", `${colorBarMargin.top}px`)
  .append("g")
  .attr("transform", "translate(" + colorBarMargin.left + "," + colorBarMargin.top + ")");




// Load external data and boot
d3.json("filtered_countries.geojson").then(function(data){
  // Draw the map
  const countries = svgMap.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath().projection(projection))
      // set the initial color of each country
      .attr("fill", "#cccccc")
      .attr("id", d => d.properties.ISO_A3)

  // Load mobility data
  d3.csv("Cleaned_Mobility.csv").then(function(mobilityData) {
    // Extract unique "From" countries for the dropdown
    const fromCountries = Array.from(new Set(mobilityData.map(d => d.From_Country)));
    fromCountries.sort(); // Sort alphabetically

    const maxStudentValue = d3.max(mobilityData, d => {
      return d.Value ? +d.Value : 0; // Convert to number and handle undefined
    });

    // Define a color scale for representing student numbers
    const colorScale = d3.scaleLinear()
    .domain([0, maxStudentValue]) // assuming 'Value' is the student numbers
    .range(["#ffffff", "#377eb8"]); // light color for low values, dark color for high values

  


    // Populate dropdown
    d3.select("#country-select")
      .selectAll('option')
      .data(fromCountries)
      .enter()
      .append('option')
      .text(d => d)
      .attr('value', d => d);

      function createCurvedPathData(start, end, control) {
        return `M ${start[0]},${start[1]} Q ${control[0]},${control[1]} ${end[0]},${end[1]}`;
      }

      d3.select("#country-select").on("change", function() {
        const selectedCountry = d3.select(this).property("value");
        const selectedCountryCode = mobilityData.find(d => d.From_Country === selectedCountry)?.From;

        const mobilityFromSelectedCountry = mobilityData.filter(d => d.From === selectedCountryCode);

          // Recalculate the color scale domain based on the filtered data for the selected country
        const studentValues = mobilityFromSelectedCountry.map(d => +d.Value).filter(Boolean);

        const minStudentValue = studentValues.length > 0 ? d3.min(studentValues) : 0;
        const maxStudentValue = studentValues.length > 0 ? d3.max(studentValues) : 0;
        const colorDomain = studentValues.length ? [minStudentValue, maxStudentValue] : [0, 0];
        
        colorScale.domain(colorDomain);

        //console.log(colorScale)

        // ... Inside your dropdown change event handler after updating color scale domain
        const defs = colorBarsvgMap.append("defs");
        const linearGradient = defs.append("linearGradient")
          .attr("id", "gradient-color-bar")
          .attr("x1", "0%").attr("y1", "100%")
          .attr("x2", "0%").attr("y2", "0%");

        // colorBarsvgMap.select("#gradient-color-bar").remove(); // Remove old gradient defs


        linearGradient.selectAll("stop")
        .data(d3.range(numStops).map((i) => {
          return {
            offset: i / (numStops - 1),
            color: colorScale(minStudentValue + i * (maxStudentValue - minStudentValue) / (numStops - 1))
          };
        }))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

        // Remove old color bar before drawing a new one
        colorBarsvgMap.selectAll(".color-bar-rect").remove();

        // Append the color bar only once, not inside the selection change handler
        colorBarsvgMap.append("rect")
          .attr("class", "color-bar-rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", colorBarwidthMap)
          .attr("height", colorBarheightMap)
          .style("fill", "url(#gradient-color-bar)");




        const yAxisScale = d3.scaleLinear()
            .domain([minStudentValue, maxStudentValue]) // Use the dynamically calculated min and max values
            .range([colorBarheightMap, 0]);

        // console.log(minStudentValue)
        // console.log(maxStudentValue)

        const yAxis = d3.axisRight(yAxisScale).ticks(5);
        // .tickValues(colorScale.domain())
        // .tickFormat(d3.format(".2s")); // Format the ticks for readability

        // Remove old axis before drawing a new one
        colorBarsvgMap.selectAll(".y.axis").remove();

        colorBarsvgMap.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + colorBarwidthMap + ",0)")
          .call(yAxis);
        

        
      
        // Reset all countries to the initial color, except for the selected "From" country
        countries.attr("fill", function(d) {
          //console.log(d)
          const countryCode = d.properties.ISO_A3;
          const mobilityRecord = mobilityFromSelectedCountry.find(m => m.To === countryCode);
          // return d.properties.ISO_A3 === selectedCountryCode ? "red" : "#cccccc";
          return mobilityRecord ? colorScale(mobilityRecord.Value) : "#cccccc";
        }).attr("stroke", "#333").attr("stroke-width", 0.5)
        
        
        countries.on("mouseover", function() {

          //console.log(this.getAttribute("id"))
          const countryCode = this.getAttribute("id");
          
          const countryData = data.features.find(d => d.properties.ISO_A3 === countryCode);
          const countryName = countryData.properties.ADMIN;
          const mobility = mobilityFromSelectedCountry.find(m => m.To === countryCode);

          const fromCountryCode = selectedCountryCode.toLowerCase(); // Assuming this is available in the scope
          const fromCountryName = selectedCountry; // Adjust based on your data structure
          const numberOfStudents = mobility ? mobility.Value : 0;


          const fromCountryFlagPath = `gif/${fromCountryCode}.gif`; // Update with your actual path to the flags directory
          const destinationCountryFlagPath = `gif/${countryCode.toLowerCase()}.gif`;



          //console.log("PageX:", event.pageX, "PageY:", event.pageY);

          const event = d3.event;


        
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(`
    <strong>${numberOfStudents} students</strong><br>
    from <img src="${fromCountryFlagPath}" alt="${fromCountryName}" style="height: 20px;"> ${fromCountryName} 
    study in <img src="${destinationCountryFlagPath}" alt="${countryName}" style="height: 20px;"> ${countryName}
  `)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px")
            .transition()
            .duration(200)
            .style("opacity", 0.9);;


        })
        .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });;



        svgMap.selectAll(".arrow-path").remove();
      
        // Color the selected country in red
        if (selectedCountryCode) {
          d3.select(`#${selectedCountryCode}`).attr("fill", "red");
        }
        // Get mobility data for the selected country
      
        // Get the range of student values for the selected "From" country
      // const studentValues = mobilityFromSelectedCountry.map(d => d.Value).filter(v => v != null);
      // const maxStudentValue = d3.max(studentValues);
      // const minStudentValue = d3.min(studentValues);

      // colorScale.domain([minStudentValue, maxStudentValue]);

      function getCountryCentroid(countryCode) {
        if (countryCode === "FRA") {
          return projection([2.2137, 46.2276]); // These coordinates are an example for mainland France
        } else{
        const countryFeature = data.features.find(d => d.properties.ISO_A3 === countryCode);
        return countryFeature ? projection(d3.geoCentroid(countryFeature)) : null;
        }
      }

      // Define a scale for the arrow widthMaps
      const arrowwidthMapScale = d3.scaleLinear()
      .domain(d3.extent(mobilityData, d => d.Value))
      .range([0.1, 0.5]); // Adjust the range based on what looks good on your map

      // Define a scale for the arrow marker sizes, similar to the arrowwidthMapScale
      const arrowMarkerSizeScale = d3.scaleLinear()
      .domain(d3.extent(mobilityData, d => d.Value))
      .range([0.2,0.8]); // Adjust the range min and max to suitable sizes for your smallest and largest arrows

      // Update the colors of the destination countries
      mobilityFromSelectedCountry.forEach(mobility => {
        const fromCentroid = getCountryCentroid(selectedCountryCode);
        const toCentroid = getCountryCentroid(mobility.To);
        const destinationCountryCode = mobility.To;
        const value = mobility.Value || 0;

                // Determine the stroke widthMap for this arrow
        const strokewidthMap = arrowwidthMapScale(value);

        // Calculate the marker size based on the value
        const markerSize = arrowMarkerSizeScale(value);

        // Calculate the refX dynamically based on the stroke widthMap
        const refX = markerSize / 2 + strokewidthMap;

        // Color the destination countries according to the number of students
        // but skip coloring the selected "From" country
        if (destinationCountryCode !== selectedCountryCode) {
          d3.select(`#${destinationCountryCode}`).attr("fill", colorScale(value));
        }

        if (fromCentroid && toCentroid && mobility.To !== selectedCountryCode) {
                // Calculate a control point for the curve to create a nice arch
          // The control point is a midpoint for simplicity, shifted by a factor of the distance
          const dx = toCentroid[0] - fromCentroid[0];
          const dy = toCentroid[1] - fromCentroid[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          const controlPoint = [
            (fromCentroid[0] + toCentroid[0]) / 2, 
            (fromCentroid[1] + toCentroid[1]) / 2 - distance * 0.2 // Adjust the 0.2 factor to control curvature
          ];

          // Draw the arrow
      // Draw the curved arrow path

      const arrowId = `arrow-${destinationCountryCode}`;
      //console.log(arrowId)

      svgMap.select("defs").append("marker")
      .attr("id", arrowId)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", refX) // Position the arrowhead at the end of the line
      .attr("refY", 0)
      .attr("markerwidth", markerSize)
      .attr("markerheight", markerSize)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "black");


      svgMap.append("path")
            .attr("class", "arrow-path")
            .attr("d", createCurvedPathData(fromCentroid, toCentroid, controlPoint))
            .attr("stroke", "black")
            .attr("stroke-width", strokewidthMap)
            .attr("fill", "none")
            .attr("marker-end", `url(#${arrowId})`);
        }
      });

      // // Define the arrowhead marker
      // svgMap.append("svgMap:defs").selectAll("marker")
      //   .data(["arrow"])      // Different link/path types can be defined here
      // .enter().append("svgMap:marker")    // This section adds in the arrows
      //   .attr("id", String)
      //   .attr("viewBox", "0 -5 10 10")
      //   .attr("refX", 10)
      //   .attr("refY", 0)
      //   .attr("markerwidthMap", 6)
      //   .attr("markerheightMap", 6)
      //   .attr("orient", "auto")
      //   .append("svgMap:path")
      //   .attr("d", "M0,-5L10,0L0,5");

    });

  });
});