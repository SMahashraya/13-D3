// D3 Animated Scatter Plot

// Section 1: Pre-Data Setup
// ===========================
// Before we code any data visualizations,
// we need to at least set up the width, height and margins of the graph.

// Grab the width of the containing box
var width = parseInt(d3.select("#scatter").style("width"));

// Designate the height of the graph
var height = width - width / 3.9;

// Margin spacing for graph
var margin = 25;

// Space for placing words
var labelArea = 100;

// Padding for the text at the bottom and left axes
var textPadBot = 30;
var textPadLeft = 30;

// Create the actual canvas for the graph
var svg = d3
.select("#scatter")
.append("svg")
.attr("width", width)
.attr("height", height)
.attr("class", "chart");

// Set the radius for each dot that will appear in the graph.
// Note: Making this a function allows us to easily call
// it in the mobility section of our code.
var markerRadius;
function crGet() {
    if(width <= 550) {
        markerRadius = 5;
    }
    else {
        markerRadius = 10;
    }
}
crGet();

// A) Bottom Axis
// ==============

// We create a group element to nest our bottom axes labels.
svg.append("g").attr("class", "xText");

// xText will allows us to select the group without excess code.
var xText = d3.select(".xText");

// We give xText a transform property that places it at the bottom of the chart.
// By nesting this attribute in a function, we can easily change the location of the label group
// whenever the width of the window changes.
function xTextRefresh() {
    xText
    .attr(
        "transform",
        "translate(" + 
        ((width - labelArea) / 2 + labelArea) +
        ", " + 
        (height - margin - textPadBot) +
        ")"
    );
}
xTextRefresh();

// Now we use xText to append three text SVG files, with y coordinates specified to space out the values.
// 1. Poverty
xText
.append("text")
.attr("y", 20)
.attr("data-name", "poverty")
.attr("data-axis", "x" )
.attr("class", "aText active x")
.text("Percent in Poverty")

// 2. Age
xText
.append("text")
.attr("y", 0)
.attr("data-name", "age")
.attr("data-axis", "x" )
.attr("class", "aText inactive x")
.text("Median Age")

// 3. Income
xText
.append("text")
.attr("y", -20)
.attr("data-name", "income")
.attr("data-axis", "x" )
.attr("class", "aText inactive x")
.text("Median Household Income")

// B) Left Axis
// ============

// Specifying the variables like this allows us to make our transform attributes more readable.
var leftTextX = margin + textPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;


// We add a second label group, this time for the axis left of the chart.
svg.append("g").attr("class", "yText");

// yText will allows us to select the group without excess code.
var yText = d3
.select(".yText");

// Like before, we nest the group's transform attr in a function
// to make changing it on window change an easy operation.
function yTextRefresh() {
    yText
    .attr(
      "transform",
      "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
  }
  yTextRefresh();

// Now we append the text.
// 1. Obesity
yText
.append("text")
.attr("y", -20)
.attr("data-name", "obesity")
.attr("data-axis", "y")
.attr("class", "aText active y")
.text("Percent Obese");

// 2. Smokes
yText
.append("text")
.attr("y", 0)
.attr("data-name", "smokes")
.attr("data-axis", "y")
.attr("class", "aText inactive y")
.text("Percent Smoker");

// 3. Lacks Healthcare
yText
.append("text")
.attr("y", 20)
.attr("data-axis", "y")
.attr("data-name", "healthcare")
.attr("class", "aText inactive y")
.text("Percent Lacking Healthcare");

// 2. Import our .csv file.
// ========================
// This data file includes state-by-state demographic data from the US Census
// and measurements from health risks obtained
// by the Behavioral Risk Factor Surveillance System.

// Import our CSV data with d3's .csv import method.
d3.csv("assets/data/data.csv", function(data) {
    visualize(data)
    });

// 3. Create our visualization function
// ====================================
// We called a "visualize" function on the data obtained with d3's .csv method.
// This function handles the visual manipulation of all elements dependent on the data.
function visualize(theData) {
// PART 1: Essential Local Variables and Functions
// =================================
// curX and curY will determine what data gets represented in each axis.
// We designate our defaults here, which carry the same names
// as the headings in their matching .csv data file.
    var curX = "poverty";
    var curY = "obesity";

    var xMin;
    var xMax;
    var yMin;
    var yMax;

// This function allows us to set up tooltip rules (see d3-tip.js).
    var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
        // x key
        var xValue;
        // Grab the state name.
        var stateName = "<div>" + d.state + "</div>";
        // Snatch the y value's key and value.
        var yValue = "<div>" + curY + ": " + d[curY] + "%</div>";
        // If the x key is poverty
        if(curX === "poverty") {
            // Grab the x key and a version of the value formatted to show percentage
            xValue = "<div>" + curX + ": " + d[curX] + "%</div>";
        }
        else {
            xValue = "<div>" + curX + ": " + 
            parseFloat(d[curX]).toLocaleString("en") + 
            "</div>";
        }
        return stateName + xValue + yValue;
    });

