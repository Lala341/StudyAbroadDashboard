// Reference : Radar Chart https://observablehq.com/@d3/radial-stacked-bar-chart/2
// Inspiration : Radar Chart https://www.benscott.co.uk/wdvp/


const parseTime = d3.timeParse("%Y");

const options_years = ['2012', '2018'];
const options_levels = ['level1', 'level2', 'level3', 'level4'];
const options_types = ['m', 'no'];

var filter_year = '2018';
var filter_field = 'm';
var filter_type = 'm';



const data_metrics = [
  { Level: '1', Mathematics: '>=358', Reading: '>=335', Science: '>=335' },
  { Level: '2', Mathematics: '>=420', Reading: '>=407', Science: '>=409' },
  { Level: '3', Mathematics: '>=482', Reading: '>=480', Science: '>=484' },
  { Level: '4', Mathematics: '>=545', Reading: '>=553', Science: '>=559' },
];


const getDataFilters = (data, filter_year, filter_field, filter_type,
  islevel1Selected, islevel2Selected, islevel3Selected, islevel4Selected) => {

  const data_level1 = data.filter(d => d.year === filter_year).map(d => {

    const result = {
      country: d.country,
    };

    // Check the filter_type and include corresponding columns
    if (islevel1Selected) {
      result.level1 = parseFloat(d[filter_field + "level1_" + filter_type]);

    } if (islevel2Selected) {
      result.level2 = parseFloat(d[filter_field + "level2_" + filter_type]);
    } if (islevel3Selected) {
      result.level3 = parseFloat(d[filter_field + "level3_" + filter_type]);
    }
    if (islevel4Selected) {
      result.level4 = parseFloat(d[filter_field + "level4_" + filter_type]);
    }

    return result;
  });

  data_level1.columns = ['country', 'level1', 'level2', 'level3', 'level4'];
  var newData = data_level1.columns.slice(1).flatMap((type_class) => data_level1.map((d) => ({ country: d.country, type_class, result: d[type_class] })));

  return newData;

}

function updateRadarChart() {

  /* Load the dataset and formatting variables
  Ref: https://www.d3indepth.com/requests/ */
  d3.csv("./wide-learningpisa.csv").then(data => {

    // Print out the data on the console
    console.log(data);


    var e = document.getElementById("dataYear");
    var filter_year = e.options[e.selectedIndex].value;

    var e = document.getElementById("dataField");
    var filter_field = e.options[e.selectedIndex].value;

    var e = document.getElementById("dataType");
    var filter_type = e.options[e.selectedIndex].value;


    const Level1Checkbox = document.getElementById('Level1Checkbox');
    const Level2Checkbox = document.getElementById('Level2Checkbox');
    const Level3Checkbox = document.getElementById('Level3Checkbox');
    const Level4Checkbox = document.getElementById('Level4Checkbox');

    const isLevel1Selected = Level1Checkbox.checked;
    const isLevel2Selected = Level2Checkbox.checked;
    const isLevel3Selected = Level3Checkbox.checked;
    const isLevel4Selected = Level4Checkbox.checked;



    var newData = getDataFilters(data, filter_year, filter_field, filter_type,
      isLevel1Selected, isLevel2Selected, isLevel3Selected, isLevel4Selected);
    console.log(newData);

    d3.select("#radar svg").remove();

    createRadarChart(newData);

  })


}


document.getElementById("dataYear").addEventListener("change", updateRadarChart);
document.getElementById("dataField").addEventListener("change", updateRadarChart);
document.getElementById("dataType").addEventListener("change", updateRadarChart);



updateRadarChart();


const createTableDefinitions = (data) => {

  const table = d3.select('#tabledefinition').append('table');

  const thead = table.append('thead');
  thead.append('tr')
    .selectAll('th')
    .data(Object.keys(data[0]))
    .enter()
    .append('th')
    .text(d => d);

  const tbody = table.append('tbody');
  const rows = tbody.selectAll('tr')
    .data(data)
    .enter()
    .append('tr');

  const cells = rows.selectAll('td')
    .data(d => Object.values(d))
    .enter()
    .append('td')
    .text(d => d);

}

createTableDefinitions(data_metrics);

const createRadarChart = (data) => {

  const width = 850;
  const height = width;
  const innerRadius = 78;  // Margin for a radar chart
  const outerRadius = Math.min(width, height) * 0.28; // Margin for a radar chart


  // Stack the data into series
  const series = d3.stack()
    .keys(d3.union(data.map(d => d.type_class)))
    .value(([, D], key) => D.get(key).result)
    (d3.index(data, d => d.country, d => d.type_class));

  const arc = d3.arc()
    .innerRadius(d => y(d[0]))
    .outerRadius(d => y(d[1]))
    .startAngle(d => x(d.data[0]))
    .endAngle(d => x(d.data[0]) + x.bandwidth())
    .padAngle(1.5 / innerRadius)
    .padRadius(innerRadius);

  // An angular x-scale
  const x = d3.scaleBand()
    .domain(d3.groupSort(data, D => -d3.sum(D, d => d.result), d => d.country))
    .range([0, 2 * Math.PI])
    .align(0);

  // A radial y-scale maintains area proportionality of radial bars
  const y = d3.scaleRadial()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])

    .range([innerRadius, outerRadius]);

  const color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.quantize(d3.interpolateHcl("#60c96e", "#4d4193"), series.length))
    .unknown("#ccc");

  // A function to format the value in the tooltip
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  const svg = d3.select("#radar")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height * 0.40, width, height])
    .attr("style", "width: 1024px; height: auto; font: 10px sans-serif;");

  // A group for each series, and a rect for each element in the series
  svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("path")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("path")
    .attr("d", arc)
    .append("title")
    .text(d => `${d.data[0]} ${d.key}\n${formatValue(d.data[1].get(d.key).result)}`);

  // x axis
  svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll()
    .data(x.domain())
    .join("g")
    .attr("transform", d => `
          rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
          translate(${innerRadius},0)
        `)
    .call(g => g.append("line").attr("transform", "rotate(-180) translate(-181,0)")
      .attr("x2", -5)
      .attr("stroke", "#000"))
    .call(g => g.append("text")
      .attr("transform", d => {
        const angle = (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI);
        
        if ((angle >= 0 && angle < Math.PI / 2) || (angle >= 3 * Math.PI / 2 && angle < 2 * Math.PI)) {
            // Quadrant 1 or Quadrant 4
            return "rotate(180)translate(-225,0)";
        } else {
            // Quadrant 2 or Quadrant 3
            return "rotate(-360)translate(225,0)";
        }
    })
      .text(d => d));

  // y axis
  svg.append("g")
    .attr("text-anchor", "end")
    .call(g => g.append("text")
      .attr("x", -6)
      .attr("y", d => -y(y.ticks(10).pop()))
      .attr("dy", "-0.5em")
      .text("Results"))
    .call(g => g.selectAll("g")
      .data(y.ticks(10).slice(1))
      .join("g")
      .attr("fill", "none")
      .call(g => g.append("circle")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.5)
        .attr("r", y))
      .call(g => g.append("text")
        .attr("x", -6)
        .attr("y", d => -y(d))
        .attr("dy", "0.35em")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .text(y.tickFormat(10, "s"))
        .clone(true)
        .attr("fill", "#000")
        .attr("stroke", "none")));

  // color legend
  svg.append("g")
    .selectAll()
    .data(color.domain())
    .join("g")
    .attr("transform", (d, i, nodes) => `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
    .call(g => g.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color))
    .call(g => g.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .text(d => d));

  return svg.node();

}


