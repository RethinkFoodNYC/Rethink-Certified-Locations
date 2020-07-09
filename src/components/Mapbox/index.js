import { extent } from 'd3';
import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import turf from 'turf';
import pointsWithinPolygon from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import { KEYS as K } from '../../globals/constants';

import './style.scss';

// Layers Names
const L = {
  CSV_DATA: 'csvData',
  BUFFER: 'buffer',
  REST: 'Restaurant',
  CBOs: 'CBOs',
};

export default class Mapbox {
  constructor(setGlobalState, state) {
    this.initializeMap();
    this.setGlobalState = setGlobalState;
    this.data = state.data;
  }

  initializeMap() {
    mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN; // Mapbox token
    this.map = new mapboxgl.Map({
      container: 'map', // container id
      style: process.env.MAPBOX_STYLE_URL, // stylesheet location
      center: [-74.009914, 40.7440], // starting position, Hoboken (offset from NYC because of list view)
      zoom: 10, // starting zoom
    });

    this.map.on('load', () => {
      this.addBuffer(); // initializes data source and buffer layer scaffolding
      this.map.on('click', L.REST, (e) => this.handleClick(e)); // sets up on click listener to each layer we want "clickable"
      this.map.on('click', L.CBOs, (e) => this.handleClick(e)); // TODO: surely there's a more efficient way to do this...
    });
  }

  /** Gets called externally from app once a user has logged in */
  addData(data) {
    console.log('data', data);
    // const [MIN, MAX] = extent(data, (d) => Number(d[K.INFO_test])); // cannot define before `addData(data)` has been called
    const flatData = data.map(([name, data]) => data).flat();
    csv2geojson.csv2geojson(flatData, { // restaurants only
      latfield: K.LAT,
      lonfield: K.LONG,
      delimiter: ',',
    }, (err, geojsonData) => {
      this.data = geojsonData;
      this.map.addSource(L.CSV_DATA, {
        type: 'geojson',
        data: geojsonData,
      });
      this.map.addLayer({
        id: L.REST,
        type: 'circle',
        source: L.CSV_DATA,
        layout: {
          visibility: 'visible', // TODO: connect this to setGlobalState: K.TOGGLE_ON true = 'visible', false = 'none'
        },
        filter: ['==', K.CAT, L.REST],
        paint: {
          'circle-radius': 5,
          // [
          //   'interpolate',
          //   ['linear'], // TODO: square root scale
          //   ['to-number', ['get', K.INFO_test]],
          //   MIN, // domain min
          //   2, // range min
          //   MAX, // domain max
          //   7, // range max
          // ],
          // to make this a custom icon: https://docs.mapbox.com/mapbox-gl-js/example/add-image/
          'circle-color': 'red',
          // [
          //   'interpolate',
          //   ['linear'],
          //   ['to-number', ['get', K.INFO_test]],
          //   MIN, // domain min
          //   '#feb24c', // range min
          //   MAX, // domain max
          //   '#bd0026', // range max
          // ],
        },
      });
      this.map.addLayer({
        id: L.CBOs,
        type: 'circle',
        source: L.CSV_DATA,
        layout: {
          visibility: 'visible', // TODO: connect this to setGlobalState: K.TOGGLE_ON
        },
        filter: ['==', K.CAT, L.CBOs],
        paint: {
          'circle-radius': 5,
          // [
          //   'interpolate',
          //   ['linear'], // TODO: square root scale
          //   ['to-number', ['get', K.INFO_test]],
          //   MIN, // domain min
          //   2, // range min
          //   MAX, // domain max
          //   7, // range max
          // ],
          // to make this a custom icon: https://docs.mapbox.com/mapbox-gl-js/example/add-image/
          'circle-color': 'blue',
          // [
          //   'interpolate',
          //   ['linear'],
          //   ['to-number', ['get', K.INFO_test]],
          //   MIN, // domain min
          //   '#feb24c', // range min
          //   MAX, // domain max
          //   '#bd0026', // range max
          // ],
        },
      });
      // this.fitBounds(geojsonData); //turn this off to avoid zooming to USA level on every save
    });
  }

  /** Gets called externally from app once a user has logged out */
  removeData() {
    if (this.map.getLayer(L.CSV_DATA)) this.map.removeLayer(L.CSV_DATA); // TODO: remove all layers
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
    this.map.getSource(L.BUFFER).setData(buffered); // pulls newly-populated data from L.BUFFER, based on the buffered data generated on click
    // ** is there a clever way to turn the buffer off again, maybe by a conditional for if the `point` clicked is the same lat long as the current `point`, OR if it's not a point in L.CSV_DATA ?
    console.log('point', point);
    // if ( coordinates[0] === state.selected[K.LAT] && coordinates[1] === state.selected[K.LONG] {
    //   || !(data.includes(d[coordinates]))
    // this.map.removeLayer(L.BUFFER);
    // }

    this.setGlobalState('selected', e.features[0].properties);
    const coordinates = e.features[0].geometry.coordinates.slice();
    console.log('coordinates', coordinates);
    const description = `<h3>${e.features[0].properties[K.REST_NAME]}</h3>` + '<h4>' + '<b>' + 'Address: ' + `</b>${e.features[0].properties[K.REST_ADDRESS]} ${e.features[0].properties[K.REST_ZIP]}</h4>` + '<h4>' + '<b>' + 'Refrigeration Capacity: ' + `</b>${e.features[0].properties[K.REFRIDG_CAPACITY]}</h4>`;
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(this.map);

    const pointsWithin = pointsWithinPolygon(this.data, buffered);

    const inBuffer = pointsWithin.features.map(({ properties }) => properties[[K.REST_ADDRESS]]); // may make sense to use a unique id here instead TODO: update address field
    this.setGlobalState(K.IN_BUFFER, inBuffer);
    this.map.flyTo({
      center: coordinates, // this should be offset on the longitude/y dimension since the list view now hides the left part of the window
      zoom: 12,
      speed: 0.25,
    });
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}
