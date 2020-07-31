import { point, distance } from '@turf/turf';
import { KEYS as K } from './constants';

export function getUniqueID(data) {
  return `${data[K.NAME].replace(/\s/g, '')}_${data[K.LONG]}_${data[K.LAT]}`;
}

export function calculateDistance(coords1, coords2) {
  const from = point(coords1);
  const to = point(coords2);

  return distance(from, to, { units: 'miles' });
}
