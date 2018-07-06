const path = require("path");

module.exports = {
  entry: path.join(__dirname, "src/perspectivesApiProxy.js" ),
  output: {
    library: "perspectivesProxy",
    libraryTarget: "umd",
    filename: "perspectives-proxy.js",
    path: path.join(__dirname, "dist")
  },
  watch: true,
  mode: "development",
  target: "electron-renderer",
  module: {
    rules: [{
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "env"
              ]
            }
          }
        ]
      }]
  }
};
