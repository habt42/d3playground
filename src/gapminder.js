import * as d3 from 'd3'
import createTip from 'd3-tip'
export default () => d3.json('data/population.json').then(data => {
  
  // console.log(data)

  const margin = {
    left: 100,
    right: 10,
    top: 10,
    bottom: 150,
  }

  const width = 800 - margin.left - margin.right
  const height = 500 - margin.top - margin.bottom

  const svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const x = d3.scaleLog()
    .domain([142, 150000])
    .range([0, width])
    .base(10)

  const y = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0])

  const z = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25 * Math.PI, 1500 * Math.PI])

  const colors = d3.scaleOrdinal(d3.schemePastel1)

  const xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));

  const yAxisCall = d3.axisLeft(y)
  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall)

  g.append('g')
    .call(yAxisCall)

  // legend
  const continients = ['asia', 'europe', 'americas', 'africa']
  const legendGroup = g.append('g')
    .attr('transform', `translate(${width - 10}, ${height - 130})`)
  continients.forEach((c, i) => {
    const row = legendGroup.append('g')
      .attr('transform', `translate(0, ${i * 20})`)

    row.append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', colors(c))

    row.append('text')
      .attr('text-anchor', 'end')
      .attr('x', -10)
      .attr('y', 10)
      .style('text-transform', 'capitalize')
      .text(c)
  })

  // y axis label
  g.append('text')
    .attr('x', -(height / 2))
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Life Expectancy (Years)')

  // x axis label
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, ${height + 40})`)
    .attr('font-size', '20px')
    .text('GDP Per Capita ($)')
  
  const yearLabel = g.append('text')
    .attr('text-anchor', 'end')
    .attr('font-size', '22px')
    .attr('fill', 'gray')
    .attr('transform', `translate(${width}, ${height - 30})`)

  const tip = createTip().attr('class', 'd3-tip')
    .html(d => {
      return `
        <strong>Country: </strong>
        <span
          style='color:red'
        >
          ${d.country}
        </span>
        <br/>
        <strong>Continent:</strong>
        <span
          style='color:red;text-transform:capitalize'
        >
          ${d.continent}
        </span>
        <br/>
        <strong>Life Expectancy:</strong>
        <span
          style='color:red'
        >
          ${d3.format('.2f')(d.life_exp)}
        </span>
        <br/>
        <strong>GPD:</strong>
        <span
          style='color:red'
        >
          ${d3.format('$,.0f')(d.income)}
        </span>
        <br/>
        <strong>Population:</strong>
        <span
          style='color:red'
        >
          ${d3.format(',.0f')(d.population)}
        </span>
        <br/>
      `
    })
  g.call(tip)

  let i = 0
  const interval = d3.interval(() => {
    if (i >= data.length) {
    // if (i >= 1) {
      interval.stop()
      return
    }

    const purgedData = data[i].countries.filter(d => {
      return d.income !== null && d.life_exp !== null
    })

    yearLabel.text(data[i].year)

    const circles = g.selectAll('circle')
      .data(purgedData, d => d.country)
    
    circles.exit().remove()

    circles.enter().append('circle')
      .attr('fill', d => colors(d.continent))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .merge(circles)
        .attr('cx', d => x(d.income))
        .attr('cy', d => y(d.life_exp))
        .attr('r', d => {
          const area = z(d.population)
          return Math.sqrt((area / Math.PI))
        })
    
    i++
  }, 150)
})
