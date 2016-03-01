var fse = require('fs-extra');
var path = require('path');
var Q = require('q');
var underscore = require('underscore')._;
var Config = require('./config/config')();
var https = require('https');
var querystring = require('querystring');
var url = require('url');
var util = require('util');
var express = require('express');
var Search = require('bing.search');

Consts = {

	categoryList: {
		'20001': 'Productivity',
		'20002': 'Test'
	},

	responseRef: {
		'200': 'Success',
		'90001': 'Applicatio name or package Id already exists.',
		'90002': 'Wrong path provided for the resource file. Please re-do from the very begining.',
		'90003': 'No existing package. Please be confirm that.',
		'90004': 'The version exists, please choose another one.',
		'99999': 'System error.'
	}
};

Utils = {
	// File Operation
	readJSONDataBase: function() {
		fse.ensureDirSync(path.join(__dirname, Config.jsonDbFilePath));
		var jsonDBPath = path.join(__dirname, Config.jsonDbFilePath + Config.jsonDbFileName);
		jsonDB = fse.readJsonSync(jsonDBPath, {throws: false});

		return jsonDB;
	},

	updateJSONDataBase: function(pending_data) {
		var jsonDBPath = path.join(__dirname, Config.jsonDbFilePath + Config.jsonDbFileName);
		fse.writeJsonSync(jsonDBPath, pending_data);
	},

	handleResponse: function (responseCode) {
		var responseObj = {
			result: (responseCode === '200' ? true : false),
			code: responseCode,
			message: Consts.responseRef[responseCode]
		};

		console.log(Consts.responseRef[responseCode]);

		return responseObj;
	}
};

var IKSSearch = {
	// File Operation
	CreateNew: function () {
		var IKSSearchInstance = {};
		//


		IKSSearchInstance.PrepareIKSSearch=function(queryString)
		{
			console.log("querystring :"+queryString);
			var contents = JSON.stringify({
    		UserType: "User",
    		Company: "DEMO",
    		UserId: "zhi-xiang.wang@hp.com",
    		TransactionType: "Search_Request",
    		Language: "en-US",
    		Version: "2.1",
    		Payload: {
        		QueryString: queryString,
        		StartingAt: 0,
        		ReturnNumber: 10
	   		 }
			});
			this.contents=contents;
			
		}

		IKSSearchInstance.KnowlageSearch=function(queryString)
		{

			//this.PrepareIKSSearch(queryString);
			console.log("querystring :"+queryString);
			var contents = JSON.stringify({
    		UserType: "User",
    		Company: "DEMO",
    		UserId: "zhi-xiang.wang@hp.com",
    		TransactionType: "Search_Request",
    		Language: "en-US",
    		Version: "2.1",
    		Payload: {
        		QueryString: queryString,
        		StartingAt: 0,
        		ReturnNumber: 10
	   		 }
			});

			var _regUrl = "https://eitikwlb100-v.eit.ssn.hp.com:8443/IKSService/ProcessRequest";
			var post_option = url.parse(_regUrl);
			var headers = {
	        		'Content-Type': 'application/json',
	        		'Authorization': 'Basic SUtTVXNlcjpQQCQkdzByZDIwMTQ=',
	        		'Content-Length':contents.length,
	        		'Data-Type':'application/json'
	    		};
			post_option.method = 'POST';
			post_option.port = 8443;
			post_option.headers = headers;
			post_option.rejectUnauthorized = false;

	
			var deferred = Q.defer();
			this.SendRequest(post_option,contents).then(function(result){
				//console.log("result66666666666===== :"+result);
				if(result)
				{
					deferred.resolve(result);
				}
				else
				{
					deferred.reject(new Error("result is null"));
				}
				
			});
			
			return  deferred.promise;
		}

		IKSSearchInstance.SendRequest=function(post_option,contents)
		{
				var result="";
				var deferred = Q.defer();
				var request = https.request(post_option, function(response){
					response.setEncoding('utf8');
					console.log("enter response:");
		    		response.on('data', function(chunk){
		    			// console.log('BODY: ' + chunk);
		    			result+=chunk;
		    			 // process.stdout.write(chunk);
		        		//res.write(chunk);
		        		 console.log("result555555=====");
		    		});
		    		/* response.on('close', function(){
				        console.log("Close received!");
				        console.log("result===== :"+this.result);
				       // return result;
				    });*/
					response.on('end', function() {
		    			console.log("hello :"+result);
		    			deferred.resolve(result);
		    			//response.write(result);
		  			});
		    		response.on('error', function(err){
		        		console.log('RESPONSE ERROR: ' + err);
		        		deferred.reject(new Error(err));
		    		});
				}).on('error', function(e) {
				  console.log('problem with request: ' + e.message);
				});
				console.log("contents====="+contents);
				request.write(contents);
/*
				request.on('error', function(e) {
				  console.error(e);
				});*/
				request.end();
				return  deferred.promise;
		},



		IKSSearchInstance.GoogleSearch=function(queryString)
		{
/*			var searchString = 'https://developers.google.com/s/results?q=windows';
			https.get(searchString, function(response) {
				
				var result = "";
	  			response.on('data', function(d) {
	    			//process.stdout.write(d);
	    			console.log(d);
	    			result += d;
	  			});
	  			response.on('end', function(d) {
	    			//console.log(result);
	    			res.write(result);
	    			res.end();
	  			});
			}).on('error', function(e) {
  				console.error(e);
			});*/
			var deferred = Q.defer()
			search = new Search('UHsdf9r6zFp+ajtzzuuulYGDQxqTv3M3gEQOGS9JZKE');

				search.web(queryString,
  					{top: 10},
  					function(err, results) {
  						if (err) {
  							deferred.reject(new Error(err));
  						}
  						else
  						{
  							deferred.resolve(results);
    						console.log(util.inspect(results, 
      						{colors: true, depth: null}));
  						}
  					});
						return  deferred.promise;
		}

		return IKSSearchInstance;
	}
};

