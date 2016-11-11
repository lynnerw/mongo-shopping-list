//var mlab_URL = 'mongodb://mlabdb:2SunSky&Luv@ds139937.mlab.com:39937/thinkfullyn'; mlab_URL ||
exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       (process.env.NODE_ENV === 'production' ?
                            'mongodb://localhost/shopping-list' :
                            'mongodb://localhost/shopping-list-dev');
exports.PORT = process.env.PORT || 8080;