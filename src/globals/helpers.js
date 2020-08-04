import { point, distance } from '@turf/turf';
import { KEYS as K } from './constants';

export function getUniqueID(data) {
  return `${data[K.NAME].replace(/\s/g, '')}_${data[K.LONG]}_${data[K.LAT]}`;
}

export function parseCategory(str) {
  return str.replace(/Current |Potential /gmi, '');
}

export function concatCatgStatus(data) {
  if (data[K.STATUS] === 'None') return data[K.CAT];
  return `${data[K.STATUS]} ${data[K.CAT]}`;
}

export function calculateDistance(coords1, coords2) {
  const from = point(coords1);
  const to = point(coords2);

  return distance(from, to, { units: 'miles' });
}

export function convertToTSV(data) {
  const headers = Object.keys(data[0]);
  const stringRows = data.map((row) => headers
    .map((fieldName) => row[fieldName])
    .join('\t'));
  return ['data:text/csv;charset=utf-8,', headers.join('\t'), ...stringRows].join('\r\n');
}

export function convertToCarmen(d) {
  const coords = [d[K.LONG], d[K.LAT]];
  return ({
    type: 'Feature',
    id: getUniqueID(d),
    place_name: `${d[K.NAME]} (${d[K.CAT]})`,
    address: d[K.FADD],
    center: coords,
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
  });
}
