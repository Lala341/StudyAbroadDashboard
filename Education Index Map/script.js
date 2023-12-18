document.addEventListener('DOMContentLoaded', function() {
    const svg = d3.select("#world-map"),
        width = 960,
        height = 600;

    svg.attr("width", width).attr("height", height);

    const projection = d3.geoMercator()
        .scale(130)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);


    // const colorPalette = ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'];
    // const colorScale = d3.scaleQuantize()
    //     .domain([0, 1])
    //     .range(colorPalette);

	const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 1]);

    const tooltip = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);



    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(world) {
        d3.csv("./Edu_index.csv").then(function(data) {
            const indexById = {};
            const nameById = {};
            data.forEach(d => {
                indexById[d['Country Code']] = +d['Education Index'];
                nameById[d['Country Code']] = d['Country'];
            });

            svg.selectAll("path")
                .data(world.features)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", function(d) {

					const eduIndex = indexById[d.id];
					// If the value is undefined, return transparent; otherwise, use the color scale
					return eduIndex === undefined ? "rgba(128, 128, 128, 0.5)" : colorScale(eduIndex);
                })
                .attr("stroke", "white")
                .attr("stroke-width", 0.5)
                .on("mouseover", function(event, d) {
					const eduIndex = indexById[d.id];
					const countryName = d.properties.name || d.properties.NAME || d.properties.CountryName || "Country name not available";
					const isoCode = d.id.toLowerCase();
					const flagUrl = `./gif/${isoCode}.gif`;
					//console.log(isoCode)
					const img = new Image();
					img.src = flagUrl;
					img.style = "width:20px;height:15px; margin-right: 5px;";
					img.onload = () => {
						// Image loaded successfully, display it in the tooltip
						tooltip.html(`<img src="${flagUrl}" style="width:20px;height:15px; margin-right: 5px;"> ${countryName}: ${eduIndex !== undefined ? eduIndex : "No data available"}`);
					};
					img.onerror = () => {
						// Image failed to load, display only the text
						tooltip.html(`${countryName}: ${eduIndex !== undefined ? eduIndex : "No data available"}`);
					};
				
					tooltip.transition()
						.duration(200)
						.style("opacity", .9)
						.style("left", (event.pageX) + "px")
						.style("top", (event.pageY - 28) + "px");
				})
                .on("mouseout", function(d) {
                    d3.select(this).attr("stroke", "white").attr("stroke-width", 0.5);
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

			
			const legendWidth = 300, legendHeight = 20, numRects = 10;
			const legendData = Array.from({ length: numRects }, (_, i) => i / (numRects - 1));
			const minValue = 0, maxValue = 1; 
			const intermediateValues = [0.2, 0.4, 0.6, 0.8]; 
			
			const legend = svg.append("g")
				.attr("id", "legend")
				.attr("transform", "translate(30,550)"); 
			
			legend.selectAll("rect")
				.data(legendData)
				.enter().append("rect")
				.attr("x", (d, i) => i * (legendWidth / numRects))
				.attr("y", 0)
				.attr("width", legendWidth / numRects)
				.attr("height", legendHeight)
				.style("fill", d => colorScale(d));
			
			
			const calcXPosition = value => value * legendWidth;
			
			
			[...intermediateValues, minValue, maxValue].forEach(value => {
				legend.append("text")
					.attr("x", calcXPosition(value))
					.attr("y", legendHeight + 15)
					.style("fill", "black")
					.style("font-size", "12px")
					.attr("text-anchor", value === maxValue ? "end" : "middle")
					.text(value.toFixed(1));
			});

			
        });
    });
});