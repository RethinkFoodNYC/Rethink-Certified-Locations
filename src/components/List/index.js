import { select } from 'd3';
import './style.scss';
import { KEYS as K } from '../../globals/constants';

export default class List {
  constructor(setGlobalState) {
    this.setGlobalState = setGlobalState;
  }

  addData(data) {
    console.log('data added to list');
    // console.log('data', data);

    const table = select('#list');

    const header = table
      .append('thead')
      .data(data);

    header
      .append('th')
      .text('List View');

    header
      .append('tr')
      .selectAll('th')
      .data((d) => Object.keys(d))
      .join('td')
      .text((d) => d);

    this.body = table
      .append('tbody')
      .selectAll('tr')
      .data(data)
      .join('tr');

    this.body
      .selectAll('td')
      .data((d) => Object.values(d))
      .join('td')
      .text((d) => d);
  }

  removeData(data) {
    console.log('data removed from list');
  }

  draw(state) {
    console.log('list is drawing!', state);
    // make selected BOLD *** if there is a selection
    this.body.classed('selected', (d) => (state.selected && state.selected[K.REST_ADDRESS] === d[K.REST_ADDRESS])); // Address seems like a unique ID, but it may also make sense to have a concise key for each point
    this.body.classed('inBuffer', (d) => (state.inBuffer.includes(d[K.REST_ADDRESS])));
    this.body.classed('notInBuffer', (d) => !(state.inBuffer.includes(d[K.REST_ADDRESS])));
  }
}
