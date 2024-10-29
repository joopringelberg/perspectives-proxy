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
};
