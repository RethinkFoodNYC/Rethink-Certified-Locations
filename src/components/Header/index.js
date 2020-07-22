import './style.scss';
import { select } from 'd3';

export default class Header {
  constructor() {
    const parent = select('#header');

    parent
      .append('a')
      .attr('class', 'logo')
      .attr('href', 'https://www.rethinkfood.nyc/');
  }
}
