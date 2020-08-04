import { scaleOrdinal } from 'd3';

export const STATE = {
  IS_SIGNED_IN: 'isSignedIn',
  DATA: 'data',
  VISIBLE_STATUS: 'visibleStatus',
  TOGGLE_STATUS: 'toggleStatus',
  IN_BUFFER: 'inBuffer',
  SELECTED: 'selected',
  BUFFER_RAD: 'bufferRadius',
};

export const COLORS = scaleOrdinal().range(['#E629AF', '#E38944', '#70B0CC', '#7BD389', '#EEE777', '#4F6475', '#4C4145']);

export const KEYS = {
  TIME_STAMP: 'Timestamp',
  CAT: 'Category',
  NAME: 'Name',
  CONTACT_FN: 'Contact First Name',
  CONTACT_LN: 'Contact Last Name',
  CONTACT_P: 'Contact Phone',
  CONTACT_E: 'Contact Email',
  NUM_MEALS: 'Number of Meals',
  CUISINE: 'Cuisine Type',
  STATUS: 'Status',
  FADD: 'Formatted Address',
  LAT: 'Latitude',
  LONG: 'Longitude',
};

export default {};
