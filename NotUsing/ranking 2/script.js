var startNumber = 1;
var nomUniv = 10;
const scoreNames = ['teaching', 'international', 'research','citations', 'income'];
const margin = { top: 30, right: 20, bottom: 200, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

  document.getElementById('startNumber').addEventListener('input', function () {
    document.getElementById('startNumberValue').textContent = this.value;
    startNumber=this.value;
    loadBarChar();
    
});

document.getElementById('nomUniv').addEventListener('input', function () {
    document.getElementById('nomUnivValue').textContent = this.value;
    nomUniv=this.value;
    loadBarChar();
});

function loadBarChar(){
  const svg = d3.select("#world-map2");
  svg.selectAll("*").remove(); 
// Load the data from CSV
d3.csv('./ranking/cwurData.csv').then((data) => {
  // Filter and transform the data
  const prefilteredData = data
    .filter(d => d.year === '2011');

    
  // Convert numeric columns to numbers
  prefilteredData.forEach((entry) => {
    
    if(isNaN(entry['teaching'])){
      entry.teaching = 0;

    }
    if(isNaN(entry['international'])){
      entry.international = 0;

    }
    if(isNaN(entry['research'])){
      entry.research = 0;

    }
    if(isNaN(entry['citations'])){
      entry.citations = 0;

    }
    if(isNaN(entry['income'])){
      entry.income = 0;

    }
    entry.teaching = parseFloat(entry.teaching);
    entry.international = parseFloat(entry.international);
    entry.research = parseFloat(entry.research);
    entry.citations = parseFloat(entry.citations);
    entry.income = parseFloat(entry.income);


  });

  const startIndex = Math.min( parseInt(startNumber) - 1, prefilteredData.length - 1);
        const endIndex = Math.min(startIndex + parseInt(nomUniv), prefilteredData.length - 1);
        const filteredData = prefilteredData.slice(startIndex, endIndex);
       

  // Extract unique universities and categories
  const universities = filteredData.map(d => d.university_name);
  const categories = scoreNames;

  // Set up chart dimensions

  const svg = d3.select("#world-map2")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


	
  // Create SVG container

  // Set up scales
  const x0 = d3.scaleBand()
  .domain(universities)
  .rangeRound([0, width])
  .paddingInner(0.1);

const x1 = d3.scaleBand()
  .domain(categories)
  .rangeRound([0, x0.bandwidth()])
  .padding(0.05);

const y = d3.scaleLinear()
  .domain([0, d3.max(filteredData, d => d3.max(categories, key => d[key]))])
  .range([height, 0]);

  // Set up color scale
  const color = d3.scaleOrdinal().domain(categories).range(d3.schemeSet2);

  const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
   // Draw bars
   svg.selectAll('.bar')
   .data(filteredData)
   .enter().append('g')
   .attr('transform', d => `translate(${x0(d.university_name)},0)`)
   .selectAll('rect')
   .data(d => categories.map(key => ({ key, value: d[key], university: d.university_name })))
   .enter().append('rect')
   .attr('x', d => x1(d.key))
   .attr('y', d => y(d.value))
   .attr('width', x1.bandwidth())
   .attr('height', d => height - y(d.value))
   .attr('fill', d => color(d.key))
   .on("mouseover", handleMouseOver)
   .on("mouseout", handleMouseOut);

// ... (your existing code)

// Tooltip handling functions
function handleMouseOver(event, d) {
   tooltip.transition().duration(200).style("opacity", 0.9);
   tooltip.html(`<strong>${d.university}</strong><br>${d.key}: ${d.value}`)
       .style("left", (event.pageX + 5) + "px")
       .style("top", (event.pageY - 28) + "px");
}

function handleMouseOut() {
   tooltip.transition().duration(500).style("opacity", 0);
}

// Add x-axis
svg.append('g')
   .attr('class', 'axis')
   .attr('transform', `translate(0,${height})`)
   .call(d3.axisBottom(x0))
   .selectAll('text')
   .style('text-anchor', 'end')
   .attr('dx', '-.8em')
   .attr('dy', '.15em')
   .attr('transform', 'rotate(-45)')
   .style('font-size', '12px'); // Adjust the font size for x-axis labels

// Add y-axis
svg.append('g')
   .attr('class', 'axis')
   .call(d3.axisLeft(y).ticks(20));

// Add legend horizontally above the graph
const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${margin.left},${margin.top - 60})`); // Adjusted padding

const legendItems = legend.selectAll('.legend-item')
    .data(categories)
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(${i * 100 + 20}, 0)`); // Adjusted padding and added margin

legendItems.append('rect')
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => color(d));

legendItems.append('text')
    .attr('x', 24)
    .attr('y', 9.5)
    .attr('dy', '0.32em')
    .text(d => d)
    .style('font-size', '12px'); // Adjust the font size for legend text

});


}


document.addEventListener('DOMContentLoaded', function() {

loadBarChar();

});