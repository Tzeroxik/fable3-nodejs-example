# fable3-nodejs-example
An example project using fable 3 to compile to javascript that can run on nodejs

## Requirements

``nodejs``

``dotnet 5 sdk``

## npm tasks

use ``npm run-script`` with the following tasks

``build-es6`` -> compile Fsharp into JS (ES6)

``build-commonjs`` -> transpile FSharp into JS (commonJs)

``build-commonjs-bundle`` -> transpiled FSharp into a single JS file (commonJs)

``test`` -> run transpiled commonJs (depends on ``build-commonjs``)

``test-bundled`` -> run transpiled and bundled JS file (depends on ``build-commonjs-bundled``)