
/**
 * Module dependencies  
 */

var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  multer = require('multer'),
  catalogAppModel = require('./public/js/catalogAppModel'),
  path = require('path');

var app = module.exports = express();

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(morgan('dev'));

app.use(bodyParser.json({
  extended: true
}));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(methodOverride());
app.use(express.static(path.join(__dirname + '/public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  // app.use(express.errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

var multerForImage = multer({ dest: 'public/uploads/temp/image',
  rename: function (fieldname, filename) {
    return filename;
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.originalname + ' uploaded to  ' + file.path)
  }
});

var multerForPackage = multer({ dest: 'public/uploads/temp/package',
  rename: function (fieldname, filename) {
    return filename;
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.originalname + ' uploaded to  ' + file.path)
  }
});

/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);
app.get('/api/fetchJSONDB', api.fetchJSONDB);
app.get('/api/fetchAllSupportOS', api.fetchAllSupportOS);
app.get('/api/fetchAppByName/:appName', api.fetchAppByName);
app.get('/api/fetchAppPackage/:appName/:osType/:versionCode', api.fetchAppPackage);
app.delete('/api/removeApp/:appName', api.removeApp);
app.post('/api/removeAppPackage', api.removeAppPackage);
app.post('/api/updateAppPackageByName', api.updateAppPackageByName);
app.post('/api/insertAppPackage', api.insertAppPackage);
app.post('/api/insertApp', api.insertApp);
app.post('/api/knowladgeSearch', api.knowladgeSearch);
app.post('/api/googleSearch', api.googleSearch);
app.post('/api/updateAppByName', api.updateAppByName);
app.get('/api/editApp', api.editApp);
app.post('/api/uploadImageFile', multerForImage, function(req, res) {
  console.log(req.body); // form fields
  console.log(req.files); // form files
  res.status(200).end(req.files.file.path);
});
app.post('/api/uploadPackageFile', multerForPackage, function(req, res) {
  console.log(req.body); // form fields
  console.log(req.files); // form files
  res.status(200).end(req.files.file.path);
});

app.post('/api/editPackage', function(req, res) {

  var catalogApp = catalogAppModel.CatalogApp.createNew();
  catalogApp.init();
  var matchedApp = catalogApp.fetchAppByName(req.body.appName);
  console.log("fetchAppByName result..." + result);

  if (!empty(matchedApp)) {
     var newApp = App.createNewWithExisting(matchedApp);
     newApp.insertAppPackage(Consts.osTypeList[10002], "2015-03-09T07:07:35.263370", 100230, "1.0.2", "https://installURl.xxx", 1, "https://installURl.xxx");
    //  catalogApp.updateApp(newApp.getApp());

  }
});

// app.post('/api/editPackage', function(req, res) {
//   console.log(req.body); // form fields
//   console.log(req.files); // form files
//   res.status(204).end();

//   var catalogApp = catalogAppModel.CatalogApp.createNew();
//   catalogApp.init();
//   var matchedApp = catalogApp.fetchAppByName(req.body.appName);
//   console.log("fetchAppByName result..." + result);

//   if (empty(matchedApp)) {
//     catalogApp.insertApp({
//       "app_name": req.body.appName,
//       "package_id": req.body.packageId,
//       "app_info": req.body.appInfo,
//       "category_id": "",
//       "app_logo": req.files,
//       "alt_logo": req.body.appName,
//       "app_list": []
//     });
//   } else {
//     var newApp = App.createNewWithExisting(matchedApp);
//     newApp.insertAppPackage(Consts.osTypeList[10002], "2015-03-09T07:07:35.263370", 100230, "1.0.2", "https://installURl.xxx", 1, "https://installURl.xxx");
//     //  catalogApp.updateApp(newApp.getApp());
//   }

  // if (req.method === 'POST') {
  //    var busboy = new Busboy({ headers: req.headers });
  //    var fileCount = 0;
  //    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
  //        var saveTo = path.join('public/uploads/', path.basename(filename));
  //        var fstream = fse.createWriteStream(saveTo);
  //    console.log('file ' + filename + ' uploading');
  //        file.pipe(fstream);

  //        fstream.on('close', function(){
  //             console.log('file ' + filename + ' uploaded');
  //             fileCount = 1;
              
  //         });
  //     });
  //     busboy.on('finish', function() {
  //    console.log('Finished');
  //    if (fileCount === 1) {
  //      res.writeHead(200, { 'Connection': 'close' });
  //          res.end("That's all folks!");
  //    }
  //     });
  //     busboy.on('end', function() {
  //    console.log('end');
  //     });
  //     return req.pipe(busboy);
  //  }

  // res.writeHead(404);
  // res.end();

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);


/**
 * Start Server
 */

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});