import { select, text } from 'd3';
import './style.scss';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { KEYS as K, COLORS } from '../../globals/constants';
import { getUniqueID } from '../../globals/helpers';

export default class List {
  constructor(store, globalUpdate) {
    this.store = store;
    this.globalUpdate = globalUpdate;
    this.loadIcon();
  }

  async loadIcon() {
    // source: https://github.com/parcel-bundler/parcel/issues/4222
    const iconPath = require('url:../../../assets/icon.svg')
    this.icon = await text(iconPath);
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
      .attr('class', 'listItemRow')
      .attr('data-id', (d) => getUniqueID(d));

    // placeholder for promise that comes later
    this.listItems
      .append('div')
      .attr('class', 'listItemIcon');

    this.listItems
      .append('span')
      .attr('class', 'listItem')
      .text((d) => d[K.NAME])
      .on('click', (d) => {
        this.store.dispatch(Act.setSelected(d));
        this.globalUpdate();
      });

    this.listItems
      .select('.listItemIcon')
      .html(this.icon)
      .attr('width', '30px')
      .attr('height', '30px')
      .style('stroke', (d) => COLORS[d[K.CAT]])
      .select('.map-point')
      .style('fill', (d) => COLORS[d[K.CAT]]);
  }

  removeData() {
    // console.log('data removed from list');
    if (this.wrapper) {
      this.wrapper.remove();
    }
  }

  draw() {
    const selected = Sel.getSelectedUniqueID(this.store.getState());
    const inBuffer = Sel.getInBuffer(this.store.getState());

    // add in buffer and selected classes for styling
    this.listItems
      .classed('inBuffer', (d) => inBuffer.includes(getUniqueID(d)))
      .classed('selected', (d) => selected === getUniqueID(d));
  }
}
