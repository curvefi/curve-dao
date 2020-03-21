process.env.VUE_APP_VERSION = require('./package.json').version

const HtmlCriticalWebpackPlugin = require("html-critical-webpack-plugin");

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

const path = require('path')

module.exports = {
	chainWebpack: config => {
		config.plugins.delete('prefetch')
	},
	configureWebpack: {
		plugins: [
			new HtmlCriticalWebpackPlugin({
		      base: path.join(path.resolve(__dirname), 'dist/'),
		      src: 'index.html',
		      dest: 'index.html',
		      inline: true,
		      minify: true,
		      extract: true,
		      width: 1400,
		      height: 1600,
		      penthouse: {
		        blockJSRequests: false,
		      }
		    }),
		    new BundleAnalyzerPlugin(),
		]
	},
    // options...
    devServer: {
        disableHostCheck: true
    }
}
