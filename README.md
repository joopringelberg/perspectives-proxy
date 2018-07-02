# perspectives-proxy
Exposes perspectives-core either through TCP or a channel based on coroutines for apps with integrated core. This package is used exclusively in:
* [perspectives-core](https://github.com/joopringelberg/perspectives-core)
* [perspectives-react](https://github.com/joopringelberg/perspectives-react)

## Installation
Install with npm:

```
$ npm install perspectives-proxy
```

## Usage
The purescript module `perspectivesAPI` (part of perspectives-core) uses the exported function `createRequestEmitterImpl` to set up a coroutine `Producer` for requests. This channels requests from a GUI that runs in the same process to the core.

The package perspectives-react uses `createTcpConnectionToPerspectives` to setup a TCP channel to communicate with a perspectives-core that runs in its own process.
