import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

function drawMap(countyData, eduData) {
  //dimensions
  const width = 1000;
  const height = 600;

  const path = d3.geoPath();

  const color = d3.scaleThreshold()
  .domain(d3.range(0, 70, (70 - 0) / 8))
  .range(d3.schemeYlGnBu[9]);
  //console.log(color(0));

  const canvas = d3.select('#canvas')
    .attr('width', width)
    .attr('height', height);

    // tooltip
  const tooltip = d3.select('#tooltip')
    .style('opacity', 0); 
  
  // draw the map
  canvas.append('g')
    .selectAll('path')
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'county')
    .attr('fill', (d) => {
      let id = d['id'];
      let county = eduData.find((item) => item['fips'] === id);
      return color(county['bachelorsOrHigher']);
    })
    .attr('data-fips', (d) => d['id'])
    .attr('data-education', (d) => {
      let id = d['id'];
      let county = eduData.find((item) => item['fips'] === id);
      return county['bachelorsOrHigher'];
    })
    .on('mouseover', (e, d) => {
      let id = d['id'];
      let county = eduData.find((item) => item['fips'] === id);

      tooltip.transition().style('opacity', 0.9);
      tooltip
        .html(`${county['area_name']}, ${county['state']}: ${county['bachelorsOrHigher']}%`)
        .style('left', `${e.pageX + 10}px`)
        .style('top', `${e.pageY - 28}px`);
      tooltip.attr('data-education', county['bachelorsOrHigher']);
  })
    .on('mouseout', (d) => {
      tooltip.transition().style('opacity', 0);
  }); 

  // legend
  const legend = d3.select('#legend')
    .attr('transform', `translate(250, -650)`);
  
  legend.selectAll('rect')
    .data(color.domain())
    .enter()
    .append('rect')
    .attr("x", (d, i) => i * 30)
    .attr("y", 50)
    .attr("width", 30)
    .attr("height", 10)
    .style("fill", color);

  legend.selectAll("text")
    .data(color.domain())
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 30)
    .attr("y", 72)
    .style("text-anchor", "left")
    .style('font-size', '0.6rem')
    .text((d) => Math.round(d) + '%');

}

async function getData() {
    const countyReq = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
    const countyData = await countyReq.json();

    const eduDataReq = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
    const eduData = await eduDataReq.json();

    //console.log(topojson.feature(countyData, countyData.objects.counties).features);
    //console.log(eduData[0].bachelorsOrHigher);
    drawMap(countyData, eduData);
  };
  
  getData();