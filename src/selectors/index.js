import { createSelector } from 'reselect';
import { distance } from '../globals/helpers';
import { KEYS as K, STATE as S } from '../globals/constants';

/** Basic Selectors */
export const getSignedInStatus = (state) => state.getState()[S.IS_SIGNED_IN];
export const getData = (store) => store.getState()[S.DATA];
export const getVisibleInList = (state) => state.getState()[S.VISIBLE_STATUS];
export const getToggleStatus = (state) => state.getState()[S.TOGGLE_STATUS];
export const getSelected = (state) => state.getState()[S.SELECTED];

/** Data Manipulations */
export const getFlatData = createSelector([
  getData,
], (data) => data.map(([, layerData]) => layerData).flat());

export const getInBuffer = createSelector([
  getFlatData,
  getSelected,
], (data, selected) => {
  console.log('selected', selected)
  return data.filter((d) => distance(
    d[K.LAT],
    d[K.LONG],
    selected[K.LAT],
    selected[K.LONG],
  ) < 1);
});
