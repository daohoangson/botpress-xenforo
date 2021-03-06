const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");
const pkg = require("./package.json");

const nodeConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: "source-map",
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "./bin"),
    filename: "node.bundle.js",
    libraryTarget: "commonjs2",
    publicPath: __dirname
  },
  externals: [nodeExternals(), "botpress"],
  target: "node",
  node: {
    __dirname: false
  },
  resolve: {
    extensions: [".js"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["latest", "stage-0"],
            plugins: [
              "transform-object-rest-spread",
              "transform-async-to-generator"
            ]
          }
        }
      }
    ]
  }
};

const webConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: "source-map",
  entry: ["./src/views/index.jsx"],
  output: {
    path: path.resolve(__dirname, "./bin"),
    publicPath: "/js/modules/",
    filename: "web.bundle.js",
    libraryTarget: "assign",
    library: ["botpress", pkg.name]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "react-bootstrap": "ReactBootstrap",
    "prop-types": "PropTypes"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["latest", "stage-0", "react"],
            plugins: [
              "transform-object-rest-spread",
              "transform-decorators-legacy"
            ]
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: pkg.name + "__[name]__[local]___[hash:base64:5]"
              },
              importLoaders: 1,
            }
          },
          { loader: "sass-loader" }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
        use: [
          { loader: "file-loader", options: { name: "../fonts/[name].[ext]" } }
        ]
      }
    ]
  }
};

const liteConfig = Object.assign({}, webConfig, {
  // Add your lite views here, see example below
  entry: {
    // example: './src/views/example.lite.jsx'
  },
  output: {
    path: path.resolve(__dirname, "./bin/lite"),
    publicPath: "/js/lite-modules/",
    filename: "[name].bundle.js",
    libraryTarget: "assign",
    library: ["botpress", pkg.name]
  }
});

const compiler = webpack([nodeConfig, webConfig /*liteConfig*/]);
const postProcess = function(err, stats) {
  if (err) {
    throw err;
  }
  console.log(stats.toString("minimal"));
};

if (process.argv.indexOf("--compile") !== -1) {
  compiler.run(postProcess);
} else if (process.argv.indexOf("--watch") !== -1) {
  compiler.watch(null, postProcess);
}

module.exports = {
  web: webConfig,
  node: nodeConfig
  // lite: liteConfig
};
