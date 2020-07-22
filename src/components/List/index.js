import { select, text } from 'd3';
import './style.scss';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { KEYS as K } from '../../globals/constants';
import { getUniqueID } from '../../globals/helpers';

const colorLookup = { // TODO: make a color scale
  RRP: '#e629af',
  CBOs: '#e38944',
};

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

    // source: https://github.com/parcel-bundler/parcel/issues/4222
    const iconPath = require('url:../../../assets/icon.svg')

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

    // read the svg text from the icon path then set it as the HTML in the svg
    text(iconPath).then((icon) => {
      const iconG = this.listItems
        .select('.listItemIcon')
        .html(icon)
        .attr('width', '30px')
        .attr('height', '30px')
        .style('stroke', (d) => colorLookup[d[K.CAT]]);

      iconG.select('.map-point')
        .style('fill', (d) => colorLookup[d[K.CAT]]);
    });
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
      .filter((d) => inBuffer.includes(getUniqueID(d)))
      .classed('inBuffer', true);

    this.listItems
      .filter((d) => selected === getUniqueID(d))
      .classed('selected', true);

    // remove old classes if they exist
    this.listItems
      .filter((d) => !inBuffer.includes(getUniqueID(d)))
      .classed('inBuffer', false);

    this.listItems
      .filter((d) => selected !== getUniqueID(d))
      .classed('selected', false);
  }
}
