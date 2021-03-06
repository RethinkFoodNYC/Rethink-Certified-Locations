import { select } from 'd3';
import { groups } from 'd3-array';
import config from './config.json';
import './style.scss';
import { KEYS as K } from '../../globals/constants';
import { concatCatgStatus } from '../../globals/helpers';

// REFERENCE: https://developers.google.com/sheets/api/quickstart/js

const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export default class GoogleAuth {
  constructor(onReceiveData, onSignOut) {
    this.onReceiveData = onReceiveData;
    this.onSignOut = onSignOut;
    this.handleAuthClick = this.handleAuthClick.bind(this);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.initClient = this.initClient.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.setupButtons();
    this.handleClientload();
  }

  handleClientload() {
    // note: gapi is defined globaly through the script tag in the html page
    gapi.load('client:auth2', this.initClient);
  }

  setupButtons() {
    this.googleButtons = select('#google-buttons').selectAll('button')
      .data([
        { text: 'Open Sheet', callback: this.openSpreadsheet, class: 'openData' },
        { text: 'Sign In', callback: this.handleAuthClick, class: 'signIn' },
        { text: 'Sign Out', callback: this.handleSignoutClick, class: 'signOut' }])
      .join('button')
      // hide both to start to avoid seeing both when loading sign in state
      .attr('class', (d) => `hide ${d.class}`)
      .text((d) => d.text)
      .on('click', (d) => d.callback());
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    gapi.client.init({
      apiKey: process.env.GOOGLE_API_KEY,
      clientId: process.env.GOOGLE_CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    }).then(() => {
      console.log('initialized');
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

      // Handle the initial sign-in state.
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, (error) => {
      console.log('error', error);
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      console.log('signed In');
      // flip buttons
      this.googleButtons.classed('hide', (d) => d.class === 'signIn');
      this.pullData();
    } else {
      console.log('signed out');
      // flip buttons
      this.googleButtons.classed('hide', (d) => d.class === 'signOut');
      this.onSignOut();
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
   *  Sign out the user upon button click.
   */
  openSpreadsheet() {
    window.open(`https://docs.google.com/spreadsheets/d/${config.GOOGLE_SPREADSHEET_ID}/`, '_blank');
  }

  pullData() {
    // TODO: generalize this to be able to handle multiple sheets if needed
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: config.GOOGLE_SPREADSHEET_ID,
      range: config.GOOGLE_SPREADSHEET_NAME,
    }).then((response) => {
      // first element is column names
      const [cols, ...rows] = response.result.values;
      const parsed = rows
        .reduce((acc, row) => ([...acc,
          row.reduce((obj, val, i) => ({
            ...obj,
            [cols[i]]: val,
          }),
          {})]),
        [])
        // filter out any values without lat/long
        .filter((row) => row[K.LAT] !== undefined && row[K.LONG] !== undefined);
      this.onReceiveData(groups(parsed, concatCatgStatus));
    });
  }
}
