import { select, text, format } from 'd3';
import './style.scss';
import { ascending } from 'd3-array';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { KEYS as K, COLORS } from '../../globals/constants';
import { getUniqueID, convertToTSV } from '../../globals/helpers';

export default class List {
  constructor(store, globalUpdate) {
    this.store = store;
    this.globalUpdate = globalUpdate;
    this.loadIcons();
    this.updateRangeRadius = this.updateRangeRadius.bind(this);
  }

  async loadIcons() {
    // source: https://github.com/parcel-bundler/parcel/issues/4222
    const mapIconPath = require('url:../../../assets/icon.svg')
    this.mapIcon = await text(mapIconPath);
    const dlIconPath = require('url:../../../assets/download.svg')
    this.downloadIcon = await text(dlIconPath);
  }

  addData() {
    // get data from store
    const data = Sel.getData(this.store.getState());
    const bufferRadius = Sel.getBufferRadius(this.store.getState());

    // dynamically add all categories to store as "on"
    this.store.dispatch(Act.initCategories(
      data.map(([cat]) => cat),
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
      .sort((a, b) => ascending(a[K.NAME], b[K.NAME]))
      .attr('class', 'listItemRow')
      .attr('data-id', (d) => getUniqueID(d));

    this.listItems
      .append('div')
      .attr('class', 'listItemIcon')
      .html(this.mapIcon)
      .attr('width', '30px')
      .attr('height', '30px')
      .style('stroke', (d) => COLORS[d[K.CAT]])
      .select('.map-point')
      .style('fill', (d) => COLORS[d[K.CAT]]);

    this.listItems
      .append('span')
      .attr('class', 'listItem')
      .text((d) => d[K.NAME])
      .on('click', (d) => {
        this.store.dispatch(Act.setSelected(d));
        this.globalUpdate();
      });

    // placeholder for distance updated with selected
    this.listItemDistance = this.listItems
      .append('div')
      .attr('class', 'listItemDistance')
      .attr('width', '60px')
      .attr('height', '60px');

    this.bufferInfo = parent
      .append('div')
      .attr('class', 'buffer-info');

    this.radiusRow = this.bufferInfo
      .append('div')
      .attr('class', 'radius')
      .text(`Range radius: ${format('.1f')(bufferRadius)} miles`);

    this.downloadLink = this.bufferInfo
      .append('div')
      .attr('class', 'download inactive'); // start as inactive

    this.downloadLink
      .append('span')
      .text('Download range data')
      .on('click', () => this.download());

    this.downloadLink
      .append('div')
      .attr('class', 'downloadIcon')
      .html(this.downloadIcon)
      .attr('width', '30px')
      .attr('height', '30px');
  }

  download() {
    const inBuffer = Sel.getInBuffer(this.store.getState());
    const flatDataMap = Sel.getFlatDataMap(this.store.getState());
    const tsv = convertToTSV(inBuffer.map((id) => flatDataMap.get(id)));

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(tsv));
    link.setAttribute('download', 'map_results.tsv');
    document.body.appendChild(link);
    link.click();
    link.remove();
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

  updateRangeRadius(range) {
    this.radiusRow
      .text(`Range radius: ${format('.1f')(range)} miles`);
  }

  draw() {
    const selected = Sel.getSelectedUniqueID(this.store.getState());
    const inBuffer = Sel.getInBuffer(this.store.getState());
    const toggleStatus = Sel.getToggleStatus(this.store.getState());
    const distances = Sel.getDistances(this.store.getState());

    this.downloadLink
      .classed('inactive', inBuffer.length === 0);

    // add in buffer and selected classes for styling
    this.listItems
      .classed('inBuffer', (d) => inBuffer.includes(getUniqueID(d)))
      .classed('selected', (d) => selected === getUniqueID(d));

    // add in toggle class for gray styling
    this.switchEl
      .selectAll('span.slider')
      .classed('toggleStatusOff', ([category]) => !toggleStatus[category]);

    // add distance to list and sort in ascending order from selected point;
    // remove distance when no point is selected
    if (distances !== null) {
      this.listItems
        .sort((a, b) => ascending(distances.get(getUniqueID(a)), distances.get(getUniqueID(b))));
      this.listItemDistance
        .text((d) => {
          if (distances.has(getUniqueID(d))) {
            return `${format('.1f')((distances.get(getUniqueID(d))))} mi`;
          }
          return '';
        });
    } else {
      this.listItems
        .sort((a, b) => ascending(a[K.NAME], b[K.NAME]));
      this.listItemDistance
        .text('');
    }
  }
}