var App = {

	createNew: function() {
		var appInstance = {};
		var application = [];
		var app_name = null;
		var package_id = null;
		var app_info = null;
		var category_id = null;

		var applist = [];
		var os_type = null;
		var last_modified = null;
		var bytes = null;
		var version_code = null;
		var install_url = null;
		var active_flag = null;
		var app_logo = null;
		var alt_logo = null;

		appInstance.initWithExisting = function(app){
			this.application = app;
	　　},

		appInstance.initNewWithContent = function(appName, package_id, app_info, category_id, app_logo) {
			// TODO - check the existing json db to filter the same record.
			this.app_name = appName;
			this.package_id = package_id;
			this.app_info = app_info;
			this.category_id = category_id;

			this.application = {
				"app_name": appName,
				"package_id": package_id,
				"app_info": app_info,
				"category_id": category_id,
				"app_logo": app_logo,
				"alt_logo": appName,
				"package_list": []
			};
		},

		appInstance.createEmptyAppPackage = function () {
			return {
				"os_type": "",
				"last_modified": "",
				"bytes": "",
				"version_code": "",
				"install_url": "",
				"active_flag": ""
			}
		},

		appInstance.insertAppPackage = function(os_type, last_modified, bytes, version_code, install_url, active_flag, min_os, max_os) {
			this.application["package_list"].push({
				"os_type": os_type,
				"last_modified": last_modified,
				"bytes": bytes,
				"version_code": version_code,
				"install_url": install_url,
				"active_flag": active_flag,
				"min_os": min_os,
				"max_os": max_os
			});
		},

		appInstance.fetchAppPackage = function (os_type, version_code) {

			for (var i = 0; i < this.application["package_list"].length; i++) {
				var pack = this.application["package_list"][i];
				if (pack.version_code === version_code && pack.os_type == os_type) {
					return this.application["package_list"][i];
				}
			};

			return false;
		},

		// Remove the valid package, if success, return the package just removed, if not, return false
		appInstance.removeAppPackage = function (os_type, version_code) {

			for (var i = 0; i < this.application["package_list"].length; i++) {
				var pack = this.application["package_list"][i];
				if (pack.version_code === version_code && pack.os_type == os_type) {
					this.application["package_list"].splice(i, 1);
					return pack;
				}
			};

			return false;
		},

		// Remove the valid package, if success, return the package just removed, if not, return false
		appInstance.updateAppPackage = function (targetPack) {

			for (var i = 0; i < this.application["package_list"].length; i++) {
				var pack = this.application["package_list"][i];
				if (pack.version_code === targetPack.version_code && pack.os_type == targetPack.os_type) {
					this.application["package_list"][i].min_os = targetPack.min_os;
					this.application["package_list"][i].max_os = targetPack.max_os;
					return true;
				}
			};

			return false;
		},

		appInstance.getApp = function() {
			return this.application;
		}

		return appInstance;
	}
};

