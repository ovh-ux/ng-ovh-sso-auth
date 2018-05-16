const webpack = require("webpack");
const path = require("path");
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

let config = {
  mode: "production",
  entry: "./src/ovh-angular-sso-auth.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./ovh-angular-sso-auth.min.js"
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jquery: 'jquery'
    }),
    new ngAnnotatePlugin({
        add: true,
        // other ng-annotate options here
    })
  ]
}

module.exports = config;
