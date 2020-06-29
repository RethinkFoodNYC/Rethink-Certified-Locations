import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import turf from 'turf';
import buffer from '@turf/buffer';
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
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN; // Mapbox token
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: process.env.MAPBOX_STYLE_URL, // stylesheet location
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
        'fill-color': 'blue',
        'fill-opacity': 0.5,
      },
    });
  }

  handleClick(e) {
    const point = turf.point([e.lngLat.lng, e.lngLat.lat]);
    const buffered = buffer(point, 1, { units: 'miles' });
    this.map.getSource(L.BUFFER).setData(buffered); // pulls newly-populated data from L.BUFFER,
    // based on the buffered data generated on click

    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = `<h3>${e.features[0].properties.Name}</h3>` + '<h4>' + '<b>' + 'Address: ' + `</b>${e.features[0].properties.Address}</h4>` + '<h4>' + '<b>' + 'Information: ' + `</b>${e.features[0].properties.Information}</h4>`;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(this.map);
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}
