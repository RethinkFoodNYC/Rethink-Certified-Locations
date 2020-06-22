import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import { KEYS as K } from '../../globals/constants';

import './style.scss';

// Layers Names
const L = {
  CSV_DATA: 'csvData',
  BUFFER: 'buffer',
};

export default class Mapbox {
  constructor(geojsonData) {
    this.data = geojsonData;
    this.initializeMap();
  }

  initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidHdvbmluYyIsImEiOiJja2Jrd3R3Y3owYmU1MnBtZWJpamYzM25kIn0.Ux4w99PgqsjbjYaPZstK3A'; // Mapbox token
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/twoninc/ckbkwx8sc0m3g1imu2wlu90ue', // stylesheet location
      center: [-73.9716, 40.6992], // starting position, Brookyln Navy Yard
      zoom: 9, // starting zoom
    });

    this.map.on('load', () => {
      this.formatCsvData();
      this.map.on('click', L.CSV_DATA, (e) => this.handleClick(e));
    });
  }

  /**  */
  formatCsvData() {
    csv2geojson.csv2geojson(this.data, {
      latfield: K.LAT,
      lonfield: K.LONG,
      delimiter: ',',
    }, (err, geojsonData) => {
      this.addLayer(L.CSV_DATA, geojsonData);
    });
  }

  /**
   * given layer id and geojson data as an argument,
   * adds a layer to the map
   * */
  addLayer(id, geojsonData) {
    this.map.addLayer({
      id,
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
  }

  handleClick(e) {
    console.log('e.features', e.features);
  }
}