var CatalogApp = {

	createNew: function() {
		var catalogAppInstance = {};
		var appDB = [];

		catalogAppInstance.init = function () {
			console.log("initializing a new catalog App...");
			var existingAppDB = Utils.readJSONDataBase();
			var isExistingAppDBArray = (Object.prototype.toString.call(existingAppDB) === '[object Array]');

			if ((isExistingAppDBArray && existingAppDB.length === 0) || (!isExistingAppDBArray && (existingAppDB === null || existingAppDB.length === 0))) {
				this.appDB = {};
				this.appDB["app_list"] = [];
				this.updateAppDB();
			} else {
				this.appDB = existingAppDB;
			}
		},

		catalogAppInstance.updateAppDB = function() {
			Utils.updateJSONDataBase(this.appDB);
		},

		catalogAppInstance.retrieveAppList = function() {
			this.appDB = Utils.readJSONDataBase();
			return this.appDB["app_list"];
		},

		catalogAppInstance.fetchAppByName = function(appName) {
			var appList = this.retrieveAppList();
			var matchedApp = [];

			for (i = 0; i < appList.length; i++) {
				var app = appList[i];
				if (app["app_name"] === appName) {
					matchedApp = app;
					break;
				}
			}

			return {app: matchedApp, index: i};
		},

		catalogAppInstance.fetchAppByPackageId = function(packageId) {
			var appList = this.retrieveAppList();
			var matchedApp = [];

			for (i = 0; i < appList.length; i++) {
				var app = appList[i];
				if (app["package_id"] === packageId) {
					matchedApp = app;
					break;
				}
			}

			return {app: matchedApp, index: i};
		},
		// https://domain_url/random_folder/package_id/os/version_code/package_id.extensionName
		catalogAppInstance.insertApp = function(app) {
			var deferred = Q.defer();
			var matchedAppByAppName = this.fetchAppByName(app["app_name"]).app;
			var matchedAppByPackageId = this.fetchAppByPackageId(app["package_id"]).app;

			if (!(matchedAppByAppName.hasOwnProperty("app_name")) && !(matchedAppByPackageId.hasOwnProperty("app_name"))) {
				app.app_logo = app.app_logo.replace(/\\/g, '\/');
				if (app.app_logo.indexOf('public/uploads/temp') === 0) {
					var logoSplitted = app.app_logo.split('.');
					var relativeUsableLink = 'uploads/' + app.package_id + '/icon.' + logoSplitted[logoSplitted.length - 1];
					var dest = 'public/' + relativeUsableLink;
					var self = this;

					console.log('public/uploads/' + app.package_id);

					// Run this line to make sure the folder existing.
					fse.ensureDirSync('public/uploads/' + app.package_id);
					fse.move(app.app_logo, dest, {clobber: true}, function(err) {
					  	if (err) {
						  	console.log(JSON.stringify(err));
				  			deferred.reject(Utils.handleResponse('99999'));
				  		}
					  	console.log("success!");
					  	app.app_logo = Config.serverHostUrl + relativeUsableLink;
						self.appDB["app_list"].push(app);
						self.updateAppDB();
						deferred.resolve(Utils.handleResponse('200'));
					})
				} else {
					deferred.reject(Utils.handleResponse('90002'));
				}
			} else {
				deferred.reject(Utils.handleResponse('90001'));
			}
			return deferred.promise;
		},

		catalogAppInstance.removeAppByName = function(appName) {
			var deferred = Q.defer();

			console.log("Removing an app..." + appName);

			var appList = this.retrieveAppList();
			var matchedApp = [];

			for (i = 0; i < appList.length; i++) {
				var app = appList[i];
				if (app["app_name"] === appName) {
					var self = this;

					fse.remove('public/uploads/' + app.package_id, function (err) {
						if (err) deferred.reject(Utils.handleResponse('99999'));
						appList.splice(i, 1);
						self.appDB["app_list"] = appList;
						self.updateAppDB();
						deferred.resolve(Utils.handleResponse('200'));
					});
					break;
				}
			}

			return deferred.promise;
		},

		catalogAppInstance.updateAppByName = function(appName, newApp) {
			var deferred = Q.defer();

			var matchedAppObj = this.fetchAppByName(appName);

			var app = matchedAppObj.app;
			// Store all the updated fields expect for app_logo
			for (var key in app) {
				if (newApp.hasOwnProperty(key)) {
					if (key === 'app_name' || key === 'package_list' || key === 'package_id') {
						continue;
					}

					// Rename the folder name
					// if (key === 'package_id' && app[key] !== newApp[key]) {
					// 	fse.renameSync('public/uploads/' + app[key], 'public/uploads/' + newApp[key])
					// }

					app[key] = newApp[key];
				}
			}
			this.appDB["app_list"][matchedAppObj.index] = app;

			// Deal with app_logo seperately
			newApp.app_logo = newApp.app_logo.replace(/\\/g, '\/');
			if (newApp.app_logo.indexOf('public/uploads/temp') === 0) {
				var logoSplitted = newApp.app_logo.split('.');
				var relativeUsableLink = 'uploads/' + newApp.package_id + '/icon.' + logoSplitted[logoSplitted.length - 1];
				var dest = 'public/' + relativeUsableLink
				var self = this;

				// Run this line to make sure the folder existing.
				fse.ensureDirSync('public/uploads/' + newApp.package_id);
				fse.move(newApp.app_logo, dest, {clobber: true}, function(err) {
				  	if (err) deferred.reject(Utils.handleResponse('99999'));
				  	app.app_logo = Config.serverHostUrl + relativeUsableLink;
					self.appDB["app_list"][matchedAppObj.index] = app;
					self.updateAppDB();
					deferred.resolve(Utils.handleResponse('200'));
				})
			} else {
				this.updateAppDB();
				deferred.resolve(Utils.handleResponse('200'));
			}

			return deferred.promise;
		},

		catalogAppInstance.getPackagePathOnServer = function (app, pack) {
			var installUrlSplitted = pack.install_url.split('.');
			var pathOnServer = 'uploads/' + app.package_id + '/' + pack.os_type + '/' + pack.version_code + '/' + app.package_id + '.' + installUrlSplitted[installUrlSplitted.length - 1];

			return pathOnServer;
		},

		catalogAppInstance.getPackageParentPathOnServer = function (app, pack) {
			return ('uploads/' + app.package_id + '/' + pack.os_type + '/' + pack.version_code);
		},

		// Insert a new package into the existing app
		// https://domain_url/random_folder/package_id/os/version_code/package_id.extensionName
		catalogAppInstance.insertAppPackage = function (appName, pack) {
			console.log("insertAppPackage...appName: " + appName + " " + JSON.stringify(pack));

			var deferred = Q.defer();

			var matchedAppObj = this.fetchAppByName(appName);
			var app = matchedAppObj.app;
			var duplicateVersion = false;

			if (app.hasOwnProperty("app_name")) {
				for (var i = 0; i < app.package_list.length; i++) {
					if (app.package_list[i].version_code === pack.version_code && app.package_list[i].os_type === pack.os_type) {
						duplicateVersion = true;
						deferred.reject(Utils.handleResponse('90004'));
						break;
					}
				};

				if (!duplicateVersion && pack.install_url.indexOf('public/uploads/temp') === 0 
					|| encodeURIComponent(pack.install_url).indexOf(encodeURIComponent('public\\uploads\\temp')) === 0) {
					var pathOnServer = this.getPackagePathOnServer(app, pack);
					var dest = 'public/' + pathOnServer;
					var self = this;

					// Run this line to make sure the folder existing.
					fse.ensureDirSync('public/uploads/' + app.package_id + '/' + pack.os_type + '/' + pack.version_code);
					fse.move(pack.install_url, dest, {clobber: true}, function(err) {
					  	if (err) deferred.reject(Utils.handleResponse('99999'));

						//pack.install_url = Config.serverHostUrl + pathOnServer;
						if (pack.os_type === 'iOS') {
							var tempPath = Config.serverHostUrl + pathOnServer;
							pack.install_url = 'itms-services:///?action=download-manifest&url=' + tempPath.substring(0, tempPath.length - 3) + 'plist';
						} else if (pack.os_type === 'Android' || pack.os_type === 'Windows'){
                            pack.install_url = Config.serverHostUrl + pathOnServer;
						}

						app.package_list.push({
							"os_type": pack.os_type,
							"last_modified": (new Date()).getTime(),
							"bytes": pack.bytes,
							"version_code": pack.version_code,
							"install_url": pack.install_url,
							"active_flag": pack.active_flag,
							"min_os": pack.min_os,
							"max_os": pack.max_os
						});

						self.appDB["app_list"][matchedAppObj.index] = app;
						self.updateAppDB();

						if (pack.os_type === 'iOS') {
							self.buildPlistFileForAppleOS(app, pack, dest);
						}

						deferred.resolve(Utils.handleResponse('200'));
					})
				} else {
					deferred.reject(Utils.handleResponse('90002'));
				}
			} else {
				deferred.reject(Utils.handleResponse('90001'));
			}

			return deferred.promise;
		},

		catalogAppInstance.fetchAppPackageByName = function(appName, os_type, version_code) {
			var matchedApp = this.fetchAppByName(appName).app;

			var app = App.createNew();
			app.initWithExisting(matchedApp);
			var result = app.fetchAppPackage(os_type, version_code);

			if (result) {
				return result;
			}
			return false;
		},

		catalogAppInstance.updateAppPackageByName = function(appName, pack) {
			var deferred = Q.defer();

			var matchedAppObj = this.fetchAppByName(appName);

			var app = App.createNew();
			app.initWithExisting(matchedAppObj.app);
			var updateResult = app.updateAppPackage(pack);

			if (updateResult) {
				this.appDB["app_list"][matchedAppObj.index] = app.getApp();
				this.updateAppDB();

				deferred.resolve(Utils.handleResponse('200'));
			} else {
				deferred.reject(Utils.handleResponse('90003'));
			}

			return deferred.promise;
		},


		catalogAppInstance.removeAppPackageByName = function(appName, os_type, version_code) {
			var deferred = Q.defer();

			var matchedAppObj = this.fetchAppByName(appName);

			var app = App.createNew();
			app.initWithExisting(matchedAppObj.app);
			var removedPack = app.removeAppPackage(os_type, version_code);

			if (removedPack) {
				var pathOnServer = this.getPackageParentPathOnServer(app.getApp(), removedPack);
				var self = this;
				fse.remove('public/' + pathOnServer, function (err) {
					if (err) deferred.reject(Utils.handleResponse('99999'));

					self.appDB["app_list"][matchedAppObj.index] = app.getApp();
					self.updateAppDB();

					deferred.resolve(Utils.handleResponse('200'));
				});
			} else {
				deferred.reject(Utils.handleResponse('90003'));
			}

			return deferred.promise;
		},

		catalogAppInstance.buildPlistFileForAppleOS = function (app, appPackage, dest) {
			var plistTemplatePath = path.join(__dirname, '../../views/template/plist_template.plist');

			templateContent = fse.readFileSync(plistTemplatePath, {encoding: 'utf8', autoClose: true});

			var outputPath = dest.substr(0, dest.lastIndexOf('.')) + '.plist';

			var templateObject = underscore.template(templateContent);
			var compiled = templateObject({_: underscore, app: app, pack: appPackage});
			fse.outputFileSync(outputPath, compiled, {encoding: 'utf8'});
		},

		catalogAppInstance.getAppDB = function () {
			return this.appDB;
		}
		return catalogAppInstance;
	}
};

