import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
// import list

// initialize both components with data
export default class App {
  init() {
    this.passDataToMap = this.passDataToMap.bind(this);
    this.removeDataFromMap = this.removeDataFromMap.bind(this);

    // sets up google authentication client
    // once a user logs in, automatically fetches data
    // once data is fetched, it passes it into the callback to initialize map
    this.googleAuth = new GoogleAuth(this.passDataToMap, this.removeDataFromMap);
    this.map = new Mapbox();
  }

  // gets called once user has logged in
  passDataToMap(data) {
    this.map.addData(data);
  }

  // gets called when a user signs out of app
  removeDataFromMap() {
    this.map.removeData();
  }
}
