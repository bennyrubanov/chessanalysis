import * as d3 from 'd3';

export class Openings {
  container: any;
  private _options: any;
  dispatch: any;
  private _partition: any;
  private _arc: any;
  dataContainer: any;
  private _data: any;
  x0: any;
  dx0: any;

  constructor(selector: any, options: any, data: any) {
    //container setup
    this.container = d3.select(selector);

    let defaultOptions = {
      width: 550,
      height: 550,
      colors: (d3 as any).scale.category10(),
      arcThreshold: 0.01,
      textThreshold: 0.1,
    };

    options = options || {};
    this._options = { ...defaultOptions, ...options };

    //event dispatcher
    this.dispatch = d3.dispatch('mouseenter', 'mousemove', 'mouseleave');

    this._partition = (d3 as any).layout
      .partition()
      .sort(null)
      .value((d: any) => d.count);

    let radius = Math.min(this._options.width, this._options.height) / 2;

    let xScale = (d3 as any).scale.linear().range([0, 2 * Math.PI]);
    let yScale = (d3 as any).scale.sqrt().range([0, radius]);

    this._arc = (d3 as any).svg
      .arc()
      .startAngle((d: any) => Math.max(0, Math.min(2 * Math.PI, xScale(d.x))))
      .endAngle((d: any) =>
        Math.max(0, Math.min(2 * Math.PI, xScale(d.x + d.dx)))
      )
      .innerRadius((d: any) => Math.max(0, yScale(d.y)))
      .outerRadius((d: any) => Math.max(0, yScale(d.y + d.dy)));

    this.dataContainer = this.container
      .append('svg')
      .attr('width', this._options.width)
      .attr('height', this._options.height)
      .append('g')
      .attr(
        'transform',
        'translate(' +
          this._options.width / 2 +
          ',' +
          this._options.height / 2 +
          ')'
      );

    if (data) {
      this.data(data);
    }
  }

  data(data: any) {
    this._data = data;

    this.update();
  }

  options(options: any) {
    const omittedOptions = { ...options };
    delete omittedOptions.width;
    delete omittedOptions.height;

    this._options = { ...this._options, ...omittedOptions };

    this.update();
  }

  update() {
    let self = this;

    let nodes = this._partition
      .nodes(this._data)
      .filter((d: any) => d.dx > this._options.arcThreshold);

    let arcs = this.dataContainer.selectAll('.arc').data(nodes);

    arcs
      .enter()
      .append('path')
      .attr('display', (d: any) => (d.depth ? null : 'none'))
      .attr('d', this._arc)
      .attr('fill-rule', 'evenodd')
      .attr('class', 'arc')
      .each((d: any) => {
        this.x0 = 0;
        this.dx0 = 0;
      })
      .style('fill', fillColor);

    arcs
      .on('mouseenter', (d: any, i: any) => {
        let parents = getParents(d);

        arcs.style('opacity', 0.3);
        arcs
          .filter((node: any) => parents.indexOf(node) > -1)
          .style('opacity', 1);

        let moves = parents.map((mv) => mv.san);
        this.dispatch.mouseenter(d, moves);
      })
      .on('mousemove', () => {
        this.dispatch.mousemove();
      })
      .on('mouseleave', () => {
        arcs.style('opacity', 1);

        this.dispatch.mouseleave();
      })
      .transition()
      .duration(500)
      .attrTween('d', (d: any) => {
        var interpolate = d3.interpolate(
          {
            x: this.x0,
            dx: this.dx0,
          },
          d
        );

        this.x0 = d.x;
        this.dx0 = d.dx;

        return function (t: any) {
          var b = interpolate(t);
          return self._arc(b);
        };
      })
      .style('fill', fillColor);

    arcs.exit().remove();

    let sanText = this.dataContainer.selectAll('.san').data(nodes);
    sanText
      .enter()
      .append('text')
      .attr('class', 'san')
      .attr('dy', '6')
      .attr('text-anchor', 'middle');

    sanText
      .transition()
      .duration(500)
      .attr('transform', (d: any) => 'translate(' + this._arc.centroid(d) + ')')
      .text((d: any) => {
        if (d.dx < this._options.textThreshold) return '';

        return d.depth ? d.san : '';
      });

    sanText.exit().remove();

    function fillColor(d: any, i: any): any {
      if (i === 0) return;

      let rootParent = getParents(d)[0];
      let color = d3.hsl(self._options.colors(rootParent.san));

      if (d.depth % 2 === 0) {
        color = color.darker(0.5);
      } else {
        color = color.brighter(0.5);
      }

      color = color.darker(d.depth * 0.2);
      return color;
    }
  }
}

function getParents(node: any) {
  let path = [];
  let current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}
