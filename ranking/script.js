var startNumber = 0;
var nomUniv = 10;
const scoreNames = ['teaching', 'international', 'research','citations', 'income'];
const margin = { top: 20, right: 20, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

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
  const filteredData = data
    .filter(d => !isNaN(+d.teaching) && !isNaN(+d.international) && !isNaN(+d.research))
    .filter(d => d.year === '2011')
    .slice(startNumber, startNumber + nomUniv);

  // Convert numeric columns to numbers
  filteredData.forEach((entry) => {
    entry.teaching = parseFloat(entry.teaching);
    entry.international = parseFloat(entry.international);
    entry.research = parseFloat(entry.research);
    entry.citations = parseFloat(entry.citations);
    entry.income = parseFloat(entry.income);

  });

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
    .nice()
    .range([height, 0]);

  // Set up color scale
  const color = d3.scaleOrdinal().domain(categories).range(d3.schemeSet2);
  // Draw bars
  svg.selectAll('.bar')
    .data(filteredData)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d.university_name)},0)`)
    .selectAll('rect')
    .data(d => categories.map(key => ({ key, value: d[key] })))
    .enter().append('rect')
    .attr('x', d => x1(d.key))
    .attr('y', d => y(d.value))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.value))
    .attr('fill', d => color(d.key));

  // Add x-axis
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-55)');

  // Add y-axis
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).ticks(20));

  // Add legend
  const legend = svg.selectAll('.legend')
    .data(categories)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => `translate(0,${i * 20})`);

  legend.append('rect')
    .attr('x', width +2)
    .attr('width', 19)
    .attr('height', 19)
    .attr('fill', d => color(d));

  legend.append('text')
    .attr('x', width +24)
    .attr('y', 9.5)
    .attr('dy', '0.12em')
    .text(d => d).style('font-size', 12); // Adjust the font size here

});



}


document.addEventListener('DOMContentLoaded', function() {

loadBarChar();

});