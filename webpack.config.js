const path = require("path");

module.exports = {
  entry: path.join(__dirname, "src/perspectivesApiProxy.js" ),
  output: {
    library: "perspectives-proxy",
    libraryTarget: "umd",
    filename: "perspectives-proxy.js",
    path: path.join(__dirname, "dist"),
    globalObject: "this"
  },
  watch: false,
  mode: "development",
  target: "webworker",
  externals: {
    "perspectives-core": {
      commonjs: "perspectives-core",
      commonjs2: "perspectives-core",
      amd: "perspectives-core",
      root: "perspectives-core"
    }
  }};