module.exports.CatalogApp = CatalogApp;
module.exports.App = App;
module.exports.IKSSearch = IKSSearch;
module.exports.Consts = Consts;
module.exports.Utils = Utils;


// MainApp = {
// 	test: function() {
// 		// Start the Catalog App
		// var catalogApp = CatalogApp.createNew();

		// // Retrieve all the apps in the system
		// var appList = catalogApp.retrieveAppList();
		// console.log((appList.length === 0 ? "√" : "X") + ' Empty App List<br>');

		// // Insert new app
		// var app = App.createNewWithExisting();
		// app.initAppWithContent("HPFS Business Dashboard", "com.hpit.hpfsbizdash", "HPFS Business Dashboard", 20001);
		// app.insertAppPackage(Config.osTypeList[10001], "2013-03-18T07:07:35.263370", 100230, "1.0.1", "https://installURl.xxx", 1);
		// app.insertAppPackage(Config.osTypeList[10002], "2015-03-10T07:07:35.263370", 100230, "2.0.1", "https://installURl.xxx", 1);

		// catalogApp.insertApp(app.getApp());
		// console.log(((catalogApp.retrieveAppList().length) === 1 ? "√" : "X") + ' Insert new app<br>');

		// var app3 = App.createNewWithExisting();
		// app3.initAppWithContent("ISCE Chat", "com.hpit.iscechat", "ISCE Chat", 20001);
		// app3.insertAppPackage(Config.osTypeList[10001], "2013-03-18T07:07:35.263370", 100230, "1.0.1", "https://installURl.xxx", 1);

		// catalogApp.insertApp(app3.getApp());
		// console.log(((catalogApp.retrieveAppList().length) === 2 ? "√" : "X") + ' Insert the second app<br>');

		// // Remove one app
		// catalogApp.removeAppByName("HPFS Business Dashboard");
		// console.log((empty(catalogApp.fetchAppByName("HPFS Business Dashboard")) ? "√" : "X") + ' Remove HPFS Business Dashboard app <br>');

		// // Insert a new package into the existing app
		// var tobeInsertedApp = catalogApp.fetchAppByName("ISCE Chat");
		// if (!empty(tobeInsertedApp)) {
		// 	var newApp = App.initWithExisting(tobeInsertedApp);
		// 	newApp.insertAppPackage(Config.osTypeList[10002], "2015-03-09T07:07:35.263370", 100230, "1.0.2", "https://installURl.xxx", 1);
		// 	catalogApp.updateApp(newApp.getApp());
		// }
		// console.log(((catalogApp.fetchAppByName("ISCE Chat")["package_list"]).length === 2 ? "√" : "X") + ' Add new package iOS<br>');
// 	}
// };

// new MainApp().test();

