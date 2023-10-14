import * as d3 from 'd3';
import * as _ from 'lodash';
import * as util from './util';

export class MovePaths {
  container: any;
  private _options: any;
  dataContainer: any;
  private _data: any;

  constructor(selector: any, options: any, data: any) {
    //container setup
    this.container = d3.select(selector);

    //options
    let defaultOptions = {
      width: 500,
      margin: 20,
      accessor: 'Nb1',
      binSize: 1,
      pointRandomizer: (d3 as any).random.normal(3, 1),
      bezierRandomizer: (d3 as any).random.normal(12, 4),
      bezierScaleFactor: 2,
    };

    options = options || {};
    this._options = { ...defaultOptions, ...options };

    this._options.boardWidth = this._options.width - this._options.margin * 2;
    this._options.squareWidth = Math.floor(this._options.boardWidth / 8);

    //clear element
    this.container.selectAll('*').remove();

    //root svg
    let root = this.container
      .append('svg')
      .attr('width', this._options.width + 'px')
      .attr('height', this._options.width + 'px')
      .attr('class', 'graph');
    //margins applied
    let svg = root
      .append('g')
      .attr(
        'transform',
        'translate(' + this._options.margin + ',' + this._options.margin + ')'
      )
      .attr('class', 'board');
    util.drawBoard(svg, this._options.squareWidth);

    //container for heatmap data
    this.dataContainer = svg.append('g').attr('class', 'data-container');

    if (data) {
      this.data(data);
    }
  }

  data(data: any) {
    this._data = data;

    this.update();
  }

  options(options: any) {
    let omit = ['width', 'margin', 'boardWidth', 'squareWidth'];
    const omittedOptions = { ...options };
    omit.forEach((o) => {
      delete omittedOptions[o];
    });

    this._options = { ...this._options, ...omittedOptions };

    this.update();
  }

  update() {
    let self = this;
    let data: any[] = [];

    _.toPairs(this._data[this._options.accessor]).forEach((d: any) => {
      let bin = Math.ceil(d[1] / this._options.binSize);

      for (let i = 0; i < bin; i++) {
        data.push(d[0]);
      }
    });

    this.dataContainer.selectAll('.move-path').remove();

    this.dataContainer
      .selectAll('.move-path')
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'move-path')
      .attr('d', (d: any) => {
        //start and end points
        let [s, e] = getSquareCoords(d);

        //the orthogonal vector for vector [s, e]
        //used for the bezier control point
        let orthogonal = {
          x: -(e.y - s.y),
          y: e.x - s.x,
        };

        //get norm (magnitude) of orthogonal
        let norm = Math.sqrt(
          Math.pow(orthogonal.x, 2) + Math.pow(orthogonal.y, 2)
        );
        //scale factor to determine distance of control point from the end point
        let scaleFactor =
          Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)) /
          this._options.bezierScaleFactor;

        //transform the orthogonal vector
        orthogonal.x /= norm;
        orthogonal.y /= norm;

        orthogonal.x *= scaleFactor;
        orthogonal.y *= scaleFactor;

        let controlPoint;

        //determine which side the control point should be
        //with respect to the orthogonal vector
        if (e.x < s.x) {
          controlPoint = {
            x: e.x + orthogonal.x,
            y: e.y + orthogonal.y,
          };
        } else {
          controlPoint = {
            x: e.x - orthogonal.x,
            y: e.y - orthogonal.y,
          };
        }

        //randomize the start, end and controlPoint a bit
        s.x += this._options.pointRandomizer();
        s.y += this._options.pointRandomizer();
        e.x += this._options.pointRandomizer();
        e.y += this._options.pointRandomizer();
        controlPoint.x += this._options.bezierRandomizer();
        controlPoint.y += this._options.bezierRandomizer();

        //construct the bezier curve
        let str = `M${s.x},${s.y}, Q${controlPoint.x},${controlPoint.y} ${e.x},${e.y}`;
        return str;
      });

    //get coordinates of squares from keys such as "e2-e4"
    function getSquareCoords(d: any) {
      let squares = [];

      for (let i = 0; i < 2; i++) {
        let square = d.split('-')[i].toLowerCase();

        let file = square.charCodeAt(0) - 97;
        let rank = 8 - square[1];

        let x =
          file * self._options.squareWidth + self._options.squareWidth / 2;
        let y =
          rank * self._options.squareWidth + self._options.squareWidth / 2;

        squares.push({
          x,
          y,
        });
      }

      return squares;
    }
  }
}
