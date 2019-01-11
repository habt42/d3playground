import * as d3 from 'd3'

export default () => d3.json('data/revenues.json').then(data => {
  data.forEach(d => {
    d.revenue = +d.revenue
    d.profit = +d.profit
  })

  const margin = {
    left: 100,
    right: 10,
    top: 10,
    bottom: 150,
  }

  let time = d3.transition().duration(750)

  const width = 700 - margin.left - margin.right
  const height = 450 - margin.top - margin.bottom

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.2)

  const y = d3.scaleLinear()
    .range([height, 0])

  const xAxis = g.append('g')
    .attr('transform', `translate(0, ${height})`)

  const yAxis = g.append('g')

  // y axis label
  const yLabel = g.append('text')
    .attr('x', -(height / 2))
    .attr('y', -60)
    .attr('font-size', '20px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Revenue')

  // x axis label
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, ${height + 40})`)
    .attr('font-size', '20px')
    .text('Month')

  let currentKey = 'revenue'
  d3.interval(() => {
    let newData
    if (currentKey === 'revenue') {
      newData = data.slice(1)
      currentKey = 'profit'
    } else {
      newData = data
      currentKey = 'revenue'
    }
    update(newData, currentKey)
  }, 1000)

  update(data, currentKey)

  function update(data, key) {
    x.domain(data.map(d => d.month))
    y.domain([0, d3.max(data, d => d[key])])

    const xAxisCall = d3.axisBottom(x)
    const yAxisCall = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${d}`)
    xAxis.transition(time).call(xAxisCall)
    yAxis.transition(time).call(yAxisCall)

    yLabel.transition(time).text(key.replace(/^(.)/, (match, first) => first.toUpperCase()))
    const rects = g.selectAll('rect').data(data, d => d.month)

    rects.exit()
      .transition(time)
        .attr('y', y(0))
        .attr('height', 0)
      .remove()

    rects.enter()
      .append('rect')
        .attr('x', d => x(d.month))
        .attr('y', y(0))
        .attr('width', x.bandwidth)
        .attr('height', 0)
        .attr('fill', 'gray')
      .merge(rects)
      .transition(time)
        .attr('x', d => x(d.month))
        .attr('width', x.bandwidth)
        .attr('height', d => height - y(d[key]))
        .attr('y', d => y(d[key]))
  }
})
