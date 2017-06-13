module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "channel-elements-lib.js",
    path: __dirname
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