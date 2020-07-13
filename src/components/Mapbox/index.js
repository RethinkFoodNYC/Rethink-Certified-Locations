import { extent, select } from 'd3';
import mapboxgl from 'mapbox-gl';
import csv2geojson from 'csv2geojson';
import turf from 'turf';
import pointsWithinPolygon from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import { KEYS as K, STATE as S } from '../../globals/constants';

import './style.scss';

const layerGenerator = (id, source, color) => ({
  id,
  type: 'circle',
  source,
  layout: {
    visibility: 'visible', // TODO: connect this to setGlobalState: K.TOGGLE_ON
  },
  filter: ['==', K.CAT, id],
  paint: {
    'circle-radius': 5,
    'circle-color': color,
  },
});

export default class Mapbox {
  constructor(setGlobalState, state) {
    this.initializeMap();
    this.setGlobalState = setGlobalState;
    this.data = state.data;
    this.S = { // sources
      CVS_DATA: 'csvData',
      BUFFER: 'buffer',
    };
    this.L = { // layers
      BUFFER: 'buffer', // dynamically populated
    };
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
    });
  }

  /** Gets called externally from app once a user has logged in */
  addData(data) {
    // update the bound layers obj to be dynamic with the data
    this.L = data.reduce((agg, [name, _]) => ({
      ...agg,
      [name.toUpperCase().slice(0, 4)]: name,
    }), this.L);
    // flatten data to add all points to the geojson
    const flatData = data.map(([, layerData]) => layerData).flat();
    csv2geojson.csv2geojson(flatData, {
      latfield: K.LAT,
      lonfield: K.LONG,
      includeLatLon: true, // to prevent library from deleting lat/long columns
      delimiter: ',',
    }, (err, geojsonData) => {
      this.data = geojsonData;
      this.map.addSource(this.S.CVS_DATA, {
        type: 'geojson',
        data: geojsonData,
      });
      const dataLayers = Object.values(this.L)
        .filter((layer) => layer !== this.L.BUFFER);
      // add layers
      dataLayers.forEach((layer) => {
        this.map.addLayer(layerGenerator(layer, this.S.CVS_DATA, 'grey'));
        // sets up on click listener to each layer we want "clickable"
        this.map.on('click', layer, (e) => this.handleClick(e));
        // this.fitBounds(geojsonData); //turn this off to avoid zooming to USA level on every save
      });
    });
  }

  /** Gets called externally from app once a user has logged out */
  removeData() {
    // Part 1: remove all layers
    Object.values(this.L).forEach((layer) => {
      if (this.map.getLayer(layer)) this.map.removeLayer(layer);
    });
    // part 2: remove all sources
    Object.values(this.S).forEach((source) => {
      if (this.map.getSource(source)) this.map.removeSource(source);
    });
  }

  addBuffer() {
    this.map.addSource(
      this.S.BUFFER,
      { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} } },
    );
    this.map.addLayer({
      id: this.L.BUFFER,
      type: 'fill',
      source: this.S.BUFFER,
      paint: {
        'fill-color': 'blue',
        'fill-opacity': 0.5,
      },
    });
  }

  selectPoint(point) {
    // create buffer
    const buffered = buffer(point, 1, { units: 'miles' });
    this.map.getSource(this.S.BUFFER).setData(buffered);
    const { coordinates } = point.geometry;
    const description = 'text';

    // add tooltip
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(this.map);

    // zoom to point
    this.map.flyTo({
      center: coordinates, // this should be offset on the longitude/y dimension since the list view now hides the left part of the window
      zoom: 12,
      speed: 0.25,
    });

    // set buffer
    const pointsWithin = pointsWithinPolygon(this.data, buffered);
    const inBuffer = pointsWithin.features.map(({ properties }) => properties[[K.FADD]]); // may make sense to use a unique id here instead TODO: update address field
    // this.setGlobalState(K.IN_BUFFER, inBuffer); // FIXME: currently causes infinite loop
  }

  handleClick(e) {
    if (!e.defaultPrevented) {
      this.setGlobalState('selected', e.features[0].properties); // the rest is handled by draw
      e.preventDefault(); // only do this on the first point hit
    }
  }

  draw(state) {
    // console.log('map is drawing!', state);

    if (state[S.SELECTED] !== null) {
      const point = turf.point([state[S.SELECTED][K.LONG], state[S.SELECTED][K.LAT]]);
      this.selectPoint(point);
    }
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}
