// 1. Setup the canvas
const width = 600;
const height = 600;
const radius = Math.min(width, height) / 2 - 40;

// Clear existing SVG
d3.select("#chart-container").html("");

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// VINYL BACKGROUND
svg.append("circle")
    .attr("r", radius)
    .attr("fill", "#222")
    .attr("stroke", "#444")
    .attr("stroke-width", 2);

// CENTER HOLE
svg.append("circle")
    .attr("r", 15)
    .attr("fill", "#111");

// 2. Load Data
d3.json("data/nirvana.json").then(data => {
    
    // 3. Scales
    const angleScale = d3.scaleBand()
        .domain(data.map(d => d.song))
        .range([0, 2 * Math.PI])
        .align(0);

    const radiusScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.streams)])
        .range([40, radius - 20]); // Start after the "hole"

    // NEON COLOR SCALE
    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(data, d => d.streams)])
        .interpolator(d3.interpolateCool);

    // 4. Draw Bars
    const bars = svg.append("g")
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("fill", d => colorScale(d.streams))
        .attr("d", d3.arc()
            .innerRadius(40)
            .outerRadius(d => radiusScale(d.streams))
            .startAngle(d => angleScale(d.song))
            .endAngle(d => angleScale(d.song) + angleScale.bandwidth())
            .padAngle(0.02)
            .padRadius(40)
        );

    // 5. Labels (FIXED ROTATION)
    svg.append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("text-anchor", d => (angleScale(d.song) + angleScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start")
        .attr("transform", d => {
            const angle = (angleScale(d.song) + angleScale.bandwidth() / 2) * 180 / Math.PI - 90;
            const outerR = radiusScale(d.streams) + 10;
            return `rotate(${angle}) translate(${outerR},0) ${angle > 90 ? "rotate(180)" : ""}`;
        })
        .append("text")
        .text(d => d.song)
        .attr("transform", d => (angleScale(d.song) + angleScale.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "")
        .style("font-size", "11px")
        .style("fill", "#ddd")
        .style("font-family", "Arial, sans-serif")
        .attr("alignment-baseline", "middle");

    // HOVER INTERACTION
    // Add a text element for the tooltip in the center
    const tooltip = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("fill", "white")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    bars.on("mouseover", function(event, d) {
        d3.select(this).attr("fill", "white"); // Highlight bar
        tooltip.text(d.streams + "B");         // Show number
    })
    .on("mouseout", function(event, d) {
        d3.select(this).attr("fill", colorScale(d.streams)); // Restore color
        tooltip.text("");                                    // Hide number
    });

});



