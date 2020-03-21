process.env.VUE_APP_VERSION = require('./package.json').version

const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
	chainWebpack(config) {
		config.plugin('CompressionPlugin').use(CompressionPlugin)
	},
    // options...
    devServer: {
        disableHostCheck: true
    }
}
