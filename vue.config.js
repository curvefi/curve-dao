process.env.VUE_APP_VERSION = require('./package.json').version

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
	configureWebpack: {
		plugins: [
			new CompressionPlugin({ deleteOriginalAssets: true })
		]
	},
    // options...
    devServer: {
        disableHostCheck: true
    }
}
