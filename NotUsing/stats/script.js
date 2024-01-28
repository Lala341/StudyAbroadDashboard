// Data for statistics
const statisticsData = [
  { label: 'Enhancing Employability', description: 'More than 90% of mobile students reported that they improved their soft skills, including their knowledge of other countries, the ability to interact and work with people from different cultures, adaptability, foreign language proficiency, and communication skills.', percentage: 85 },
  { label: 'Improved Soft Skills', description: 'The statistics show that studying abroad increases the chances of successful employment. After graduation, 74% of college students reported starting a professional career.', percentage: 90 },
 { label: 'Understanding Cultural Values', description: '98% of the students stated that study abroad helped them better understand their own cultural values and biases, and 82% said that it helped them develop a more sophisticated way of looking at the world.', percentage: 98 },
  { label: 'Successful Employment after Graduation', description: 'More than 90% of mobile students reported that they improved their soft skills, including their knowledge of other countries, the ability to interact and work with people from different cultures, adaptability, foreign language proficiency, and communication skills.', percentage: 74 }
];

// Function to create a gauge-like bar
function createGauge(containerId, data, index) {
  // Dimensions for each gauge
  const width = 100;
  const height = 100;
  const radius = 50;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('class', 'gauge-svg')
    .attr('width', width+400)
    .attr('height', height+20)
    .append('g')
    .attr('transform', `translate(${width / 2},${ height/2})`);

  // Create arc
  const arc = d3.arc()
    .innerRadius(radius - 20)
    .outerRadius(radius)
    .startAngle(0)
    .endAngle((Math.PI * 2 * data.percentage) / 100);

  // Draw the arc
  svg.append('path')
    .attr('class', 'gauge-bar')
    .attr('d', arc);

  // Display the percentage label in the center
  svg.append('text')
    .attr('class', 'gauge-label')
    .text(`${data.percentage}%`)
    .attr('text-anchor', 'middle')
    .attr('dy', 5); // Adjust text vertical position

  
  // Display the legend (description) to the right of the gauge
  svg.append('text')
    .attr('class', 'gauge-legend')
    .text(data.label)
    .attr('x', radius + 10)
    .attr('y', 0)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'start');
}

// Create a gauge for each statistic
statisticsData.forEach((stat, index) => {
  createGauge('visualization-container', stat, index);
});


