var svgWidth = 1000;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create an SVG element
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Paramters
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusHealth, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLiner()
  .domain([d3.min(censusHealth, d => d[chosenXAxis]
    ) * 0.8,
      d3.max(censusHealth, d => d[chosenXAxis])
      * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with new tooltip
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty (%)"
  }
  if (chsoenXAxis === "age") {
    var label = "Age (Median)";
  }
  else {
    var label = "Household Income (Median)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenAxis]}`);
    });
  
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // on mouse out event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  
    return circlesGroup;
}
// Load csv data and execute everything below
d3.csv("assets/data/data.csv", function(error, censusHealth) {

  if (error) throw error;

  // cast the data from the csv as numbers
  censusHealth.forEach(function(data) {
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.incomeMoe = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesityLow;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes;
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

  // Create a scale for your independent (x) coordinates
  var xScale = d3.scaleLinear()
    .domain(d3.extent(censusHealth, d => d.poverty))
    .range([0, svgWidth]);

  // Create a scale for your dependent (y) coordinates
  var yScale = d3.scaleLinear()
    .domain([0, d3.max(censusHealth, d => d.healthcareLow)])
    .range([svgHeight, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  varxAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  
  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll
  ("circle")
    .data(censusHealth)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcareLow))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Creat group for 3 x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 3}, ${height + 20})`);
  
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)")
  
  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)")
  
  var houseHoldIncome = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");
  
  // Create group for 3 y axis labels
  var yGroup = chartGroup.append("g")
    .attr("transform", `translate(${height / 3}, ${width + 20})`);

  var lackHealthcareLabel = yGroup.append("text")
    .attr("y", 0)
    .attr("x", 40)
    .attr("value", "healthcareLow")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var obeseLabel = yGroup.append("text")
    .attr("y", 0)
    .attr("x", 20)
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");
  
  var smokesLabel = yGroup.append("text")
    .attr("y", 0)
    .attr("x", 40)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

// updateToolTip function 
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listner
labelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this)
    .attr("value");
    if (value !== chosenXAxis) {
      chosenXAxis = value;

      xLinearScale = xScale(censusHealth, chosenXAxis);

      xAxis = renderAxes(xLinearScale, xAxis);

      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        houseHoldIncomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      if (chosenXAxis === "income") {
        houseHoldIncomeLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        povertyLabel
          .classed("active", true)
          .classed("inactive", false);
        ageLabel
          .classed("active", false)
          .classed("inactive", true);
        houseHoldIncomeLabel
          .classed("active", false)
          .classed("inactive", true);
      }
    }
  })
})