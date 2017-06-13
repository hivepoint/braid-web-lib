module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "channel-elements-web-lib.js",
    path: __dirname + "/dist/"
  },
  resolve: {
    extensions: [".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  }
}