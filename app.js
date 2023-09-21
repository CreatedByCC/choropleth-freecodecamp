import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

function drawMap(countyData, eduData) {
  //dimensions
  const width = 1000;
  const height = 600;

  const path = d3.geoPath();    // converting to geo-data

  const color = d3.scaleThreshold()     //color scale
  .domain(d3.range(0, 70, 70 / 8))    //range 0 - 70 (%) divided by 8 colours
  .range(d3.schemeYlGnBu[9]);
  //console.log(color(0));

  const canvas = d3.select('#canvas')   
    .attr('width', width)             // set the height and width - otherwise only a portion of the map shows
    .attr('height', height);

  // tooltip
  const tooltip = d3.select('#tooltip')
    .style('opacity', 0); 
  
  // draw the map
  canvas.append('g')
    .selectAll('path')
    .data(topojson.feature(countyData, countyData.objects.counties).features)   //converting it to topojson so that the map can be draw
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'county')
    .attr('fill', (d) => {
      let id = d['id'];
      let county = eduData.find((item) => item['fips'] === id);   // looking for the county in the eduData json file that matches the id in the county json file
      return color(county['bachelorsOrHigher']);    // passing the percentage into color to apply the colour based on the range it falls in
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
        .style('left', `${e.pageX + 10}px`)     // finds the location (x & y) of the mouse pointer on the page
        .style('top', `${e.pageY - 28}px`);
      tooltip.attr('data-education', county['bachelorsOrHigher']);
  })
    .on('mouseout', (d) => {
      tooltip.transition().style('opacity', 0);
  }); 

  // legend
  const xScale = d3.scaleLinear()
    .domain([0, 70])
    .range([0, 300])

  const legend = d3.select('#legend')
    .attr('transform', `translate(250, -650)`);     // moving the legend so that is above my map
  
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
    .style("text-anchor", "left")     // this helped to not cut of the text of the scale on the left
    .style('font-size', '0.6rem')
    .text((d) => Math.round(d) + '%');    //removing the decimals

}

async function getData() {
    const countyReq = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json");
    const countyData = await countyReq.json();

    const eduDataReq = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");
    const eduData = await eduDataReq.json();

    //console.log(eduData[0].bachelorsOrHigher);
    drawMap(countyData, eduData);
  };
  
  getData();