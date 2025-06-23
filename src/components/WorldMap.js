import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import countries from '../data/countries.json';
import relationships from '../data/relationships.json';

/**
 * WorldMap component
 * Renders a graticule background using d3.geoNaturalEarth1
 * Displays mock countries as blue circles and draws relationship lines
 * Hovering a relationship shows a tooltip describing the connection
 */
function WorldMap() {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const width = 800;
    const height = 400;

    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', 'auto');

    svg.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('d', path);

    // Render countries as circles
    svg.selectAll('circle.country')
      .data(countries)
      .enter()
      .append('circle')
      .attr('class', 'country')
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .attr('cx', d => projection([d.lon, d.lat])[0])
      .attr('cy', d => projection([d.lon, d.lat])[1]);

    // Render relationships as lines
    svg.selectAll('path.relationship')
      .data(relationships)
      .enter()
      .append('path')
      .attr('class', 'relationship')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('d', d => {
        const source = countries.find(c => c.name === d.source);
        const target = countries.find(c => c.name === d.target);
        if (!source || !target) return null;
        return d3.line()([
          projection([source.lon, source.lat]),
          projection([target.lon, target.lat])
        ]);
      })
      .on('mouseover', (event, d) => {
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('display', 'block');
        tooltip.style('left', `${event.pageX + 5}px`);
        tooltip.style('top', `${event.pageY + 5}px`);
        tooltip.html(
          `<div class="title">${d.source} → ${d.target}</div>` +
          `<div class="justification">${d.justification}</div>` +
          (d.links && d.links.length
            ? `<div class="links">${d.links.map(l => `<a href="${l}">${l}</a>`).join(', ')}</div>`
            : '') +
          (d.tags && d.tags.length
            ? `<div class="tags">${d.tags.join(', ')}</div>`
            : '')
        );
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current).style('display', 'none');
      });
  }, []);

  return (
    <div className="world-map-container" style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} className="tooltip" style={{ display: 'none', position: 'absolute' }} />
    </div>
  );
}

export default WorldMap;
