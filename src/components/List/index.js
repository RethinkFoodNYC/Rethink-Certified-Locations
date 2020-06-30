import { select } from 'd3';
import './style.scss';

export default class List {
  constructor(setGlobalState) {
    this.setGlobalState = setGlobalState;
  }

  addData(data) {
    console.log('data added to list');
    console.log('data', (d) => Object.keys(d));

    const table = select('#list');

    const header = table
      .append('thead')
      .data(data);

    header
      .append('tr')
      .append('th')
      .text('List View');

    header
      .append('tr')
      .selectAll('th')
      .data((d) => Object.keys(d))
      .join('td')
      .text((d) => d);

    const body = table
      .append('tbody')
      .selectAll('tr')
      .data(data)
      .join('tr')
      .append('td');

    body
      .selectAll('td')
      .data((d) => Object.values(d))
      .join('td')
      .text((d) => d);
    // .data(data)
    // .text((d) => d[0].Name);
  }

  removeData(data) {
    console.log('data removed from list');
  }

  draw(state) {
    console.log('list is drawing!', state);
    // make selected BOLD
  }
}
