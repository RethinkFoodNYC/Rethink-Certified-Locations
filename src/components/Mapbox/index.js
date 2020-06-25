import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import { KEYS as K } from '../../globals/constants';
import turf from 'turf';
import buffer from '@turf/buffer';

import './style.scss';

// Layers Names
const L = {
  CSV_DATA: 'csvData',
  BUFFER: 'buffer',
};

const UNIT = 'miles';
var options = { steps: 10, units: 'kilometers', properties: { foo: 'bar' } };

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
      this.formatCsvData(); //formats csv data and loads as a layer of points
      this.addBuffer(); //initializes data source and buffer layer scaffolding
      this.map.on('click', L.CSV_DATA, (e) => this.handleClick(e)); //sets up on click listener to csv_data layer
    });
  }

  /**  */
  formatCsvData() {
    csv2geojson.csv2geojson(this.data, {
      latfield: K.LAT,
      lonfield: K.LONG,
      delimiter: ',',
    }, (err, geojsonData) => {
      this.map.addLayer({
        id: L.CSV_DATA,
        type: 'circle',
        source: {
          type: 'geojson',
          data: geojsonData,
        },
        paint: {
          'circle-radius': 5,
          'circle-color': 'purple',
        },
      });
      this.fitBounds(geojsonData);
    });
  }

  addBuffer() {
    this.map.addSource(L.BUFFER, { type: 'geojson', data: { "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [] }, "properties": {} } })
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
    console.log("buffer", buffered)
    this.map.getSource(L.BUFFER).setData(buffered); //pulls newly-populated data from L.BUFFER, based on the buffered data generated on click
  }


  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }


}
