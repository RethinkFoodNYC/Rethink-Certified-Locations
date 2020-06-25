import { csv } from 'd3';
import Mapbox from './Mapbox/index';
// import list

// pull data
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLYxlWp1q0q56XHpau48BiX7xag6DKtIQ-CyK6nWF9Dol07XaG4uoMPp5TpPNy-dzXjhJBw9CewVnj/pub?gid=0&single=true&output=csv';

// initialize both components with data
export default class App {
  init() {
    this.fetchCsvData().then((data) => {
      this.map = new Mapbox(data);
    });
  }

  fetchCsvData() {
    return csv(GOOGLE_SHEET_URL);
  }
}
