### Rethink Foods README

### `yarn install`
goes through and installs all dependencies in package.json

### `yarn dev`
compiles code and starts a developement server at `http://localhost:1234`.

### `yarn build` or `yarn prototypes-build`
builds static, compiled filed in `dist` folder. Use `prototypes-build` when building for two-n prototype deployment because it sets the correct **base URL** to be able to load in the assets (you will need to add this to the `package.json` `scripts`).

### `yarn deploy`
to deploy to two-n prototypes site (you will need to add **base URL** this the `package.json` `scripts` first).

---
# TOKEN MANAGEMENT

In order to deploy the app, we need to enable all the tokens to work from the site domain.
Tokens that need to be updated include:

1. Mapbox: API Token

2. Google API: API Token + OAuth Client ID
[Google Developers Console](https://console.developers.google.com/) > 'Credentials'

In order for the front-end to work, we need to make sure that the following are defined as `environment variables` (either in a `.env` file, or in **Github Secrets**):

```sh
## Mapbox
MAPBOX_ACCESS_TOKEN=
MAPBOX_STYLE_URL=

## Google
GOOGLE_CLIENT_ID=
GOOGLE_API_KEY=
```

---
# DATA

Data for pins is pulled in from a private google sheet that is configured in `src/components/GoogleAuth/config.json`

There we have defined:
```json
{
  "GOOGLE_SPREADSHEET_ID": "SHEET_ID",
  "GOOGLE_SPREADSHEET_NAME":"SHEET_NAME"
}
```