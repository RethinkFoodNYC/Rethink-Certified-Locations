import { select } from 'd3';
import './style.scss';

export default class List {
  constructor(setGlobalState) {
    this.setGlobalState = setGlobalState;
  }

  addData(data) {
    console.log('data added to list');

    // const table = select("#list")
    //   .append('table')

    // const header = table.append('thead')

    // const body = table.selectAll('tr')
    //   .data(data)
  }
  
  removeData(data) {
    console.log('data removed from list');
  }

  draw(state) {
    console.log('list is drawing!', state);
    // make selected BOLD
  }
}
