### Rethink Foods README

### `yarn install`
goes through and installs all dependencies in package.json

### `yarn dev`
compiles code and starts a developement server at `http://localhost:1234`.

### `yarn build` or `yarn prototypes-build`
builds static, compiled filed in `dist` folder. Use `prototypes-build` when building for two-n prototype deployment because it sets the correct **base URL** to be able to load in the assets (you will need to add this to the `package.json` `scripts`).

### `yarn deploy`
to deploy to two-n prototypes site (you will need to add **base URL** this the `package.json` `scripts` first).