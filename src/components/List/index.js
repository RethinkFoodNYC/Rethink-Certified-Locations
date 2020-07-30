import { select, text, format } from 'd3';
import './style.scss';
import { ascending } from 'd3-array';
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
    const newBufferRadius = Sel.getNewBufferRadius(this.store.getState());
    // console.log('distance', distance);

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

    this.distanceRow = parent
      .append('div')
      .attr('class', 'category distance')
      .text(`Buffer radius: ${format('.1f')(newBufferRadius)} miles`);

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
      .html(([category, items]) => `<span><span class="name">${category}</span> <span class="count">(${items.length})</span> `)
      .on('click', function () {
        this.parentNode.parentNode.classList.toggle('isOpen');
      });

    this.toggle = this.categoryRow
      .selectAll('div.toggle')
      .data((d) => [d])
      .join('div')
      .attr('class', 'toggle');

    this.switchEl = this.toggle
      .selectAll('label.switch')
      .data((d) => [d])
      .join('label')
      .attr('class', 'switch');

    this.switchEl
      .selectAll('input')
      .data((d) => [d])
      .join('input')
      .attr('type', 'checkbox')
      .attr('id', ([category]) => category)
      .on('click', ([category]) => this.toggleCategory(category));

    this.switchEl
      .append('span')
      .attr('class', 'slider round')
      .style('background-color', ([category]) => COLORS[category]);

    this.body = this.wrapper
      .append('div')
      .attr('class', 'body');

    this.listItems = this.body
      .selectAll('div.listItem')
      .data(([, items]) => items)
      .join('div')
      .attr('class', 'listItemRow')
      .attr('data-id', (d) => getUniqueID(d));

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
      .html(this.icon) // created from async func loadIcon()
      .attr('width', '30px')
      .attr('height', '30px')
      .style('stroke', (d) => COLORS[d[K.CAT]])
      .select('.map-point')
      .style('fill', (d) => COLORS[d[K.CAT]]);

    // placeholder for distance updated with selected
    this.listItemDistance = this.listItems
      .append('div')
      .attr('class', 'listItemDistance')
      .attr('width', '60px')
      .attr('height', '60px')
      .attr('class', 'listItemDistance');
  }

  toggleCategory(category) {
    this.store.dispatch(Act.updateToggle(category));
    this.globalUpdate();
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
    const newBufferRadius = Sel.getNewBufferRadius(this.store.getState());
    const distances = Sel.getDistances(this.store.getState());

    // add in buffer and selected classes for styling
    this.listItems
      .classed('inBuffer', (d) => inBuffer.includes(getUniqueID(d)))
      .classed('selected', (d) => selected === getUniqueID(d));

    // add in toggle class for gray styling
    this.switchEl
      .selectAll('span.slider')
      .classed('toggleStatusOff', ([category]) => !toggleStatus[category]);

    this.distanceRow
      .text(`Buffer radius: ${format('.1f')(newBufferRadius)} miles`);

    // add distance to list and sort in ascending order from selected point;
    // remove distance when no point is selected
    if (distances !== null) {
      this.listItems
        .sort((a, b) => ascending(distances.get(getUniqueID(a)), distances.get(getUniqueID(b))));
      this.listItemDistance
        .text((d) => `${format('.1f')((distances.get(getUniqueID(d))))} mi`);
    } else {
      this.listItems
        .data(([, items]) => items)
        .sort((a, b) => ascending(a[K.NAME], b[K.NAME]));
      this.listItemDistance
        .text('');
    }
  }
}
