import { extent, select } from 'd3';
import mapboxgl from 'mapbox-gl';
import turf from 'turf';
import pointsWithinPolygon from '@turf/points-within-polygon';
import buffer from '@turf/buffer';
import { KEYS as K, STATE as S } from '../../globals/constants';
import { getUniqueID } from '../../globals/helpers';

import './style.scss';

const colorLookup = { // TODO: make a color scale
  RRP: '#e629af',
  CBOs: '#e38944',
};

const descriptionGenerator = (pointData) => `
  <span className="header ${pointData[K.CAT]}" style="color:${colorLookup[pointData[K.CAT]]}"><b>${pointData[K.CAT]}: ${pointData[K.NAME]}</b></span> 
  <br> <span> <b> Address: </b>${pointData[K.FADD]}</span> 
  <br> <span> <b> Contact: </b>${pointData[K.CONTACT_E]}</span>
  <br> <span> <b> Information: </b>${pointData[K.INFO]}</span>`;

export default class Mapbox {
  constructor(setGlobalState, state) {
    this.initializeMap();
    this.setGlobalState = setGlobalState;
    this.data = state.data;
    this.BUFFER = 'buffer';
    this.BUFFERLINE = 'buffer-outline';
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
    // flatten data to add all points to the geojson
    const flatData = data.map(([, layerData]) => layerData).flat();

    this.markers = new Map(flatData.map((d) => {
      const longLat = (d[K.LONG] !== undefined && d[K.LAT] !== undefined)
        ? [d[K.LONG], d[K.LAT]]
        : [0, 0];
      return [
        getUniqueID(d),
        new mapboxgl.Marker({
          color: colorLookup[d[K.CAT]],
          scale: 0.5,
        })
          .setLngLat(longLat)
          .setPopup(
            new mapboxgl.Popup({ offset: 20 })
              .setHTML(descriptionGenerator(d)),
          )
          .addTo(this.map),
      ];
    }));

    // add hover behavior to each element
    this.markers.forEach((marker, _) => {
      const el = marker.getElement();
      // TODO: click should select Point with data element
      el.addEventListener('click', () => this.showBuffer(Object.values(marker._lngLat)));
      el.addEventListener('mouseenter', () => marker.togglePopup());
      el.addEventListener('mouseleave', () => marker.togglePopup());
    });
  }

  /** Gets called externally from app once a user has logged out */
  removeData() {
    // Part 1: remove all markers
    this.markers.forEach((marker, _) => marker.remove());
    // part 2: remove all sources
    // Object.values(this.S).forEach((source) => {
    //   if (this.map.getSource(source)) this.map.removeSource(source);
    // });
  }

  addBuffer() {
    this.map.addSource(
      this.BUFFER,
      { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [] }, properties: {} } },
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
    const coordinates = [selected[K.LONG], selected[K.LAT]];

    // toggle popup
    const marker = this.markers.get(getUniqueID(selected));
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

  showBuffer(coords) {
    const point = turf.point(coords);
    // create buffer
    const buffered = buffer(point, 1, { units: 'miles', steps: 16 });
    this.map.getSource(this.BUFFER).setData(buffered);
    // set buffer
    const pointsWithin = pointsWithinPolygon(this.data, buffered);
    // may make sense to use a unique id here instead TODO: update address field
    const inBuffer = pointsWithin.features.map(({ properties }) => properties[[K.FADD]]);
    // this.setGlobalState({
    //   [S.IN_BUFFER]: inBuffer,
    //   [S.SELECTED]: d,
    // });
    // the rest is handled by draw
  }

  draw(state) {
    // console.log('map is drawing!', state);

    if (state[S.SELECTED] !== null) {
      const selectedData = state[S.SELECTED];
      this.selectPoint(selectedData);
    }
  }

  fitBounds(geojsonData) {
    const bbox = turf.bbox(geojsonData);
    this.map.fitBounds(bbox, { padding: 50 });
  }
}
