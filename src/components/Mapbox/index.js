import mapboxgl from 'mapbox-gl';
import turf from 'turf';
import buffer from '@turf/buffer';
import { select } from 'd3';
import { KEYS as K, COLORS } from '../../globals/constants';
import * as Sel from '../../selectors';
import * as Act from '../../actions';
import { getUniqueID, concatStatus } from '../../globals/helpers';

import './style.scss';

const emptyBufferData = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} };

const descriptionGenerator = (pointData) => `
  <span class="header" id="popup" className="header ${pointData[K.CAT]}" style="color:${COLORS[pointData[K.CAT]]}"> <b>${(pointData[K.CAT]).toLowerCase()}</b> </span> 
  <br> <span> <b> ${pointData[K.NAME]}</b></span> 
  <br> <span> <b> Address: </b>${pointData[K.FADD]}</span> 
  <br> <span> <b> Contact: </b>${pointData[K.CONTACT_E]}</span>
  <br> <span> <b> Information: </b>${pointData[K.INFO]}</span>`;

export default class Mapbox {
  constructor(store, globalUpdate) {
    this.initializeMap();
    this.store = store;
    this.globalUpdate = globalUpdate;
    this.BUFFER = 'buffer';
    this.BUFFERLINE = 'buffer-outline';
  }

  initializeMap() {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN; // Mapbox token
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: process.env.MAPBOX_STYLE_URL, // stylesheet location
      center: [-74.009914, 40.7440], // starting position, Hoboken (offset for list view)
      zoom: 10, // starting zoom
    });

    this.map.on('load', () => {
      this.addBuffer(); // initializes data source and buffer layer scaffolding
    });

    this.map.on('click', (e) => {
      // if you click on the canvas instead of a path/marker
      if (e.originalEvent.target.className === 'mapboxgl-canvas') {
        this.store.dispatch(Act.setSelected(null));
        this.globalUpdate();
      }
    });
  }

  /** Gets called externally from app once a user has logged in */
  addData() {
    // get data from store
    const flatData = Sel.getFlatData(this.store.getState());

    this.markers = new Map(flatData.map((dataPoint) => {
      const longLat = (dataPoint[K.LONG] !== undefined && dataPoint[K.LAT] !== undefined)
        ? [dataPoint[K.LONG], dataPoint[K.LAT]]
        : [0, 0];
      return [
        getUniqueID(dataPoint),
        [
          new mapboxgl.Marker({
            color: COLORS[dataPoint[K.CAT]],
            scale: 0.5,
          })
            .setLngLat(longLat)
            .setPopup(
              new mapboxgl.Popup({ offset: 20 })
                .setHTML(descriptionGenerator(dataPoint)),
            )
            .addTo(this.map),
          dataPoint,
        ], // returns a map structuring array from unique ID => [marker, data]
      ];
    }));

    // add hover behavior to each element
    this.markers.forEach(([marker, dataPoint], _) => {
      const el = marker.getElement();
      el.classList.add('potential', dataPoint[K.STATUS] === 'potential');
      el.addEventListener('click', () => {
        this.store.dispatch(Act.setSelected(dataPoint));
        this.globalUpdate();
      });
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
    });
  }

  /** Gets called externally from app once a user has logged out */
  removeData() {
    // Part 1: remove all markers
    this.markers.forEach(([marker, data], uniqueID) => marker.remove());
    // Part 2: remove all layers and sources (buffer)
    ([this.BUFFERLINE, this.BUFFER]).forEach((d) => {
      if (this.map.getLayer(d)) this.map.removeLayer(d);
      if (this.map.getSource(d)) this.map.removeSource(d);
    });
  }

  addBuffer() {
    this.map.addSource(
      this.BUFFER,
      { type: 'geojson', data: emptyBufferData },
    );
    this.map.addLayer({
      id: this.BUFFER,
      type: 'fill',
      source: this.BUFFER,
      paint: {
        'fill-color': '#5CBBBF', // $colorPrimary -- can this be a constant?
        'fill-opacity': 0.3,
      },
    });
    this.map.addLayer({
      id: this.BUFFERLINE,
      type: 'line',
      source: this.BUFFER,
      paint: {
        'line-color': '#9b9e9f', // from Hermann's design
        'line-dasharray': [2, 2],
      },
    });
  }

  selectPoint(selected) {
    if (selected === null) {
      this.clearBuffer();
    } else {
      const coordinates = [selected[K.LONG], selected[K.LAT]];

      // toggle popup
      const [marker, _] = this.markers.get(getUniqueID(selected));
      marker.togglePopup();

      // add buffer
      this.showBuffer(coordinates);

      // zoom to point
      this.map.flyTo({
        center: coordinates, // this should be offset on the longitude/y dimension
        // since the list view now hides the left part of the window
        zoom: 12,
        speed: 0.25,
      });
    }
  }

  showBuffer(coords) {
    const point = turf.point(coords);
    // create buffer
    const buffered = buffer(point, 1, { units: 'miles', steps: 16 });
    this.map.getSource(this.BUFFER).setData(buffered);
  }

  clearBuffer() {
    this.map.getSource(this.BUFFER).setData(emptyBufferData);
  }

  colorMarkers(inBuffer) {
    // show all if there is no buffer
    if (inBuffer.length === 0) {
      this.markers.forEach(([marker, data], uniqueID) => marker.getElement().classList.remove('hide'));
    } else {
      // toggle off all outside of buffer
      this.markers.forEach(([marker, data], uniqueID) => marker.getElement().classList.add('hide'));

      // color in buffer
      inBuffer.forEach((d) => {
        const [marker, _] = this.markers.get(d);
        marker.getElement().classList.remove('hide');
      });
    }
  }

  toggleVisibility(status) {
    // map over markers and turn off / on according to toggle
    this.markers.forEach(([marker, data]) => select(marker.getElement()).classed('off', !status[concatStatus(data)]));
  }

  draw() {
    this.selectPoint(Sel.getSelected(this.store.getState()));
    this.colorMarkers(Sel.getInBuffer(this.store.getState()));
    this.toggleVisibility(Sel.getToggleStatus(this.store.getState()));
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}
