import { select, text } from 'd3';
import './style.scss';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { KEYS as K, COLORS, STATE as S } from '../../globals/constants';
import { getUniqueID } from '../../globals/helpers';

export default class List {
  constructor(store, globalUpdate) {
    this.store = store;
    this.globalUpdate = globalUpdate;
    this.loadIcon();
  }

  async loadIcon() {
    // source: https://github.com/parcel-bundler/parcel/issues/4222
    const iconPath = require('url:../../../assets/icon.svg');
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

    this.categoryRow = this.wrapper
      .selectAll('div.categoryRow')
      .data((d) => [d])
      .join('div')
      .attr('class', 'categoryRow');

    this.category = this.categoryRow
      .selectAll('div.category')
      .data((d) => [d])
      .join('div')
      .attr('class', 'category')
      .html(([name, items]) => `<span><span class="name">${name}</span> <span class="count">(${items.length})</span> `)
      .on('click', function () {
        this.parentNode.parentNode.classList.toggle('isOpen');
      });

    this.toggle = this.categoryRow
      .selectAll('div.toggle')
      .data((d) => [d])
      .join('div') // TODO: position within wrapper to right side, not below
      .attr('class', 'toggle')
      .html(([name]) => `<label class="switch">
         <input type="checkbox" id=${name} checked>
            <span class="slider round"></span>
         </label></span>`)
      .on('click', ([name]) => {
        this.store.dispatch(Act.updateToggle(name)); // is there a simple way to say "toggle" this on/off
        this.globalUpdate();
      })
      .select('span.slider')
      .style('background-color', ([name]) => COLORS[name]);

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
    const toggleStatus = Sel.getToggleStatus(this.store.getState());
    // console.log(toggleStatus);

    // add in buffer and selected classes for styling
    this.listItems
      .classed('inBuffer', (d) => inBuffer.includes(getUniqueID(d)))
      .classed('selected', (d) => selected === getUniqueID(d));
    // this.toggle
    //   .classed('checked', toggleStatus === 'true');
  }
}
