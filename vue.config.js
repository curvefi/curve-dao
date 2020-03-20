process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
    // options...
    devServer: {
        disableHostCheck: true
    }
}
