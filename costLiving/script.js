// Load the data (make sure the path to your data file is correct)
d3.csv("./costLiving/cost-of-living_v2.csv").then(function(data) {
  // Parse the price and filter out invalid entries
  var filteredData = data.filter(function(d) {
      return d.price.toLowerCase() !== "nan";
  }).map(function(d) {
      d.price = +d.price; // Ensure price is a number
      return d;
  });

  // Group data by country
  var nestedData = d3.group(filteredData, d => d.country);

  // Create country selector
  var countrySelect = d3.select("#countrySelector");
  countrySelect.selectAll("option")
      .data(Array.from(nestedData.keys())) // Convert keys iterator to array
      .enter()
      .append("option")
      .text(d => d);

  // Function to sort and slice the data
  function getTopKData(data, k, ascending = true) {
      return data.sort((a, b) => {
          return ascending ? a.price - b.price : b.price - a.price;
      }).slice(0, k);
  }

  // Function to update the chart
  function updateChart(country, k = 5, ascending = true) {
      var data = getTopKData(nestedData.get(country), k, ascending);

      var svg = d3.select("#cost");
      svg.selectAll("*").remove(); // Clear the svg for new chart

      var margin = {top: 20, right: 20, bottom: 70, left: 40},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;

      var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
          y = d3.scaleLinear().rangeRound([height, 0]);

      var g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function(d) { return d.city; }));
      y.domain([0, d3.max(data, function(d) { return d.price; })]);

      // X axis
      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

      // X axis label
      svg.append("text")
          .attr("transform",
                "translate(" + (width / 2 + margin.left) + " ," +
                               (height + margin.top + 50) + ")")
          .style("text-anchor", "middle")
          .text("City");

      // Y axis
      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Price (USD)");

      // Bars
      g.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.city); })
          .attr("y", function(d) { return y(d.price); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return height - y(d.price); });

      // Labels on top of the bars
      g.selectAll(".label")
          .data(data)
          .enter().append("text")
          .attr("class", "label")
          .attr("x", (d) => x(d.city) + x.bandwidth() / 2)
          .attr("y", (d) => y(d.price) - 5)
          .attr("dy", ".75em")
          .attr("text-anchor", "middle")
          .text((d) => d.price);

      // Adjust label position if the value is too close to the bottom of the svg
      g.selectAll(".label")
          .attr("y", function(d) {
              // If the bar is too tall, put the label inside the bar
              return this.getBBox().y < 10 ? y(d.price) + 20 : y(d.price) - 5;
          })
          .attr("fill", function(d) {
              // If the label is inside the bar, make it white; otherwise, black.
              return this.getBBox().y < 10 ? "white" : "black";
          });
  }

  // Event listeners for the dropdowns
  countrySelect.on("change", function() {
      var country = d3.select(this).property("value");
      var k = +d3.select("#topKSelector").property("value");
      var ascending = d3.select("#sortOrderSelector").property("value") === "lowest";
      updateChart(country, k, ascending);
  });

  // Top K selector
  var topKSelect = d3.select("#topKSelector");
  topKSelect.on("change", function() {
      var k = +d3.select(this).property("value");
      var country = countrySelect.property("value");
      var ascending = d3.select("#sortOrderSelector").property("value") === "lowest";
      updateChart(country, k, ascending);
  });

  // Sort order selector
  var sortOrderSelect = d3.select("#sortOrderSelector");
  sortOrderSelect.on("change", function() {
      var ascending = d3.select(this).property("value") === "lowest";
      var country = countrySelect.property("value");
      var k = +topKSelect.property("value");
      updateChart(country, k, ascending);
  });

  // Initialize with the first country, top 5, and lowest prices
  updateChart(nestedData.keys().next().value);
}).catch(function(error){
  console.error("Error loading or parsing the data: ", error);
});
