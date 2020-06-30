import Mapbox from './Mapbox/index';
import GoogleAuth from './GoogleAuth';
import List from './List';

// global state
let state = {
  open: [],
  active: [],
  inBuffer: [],
  selected: null,
};

// initialize both components with data
export default class App {
  init() {
    this.passDataToComponents = this.passDataToComponents.bind(this);
    this.removeDataFromComponents = this.removeDataFromComponents.bind(this);
    this.setGlobalState = this.setGlobalState.bind(this);

    // sets up google authentication client
    // once a user logs in, automatically fetches data
    // once data is fetched, it passes it into the callback to initialize map
    this.googleAuth = new GoogleAuth(this.passDataToComponents, this.removeDataFromComponents);
    this.map = new Mapbox(this.setGlobalState);
    this.list = new List(this.setGlobalState);
  }

  // gets called once user has logged in
  passDataToComponents(data) {
    this.map.addData(data);
    this.list.addData(data);
  }

  // gets called when a user signs out of app
  removeDataFromComponents() {
    this.map.removeData();
    this.list.removeData();
  }

  // UTILITY FUNCTION: state updating function that we pass to our components so that they are able to update our global state object
  setGlobalState(key, data) {
    state = { ...state, [key]: data };
    console.log("new state:", state);
    this.update();
  }

  update() {
    // this.map.draw(state);
    this.list.draw(state);
  }
}
