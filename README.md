# MelonLoader Installer: Electron Edition
## WIP! Here be dragons

### Development Pre-Requisites

- Node.JS
- Yarn, if you want to use the steps below.

### Developing:

1. Run `yarn install`
2. Run `yarn watch` to automatically compile your changes on save.
3. Run `yarn start-dev` in another terminal to launch the app. Should hot-reload any changes you make in `src/renderer/`, but if it gets 
stuck, hit Control-R to hard-reload. If you make a change to the backend (anything in `src/main/`), close the window and re-run this step.

### Building a Release

1. `yarn release`. Easy, that.