import { createSelector } from 'reselect';
import { distance, getUniqueID } from '../globals/helpers';
import { KEYS as K, STATE as S } from '../globals/constants';

/** Basic Selectors */
export const getSignedInStatus = (state) => state[S.IS_SIGNED_IN];
export const getData = (state) => state[S.DATA];
export const getVisibleInList = (state) => state[S.VISIBLE_STATUS];
export const getToggleStatus = (state) => state[S.TOGGLE_STATUS];
export const getSelectedUniqueID = (state) => state[S.SELECTED];

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
], (selectedID, flatDataMap) => flatDataMap.has(selectedID) ? flatDataMap.get(selectedID) : null);

export const getInBuffer = createSelector([
  getFlatDataMap,
  getSelectedUniqueID,
], (flatDataMap, selectedID) => {
  if (flatDataMap.has(selectedID)) {
    const selected = flatDataMap.get(selectedID);
    return (Array.from(flatDataMap.values())).filter((d) => distance(
      selected[K.LAT],
      selected[K.LONG],
      d[K.LAT],
      d[K.LONG],
    ) < 1);
  } else return [];
});
