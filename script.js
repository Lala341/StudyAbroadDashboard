const widthMap = 1400;
const heightMap = 700;

const svgMap = d3.select("#map-container")
  .append("svg")
  .attr("width", widthMap)
  .attr("height", heightMap);

const projection = d3.geoMercator()
  .center([-15, 55]) 
  .scale(700) 
  .translate([widthMap / 2, heightMap / 2]);


const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute") 
  .style("font-size", "14px")
  .style("color", "#000")
  .style("background-color", "white")
  .style("padding", "5px")
  .style("border", "1px solid #000")
  .style("border-radius", "5px")
  .style("pointer-events", "none") 
  .style("opacity", 0)
  .style("transition", "opacity 0.2s"); 


const colorBarwidthMap = 20; 
const colorBarheightMap = 300;
const colorBarMargin = { top: 200, right: 60, bottom: 40, left: 40 };
const numStops = 10; 

const colorBarsvgMap = d3.select("#map-container").append("svg")
  .attr("width", colorBarwidthMap + colorBarMargin.left + colorBarMargin.right)
  .attr("height", colorBarheightMap + colorBarMargin.top + colorBarMargin.bottom)
  .style("position", "absolute")
  .style("top", "2050px")
  .style("right", "0px") 
  //.style("top", `${colorBarMargin.top}px`)
  .append("g")
  .attr("transform", "translate(" + colorBarMargin.left + "," + colorBarMargin.top + ")");




d3.json("filtered_countries.geojson").then(function (data) {
  const countries = svgMap.append("g")
    .selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", "#cccccc")
    .attr("id", d => d.properties.ISO_A3)

  d3.csv("Cleaned_Mobility.csv").then(function (mobilityData) {
    const fromCountries = Array.from(new Set(mobilityData.map(d => d.From_Country)));
    fromCountries.sort(); 

    const maxStudentValue = d3.max(mobilityData, d => {
      return d.Value ? +d.Value : 0; 
    });

    const colorScale = d3.scaleLinear()
      .domain([0, maxStudentValue]) 
      .range(["#ffffff", "#377eb8"]); 


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

    d3.select("#country-select").on("change", function () {
      const selectedCountry = d3.select(this).property("value");
      const selectedCountryCode = mobilityData.find(d => d.From_Country === selectedCountry)?.From;

      const mobilityFromSelectedCountry = mobilityData.filter(d => d.From === selectedCountryCode);

      const studentValues = mobilityFromSelectedCountry.map(d => +d.Value).filter(Boolean);

      const minStudentValue = studentValues.length > 0 ? d3.min(studentValues) : 0;
      const maxStudentValue = studentValues.length > 0 ? d3.max(studentValues) : 0;
      const colorDomain = studentValues.length ? [minStudentValue, maxStudentValue] : [0, 0];

      colorScale.domain(colorDomain);

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

      colorBarsvgMap.selectAll(".color-bar-rect").remove();

      colorBarsvgMap.append("rect")
        .attr("class", "color-bar-rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", colorBarwidthMap)
        .attr("height", colorBarheightMap)
        .style("fill", "url(#gradient-color-bar)");




      const yAxisScale = d3.scaleLinear()
        .domain([minStudentValue, maxStudentValue]) 
        .range([colorBarheightMap, 0]);

      // console.log(minStudentValue)
      // console.log(maxStudentValue)

      const yAxis = d3.axisRight(yAxisScale).ticks(5);
      colorBarsvgMap.selectAll(".y.axis").remove();

      colorBarsvgMap.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + colorBarwidthMap + ",0)")
        .call(yAxis);




      countries.attr("fill", function (d) {
        const countryCode = d.properties.ISO_A3;
        const mobilityRecord = mobilityFromSelectedCountry.find(m => m.To === countryCode);
        return mobilityRecord ? colorScale(mobilityRecord.Value) : "#cccccc";
      }).attr("stroke", "#333").attr("stroke-width", 0.5)


      countries.on("mouseover", function () {

        const countryCode = this.getAttribute("id");

        const countryData = data.features.find(d => d.properties.ISO_A3 === countryCode);
        const countryName = countryData.properties.ADMIN;
        const mobility = mobilityFromSelectedCountry.find(m => m.To === countryCode);
        const fromCountryCode = selectedCountryCode.toLowerCase(); 
        const fromCountryName = selectedCountry; 
        const numberOfStudents = mobility ? mobility.Value : 0;


        const fromCountryFlagPath = `gif/${fromCountryCode}.gif`; 
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
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });;



      svgMap.selectAll(".arrow-path").remove();

      if (selectedCountryCode) {
        d3.select(`#${selectedCountryCode}`).attr("fill", "red");
      }

      function getCountryCentroid(countryCode) {
        if (countryCode === "FRA") {
          return projection([2.2137, 46.2276]); 
        } else {
          const countryFeature = data.features.find(d => d.properties.ISO_A3 === countryCode);
          return countryFeature ? projection(d3.geoCentroid(countryFeature)) : null;
        }
      }

      const arrowwidthMapScale = d3.scaleLinear()
        .domain(d3.extent(mobilityData, d => d.Value))
        .range([0.1, 0.5]); 

        const arrowMarkerSizeScale = d3.scaleLinear()
        .domain(d3.extent(mobilityData, d => d.Value))
        .range([0.2, 0.8]); 
        
      mobilityFromSelectedCountry.forEach(mobility => {
        const fromCentroid = getCountryCentroid(selectedCountryCode);
        const toCentroid = getCountryCentroid(mobility.To);
        const destinationCountryCode = mobility.To;
        const value = mobility.Value || 0;

        const strokewidthMap = arrowwidthMapScale(value);

        const markerSize = arrowMarkerSizeScale(value);


        const refX = markerSize / 2 + strokewidthMap;

        if (destinationCountryCode !== selectedCountryCode) {
          d3.select(`#${destinationCountryCode}`).attr("fill", colorScale(value));
        }

        if (fromCentroid && toCentroid && mobility.To !== selectedCountryCode) {
          const dx = toCentroid[0] - fromCentroid[0];
          const dy = toCentroid[1] - fromCentroid[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          const controlPoint = [
            (fromCentroid[0] + toCentroid[0]) / 2,
            (fromCentroid[1] + toCentroid[1]) / 2 - distance * 0.2 
          ];

         
          const arrowId = `arrow-${destinationCountryCode}`;
          //console.log(arrowId)

          svgMap.select("defs").append("marker")
            .attr("id", arrowId)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", refX) 
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

    });

  });
});