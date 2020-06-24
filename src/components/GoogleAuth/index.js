import { select } from 'd3';

import './style.scss';

// REFERENCE: https://developers.google.com/sheets/api/quickstart/js
const CLIENT_ID = '717930834965-anlolbsq30inesinii2ob36avcm8qlv7.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBnMVnXtyiGd_Qb17O3qOJRowsq-NnfJ_I';
const SPREADSHEET_ID = '1fdDLW_On7psHv5xKXdqHabggAGR7WTFuepPG8EHBJTs';
const SHEET_NAME = 'staging';

const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

export default class GoogleAuth {
  constructor() {
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
    select('#google-buttons').selectAll('button')
      .data([{ text: 'Sign In', callback: this.handleAuthClick }, { text: 'Sign Out', callback: this.handleSignoutClick }])
      .join('button')
      .text((d) => d.text)
      .on('click', (d) => d.callback());
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
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
      // authorizeButton.style.display = 'none';
      // signoutButton.style.display = 'block';
      this.pullData();
    } else {
      console.log('signed out');
      // authorizeButton.style.display = 'block';
      // signoutButton.style.display = 'none';
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

  pullData() {
    console.log('pullingData');
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    }).then((response) => {
      console.log('response', response);
    });
  }
}
