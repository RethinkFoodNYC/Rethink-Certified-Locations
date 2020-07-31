import { createSelector } from 'reselect';
import { calculateDistance, getUniqueID } from '../globals/helpers';
import { KEYS as K, STATE as S } from '../globals/constants';

/** Basic Selectors */
export const getSignedInStatus = (state) => state[S.IS_SIGNED_IN];
export const getData = (state) => state[S.DATA];
export const getVisibleInList = (state) => state[S.VISIBLE_STATUS];
export const getToggleStatus = (state) => state[S.TOGGLE_STATUS];
export const getSelectedUniqueID = (state) => state[S.SELECTED];
export const getBufferRadius = (state) => state[S.BUFFER_RAD];

/** Data Manipulations */
export const getFlatData = createSelector([
  getData,
], (data) => [...data].map(([, layerData]) => layerData).flat());

export const getFlatDataMap = createSelector([
  getFlatData,
], (flatData) => new Map([...flatData].map((d) => [getUniqueID(d), d])));

export const getSelected = createSelector([
  getSelectedUniqueID,
  getFlatDataMap,
], (selectedID, flatDataMap) => (flatDataMap.has(selectedID) ? flatDataMap.get(selectedID) : null));

export const getDistances = createSelector([
  getSelectedUniqueID, getFlatDataMap, getToggleStatus,
], (selectedID, flatDataMap, toggleStatus) => {
  if (selectedID === null) {
    return null;
  }
  const selected = flatDataMap.get(selectedID);
  return new Map([...flatDataMap]
    .filter(([, d]) => toggleStatus[d[K.CAT]])
    .map(([uniqueID, d]) => {
      const dist = calculateDistance(
        [selected[K.LONG], selected[K.LAT]],
        [d[K.LONG], d[K.LAT]],
      );
      return [uniqueID, dist];
    }));
});

export const getInBuffer = createSelector([
  getDistances, getBufferRadius,
], (distanceMap, radius) => {
  if (distanceMap === null) {
    return [];
  }
  return [...distanceMap.entries()]
    .filter(([, dist]) => dist < radius).map(([uniqueID]) => uniqueID);
});
