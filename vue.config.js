// vue.config.js
module.exports = {
  // options...
  publicPath: "/timetable/",  //because its hosted at tutoa.co.nz/timetable
  devServer: {
    proxy: 'http://backend.test/',
  }
}
