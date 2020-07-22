// vue.config.js
module.exports = {
  // options...
  publicPath: "/timetable/",
  devServer: {
    proxy: 'http://backend.test/',
  }
}
