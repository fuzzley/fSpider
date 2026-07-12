Just a simple Spider Solitaire clone, written in javascript.
The project utilizes [KineticJS](http://kineticjs.com/) for the canvas/drawing and [howler](http://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library) for the sound effects.

**Feel free to embed this game on your own website. I only ask that you credit me somehow (a link to this github page would be good).**

The [latest version of the game](http://fuzzley.info/spider/) is hosted on http://fuzzley.info/spider/. You may have to clear your cache to see changes. If you find any problems, or if you'd like to see a feature implemented, please let me know :).

Have fun!

## Development

This project uses [yarn](https://yarnpkg.com/) for dependency management and
[Vite](https://vite.dev/) for the dev server and production build.

```sh
yarn install     # install dev dependencies
yarn dev         # start the dev server on http://localhost:9000
yarn build       # produce a production build in dist/
yarn preview     # serve the production build locally
yarn lint        # run ESLint
yarn prettier    # format the code with Prettier
```

The game code lives in `src/` (bundled by Vite via `src/main.js`). The vendored
libraries (jQuery, Knockout, KineticJS, Howler) and static assets are served
as-is from `public/`.
