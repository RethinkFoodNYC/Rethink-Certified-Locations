import { select } from 'd3';
import './style.scss';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { KEYS as K, STATE as S } from '../../globals/constants';

export default class List {
  constructor(store, globalUpdate) {
    this.store = store;
    this.globalUpdate = globalUpdate;
  }

  addData() {
    // get data from store
    const data = Sel.getData(this.store.getState());

    // dynamically add all categories to store as "on"
    this.store.dispatch(Act.initCategories(
      data.map(([cat, _]) => cat),
    ));

    const parent = select('#list');

    this.wrapper = parent
      .selectAll('div.wrapper')
      .data(data)
      .join('div')
      .attr('class', 'wrapper');

    this.category = this.wrapper
      .selectAll('div.category')
      .data((d) => [d])
      .join('div')
      .attr('class', 'category')
      .html(([name, items]) => `<span><span class="name">${name}</span> <span class="count">(${items.length})</span></span>`)
      .on('click', function () {
        this.parentNode.classList.toggle('isOpen');
      });

    this.body = this.wrapper
      .append('div')
      .attr('class', 'body');

    this.listItems = this.body
      .selectAll('div.listItem')
      .data(([_, items]) => items)
      .join('div')
      .attr('class', 'listItem')
      .text((d) => d[K.NAME])
      .on('click', (d) => {
        this.store.dispatch(Act.setSelected(d));
        this.globalUpdate();
      });
  }

  removeData() {
    // console.log('data removed from list');
    if (this.wrapper) {
      this.wrapper.remove();
    }
  }

  draw() {
    const selected = Sel.getSelected(this.store.getState());
    const inBuffer = Sel.getInBuffer(this.store.getState());
  }
}
