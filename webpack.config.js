const path = require("path");

module.exports = {
  entry: path.join(__dirname, "src/perspectivesApiProxy.js" ),
  output: {
    library: "perspectives-proxy",
    libraryTarget: "umd",
    filename: "perspectives-proxy.js",
    path: path.join(__dirname, "dist")
  },
  watch: false,
  mode: "development",
  target: "webworker",
  module: {
    rules: [{
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          }
        ]
      }]
  }
};
