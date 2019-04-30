var svgWidth = 1000;
var svgHeight = 500;

var margin = 25;

var labelArea = 100;

var tPadBot = 50;
var tPadLeft = 50;

var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

var markerRadius;
function crGet() {
    if(svgWidth <= 500) {
        markerRadius = 5;
    }
    else {
        markerRadius = 10;
    }
}
crGet();

svg.append("g").attr("class", "xText");

var xText = d3.select(".xText");

function xTextRefresh() {
    xText
    .attr(
        "transform",
        "translate(" + 
        ((svgWidth - labelArea) / 2 + labelArea) +
        ", " + 
        (svgHeight - margin - tPadBot) +
        ")"
    );
}
xTextRefresh();

xText
.append("text")
.attr("y", 20)
.attr("data-name", "poverty")
.attr("data-axis", "x" )
.attr("class", "aText active x")
.text("Percent in Poverty")

xText
.append("text")
.attr("y", 0)
.attr("data-name", "age")
.attr("data-axis", "x" )
.attr("class", "aText inactive x")
.text("Median Age")

xText
.append("text")
.attr("y", -20)
.attr("data-name", "income")
.attr("data-axis", "x" )
.attr("class", "aText inactive x")
.text("Median Household Income")

var leftTextX = margin + tPadLeft;
var leftTextY = (svgHeight + labelArea) / 2 - labelArea;

svg.append("g").attr("class", "yText");

var yText = d3.select(".yText");

function yTextRefresh() {
    yText.attr(
        "transform",
        "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
}
yTextRefresh();

yText
.append("text")
.attr("y", -20)
.attr("data-name", "obesity")
.attr("data-axis", "y")
.attr("class", "aText active y")
.text("Percent Obese");

yText
.append("text")
.attr("y", 0)
.attr("data-name", "smokes")
.attr("data-axis", "y")
.attr("class", "aText inactive y")
.text("Percent Smoker");

yText
.append("text")
.attr("y", 20)
.attr("data-axis", "y")
.attr("data-name", "healthcare")
.attr("class", "aText inactive y")
.text("Percent Lacking Healthcare");

d3.csv("../assets/data/data.csv").then(function(data) {
    visualize(data);
  });

function visualize(theData) {
    var curX = "poverty";
    var curY = "obesity";

    var xMin;
    var xMax;
    var yMin;
    var yMax;

    var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offest([40, -60])
    .html(function(d) {
        var xValue;
        var State = "<div>" + d.state + "</div>";
        var yValue = "<div>" + curY + ": " + d[curY] + "%</div>";
        if(curX === "poverty") {
            xValue = "<div>" + curX + ": " + d[curX] + "%</div>";
        }
        else {
            xValue = "<div>" + curX + ": " + 
            parseFloat(d[curX]).toLocaleString("en") + 
            "</div>";
        }
        return State + xValue + yValue;
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
    .clased("inactive", true);

    clickedText.classed("inactive", false).classed("active", true);
}

xMinMax();
yMinMax();

var xScale = d3
.scaleLinear()
.domain([xMin, xMax])
.range([margin + labelArea, svgWidth - margin]);

var yScale = d3
.scaleLiner()
.domain([yMin, yMax])
.range([svgHeight - margin - labelArea, maring]);

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
.attr("transform", "translate(" + (margin + labelArea) + ", 0");

var Circles = svg.selectAll("g Circles").data(theData).enter();

Circles
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

Circles
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

