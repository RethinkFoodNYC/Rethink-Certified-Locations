import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import buffer from '@turf/buffer';
import turf from 'turf';
import { KEYS as K } from '../../globals/constants';

import './style.scss';

// Layers Names
const L = {
  CSV_DATA: 'csvData',
  BUFFER: 'buffer',
};

export default class Mapbox {
  constructor(csvData) {
    this.data = csvData;
    this.initializeMap();
  }

  initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidHdvbmluYyIsImEiOiJja2Jrd3R3Y3owYmU1MnBtZWJpamYzM25kIn0.Ux4w99PgqsjbjYaPZstK3A'; // Mapbox token
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/twoninc/ckbkwx8sc0m3g1imu2wlu90ue', // stylesheet location
      center: [-73.9716, 40.6992], // starting position, Brookyln Navy Yard
      zoom: 10, // starting zoom
    });

    this.map.on('load', () => {
      this.addBuffer(); // initializes data source and buffer layer scaffolding
      this.map.on('click', L.CSV_DATA, (e) => this.handleClick(e)); // sets up on click listener to csv_data layer
    });
  }

  /** Gets called externally from app once a user has logged in */
  addData(data) {
    csv2geojson.csv2geojson(data, {
      latfield: K.LAT,
      lonfield: K.LONG,
      delimiter: ',',
    }, (err, geojsonData) => {
      this.map.addSource(L.CSV_DATA, {
        type: 'geojson',
        data: geojsonData,
      });

      this.map.addLayer({
        id: L.CSV_DATA,
        type: 'circle',
        source: L.CSV_DATA,
        paint: {
          'circle-radius': 5,
          'circle-color': 'purple',
        },
      });
      this.fitBounds(geojsonData);
    });
  }

  /** Gets called externally from app once a user has logged out */
  removeData() {
    if (this.map.getLayer(L.CSV_DATA)) this.map.removeLayer(L.CSV_DATA);
    if (this.map.getSource(L.CSV_DATA)) this.map.removeSource(L.CSV_DATA);
  }

  addBuffer() {
    this.map.addSource(L.BUFFER, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} } });
    this.map.addLayer({
      id: 'buffer',
      type: 'fill',
      source: L.BUFFER,
      paint: {
        'fill-color': 'red',
        'fill-opacity': 0.75,
      },
    });
  }

  handleClick(e) {
    const point = turf.point([e.lngLat.lng, e.lngLat.lat]);
    const buffered = buffer(point, 1, { units: 'miles' });
    console.log('buffer', buffered);
    this.map.getSource(L.BUFFER).setData(buffered); // pulls newly-populated data from L.BUFFER, based on the buffered data generated on click
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}