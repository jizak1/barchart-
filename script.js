async function createBarChart() {
    // Fetch data
    const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json');
    const data = await response.json();
    
    // Set up dimensions
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = Math.min(1000, window.innerWidth - 100) - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data.data, d => new Date(d[0])))
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.data, d => d[1])])
        .range([height, 0]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .ticks(d3.timeYear.every(5));
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat(d => `$${d.toLocaleString()}B`);
    
    // Add x-axis
    svg.append('g')
        .attr('id', 'x-axis')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
    
    // Add y-axis
    svg.append('g')
        .attr('id', 'y-axis')
        .attr('class', 'axis')
        .call(yAxis);
    
    // y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#64748b')
        .text('Gross Domestic Product (Billions)');
    
    // Tooltip
    const tooltip = d3.select('#tooltip');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data.data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(new Date(d[0])))
        .attr('y', d => yScale(d[1]))
        .attr('width', width / data.data.length)
        .attr('height', d => height - yScale(d[1]))
        .attr('data-date', d => d[0])
        .attr('data-gdp', d => d[1])
        .on('mouseover', function(event, d) {
            const date = new Date(d[0]);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            tooltip
                .style('display', 'block')
                .style('left', `${event.pageX + 15}px`)
                .style('top', `${event.pageY - 15}px`)
                .attr('data-date', d[0])
                .html(`
                    <strong>${formattedDate}</strong><br>
                    GDP: $${d[1].toLocaleString()} Billion
                `);
            
            d3.select(this)
                .style('opacity', 0.8);
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
            d3.select(this)
                .style('opacity', 1);
        });
    
    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat('')
        )
        .style('stroke-dasharray', '3,3')
        .style('stroke-opacity', 0.1);
}

// Callinf the function when the page loads
document.addEventListener('DOMContentLoaded', createBarChart);

// Handle window resize
window.addEventListener('resize', () => {
    document.getElementById('chart').innerHTML = '';
    createBarChart();
});