svg.call(toolTip);

function xMinMax() {
    xMin = d3.min(theData, function(d) {
        return parseFloat(d[curX]) * 0.90;
    });

    xMax = d3.max(theData, function(d) {
        return parseFloat(d[curX]) * 1.10;
    });
}
function yMinMax() {
    yMin = d3.min(theData, function(d) {
        return parseFloat(d[curY]) * 0.90;
    });

    yMax = d3.max(theData, function(d) {
        return parseFloat(d[curY]) * 1.10;
    });
}

function labelChange(axis, clickedText) {
    d3
    .selectAll(".aText")
    .filter("." + axis)
    .filter(".active")
    .classed("active", false)
    .classed("inactive", true);

    clickedText.classed("inactive", false).classed("active", true);
}

xMinMax();
yMinMax();

var xScale = d3
.scaleLinear()
.domain([xMin, xMax])
.range([margin + labelArea, width - margin]);

var yScale = d3
.scaleLinear()
.domain([yMin, yMax])
.range([height - margin - labelArea, margin]);

var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);

function tickCount() {
    if (width <= 500) {
        xAxis.ticks(5);
        yAxis.ticks(5);
    }
    else {
        xAxis.ticks(10);
        yAxis.ticks(10);
    }
}
tickCount();

svg
.append("g")
.call(xAxis)
.attr("class", "xAxis")
.attr("transform", "translate(0," + (height - margin - labelArea) + ")");

svg
.append("g")
.call(yAxis)
.attr("class", "yAxis")
.attr("transform", "translate(" + (margin + labelArea) + ", 0)");

var theCircles = svg.selectAll("g theCircles").data(theData).enter();

theCircles
.append("circle")
.attr("cx", function(d) {
    return xScale(d[curX]);
})
.attr("cy", function(d) {
    return yScale(d[curY]);
})
.attr("r", markerRadius)
.attr("class", function(d) {
    return "stateCircle" + d.abbr;
})
.on("mouseover", function(d) {
    toolTip.show(d, this);
    d3.select(this).style("stroke", "#323232");
})
.on("mouseout", function(d) {
    toolTip.hide(d);
    d3.select(this).style("stroke", "#e3e3e3");
});

theCircles
.append("text")
.text(function(d) {
    return d.abbr;
})
.attr("dx", function(d) {
    return xScale(d[curX]);
})
.attr("dy", function(d) {
    return yScale(d[curY]) + markerRadius / 2.5;
})
.attr("font-size", markerRadius)
.attr("class", "stateText")
.on("mouseover", function(d) {
    toolTip.show(d);
    d3.select("." + d.abbr).style("stroke", "#323232");
})
.on("mouseout", function(d) {
    toolTip.hide(d);
    d3.select("." + d.abbr).style("stroke", "#e3e3e3");
});

d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);

    if(self.classed("inactive")) {
        var axis = self.attr("data-axis");
        var name = self.attr("data-name");

        if (axis === "x") {
            curX = name;
            console.log(curX)

            xMinMax();

            xScale.domain([xMin, xMax]);

            svg.select(".xAxis").transition().duration(300).call(xAxis);

            d3.selectAll("circle").each(function() {
                d3
                .select(this)
                .transition()
                .attr("cx", function(d) {
                    return xScale(d[curX]);
                })
                .duration(300);
            });

            d3.selectAll(".stateText").each(function() {
                d3
                .select(this)
                .transition()
                .attr("dx", function(d) {
                    return xScale(d[curX]);
                })
                .duration(300);
            });

            labelChange(axis, self);
        }
        else {
            curY = name;
            console.log(curY)

            yMinMax();

            yScale.domain([yMin, yMax]);

            svg.select(".yAxis").transition().duration(300).call(yAxis);

            d3.selectAll("circle").each(function() {
                d3
                .select(this)
                .transition()
                .attr("dy", function(d) {
                    return yScale(d[curY]) + markerRadius / 3;
                })
                .duration(300);
            });
            labelChange(axis, self);
        }
    }
});
}

