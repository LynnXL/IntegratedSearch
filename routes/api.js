/*
 * Serve JSON to our AngularJS client
 */
var fse = require('fs-extra');
var path = require('path');
var os = require('os');
var express = require('express');
var multer = require('multer');
var Config = require('../public/js/config/config')();
var https = require('https');
var url = require('url');

var catalogAppModel = require('../public/js/catalogAppModel');

exports.name = function (req, res) {
  res.json({
    name: 'Bob'
  });
}

exports.fetchJSONDB = function (req, res) {
	var jsonDB = catalogAppModel.Utils.readJSONDataBase();
	if (jsonDB === null) {
		var catalogApp = catalogAppModel.CatalogApp.createNew();
		catalogApp.init();
		jsonDB = catalogApp.getAppDB();
	}

	// Add OS Type list into response.
	jsonDB["os_type"] = Config.osTypeList;
	var appList = jsonDB["app_list"];

	// Iterate the applist to caculate the os cover
	for (var i = 0; i < appList.length; i++) {
		console.log(i);
		var app = appList[i];
		var packageList = app["package_list"];
		var osCover = [];

		// If the packagelist is not empty, go through it
		if (packageList !== undefined && packageList.length > 0) {
			for (var j = 0; j < packageList.length; j++) {
				var osType = packageList[j].os_type;
				if (osCover.indexOf(osType) === -1) {
					osCover.push(osType);
				}
			};
		}
		app["os_cover"] = osCover;
	};

	res.json(jsonDB);
}

exports.fetchAppPackage = function (req, res) {
	console.log("removeApp...appName: " + req.params.appName + "...osType: " + req.params.osType + "...versionCode: " + req.params.versionCode);

	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	var appPackage = catalogApp.fetchAppPackageByName(req.params.appName, req.params.osType, req.params.versionCode);
	res.json(appPackage);
}

exports.fetchAppByName = function (req, res) {
	console.log("removeApp...appName: " + req.params.appName);

	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	var app = catalogApp.fetchAppByName(req.params.appName);
	res.json(app);
}

exports.removeApp = function (req, res) {
	console.log("removeApp...appName: " + req.params.appName);

	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	catalogApp.removeAppByName(req.params.appName).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.updateAppPackageByName = function(req, res){
	console.log("updateAppPackageByName...appName: " + req.body.appName + "...osType: " + req.body.osType + "...bytes: " + req.body.bytes + "...versionCode: " + req.body.versionCode + "...installURl: " + req.body.installURl);

	// Insert a new package into the existing app
	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	catalogApp.updateAppPackageByName(req.body.appName, req.body.pack).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.insertAppPackage = function(req, res){
	console.log("insertAppPackage...appName: " + req.body.appName + "...osType: " + req.body.osType + "...bytes: " + req.body.bytes + "...versionCode: " + req.body.versionCode + "...installURl: " + req.body.installURl);

	// Insert a new package into the existing app
	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	catalogApp.insertAppPackage(req.body.appName, req.body.pack).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.removeAppPackage = function (req, res) {
	console.log("removeAppPackage...appName: " + req.body.appName);

	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	catalogApp.removeAppPackageByName(req.body.appName, req.body.osType, req.body.versionCode).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.insertApp = function (req, res) {
	console.log("insertApp...app_name: " + req.body.app_name + "package_id: " + req.body.package_id + "app_info: " + req.body.app_info + "category_id: " + req.body.category_id + "app_logo: " + req.body.app_logo + "alt_logo: " + req.body.alt_logo);
	// Insert a new package into the existing app
	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	var newApp = catalogAppModel.App.createNew();
	newApp.initNewWithContent(req.body.app_name, req.body.package_id, req.body.app_info, "", req.body.alt_logo);
	catalogApp.insertApp(newApp.getApp()).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.updateAppByName = function (req, res) {
	console.log("updateAppByName...app_name: " + req.body.app_name + "package_id: " + req.body.package_id + "app_info: " + req.body.app_info + "category_id: " + req.body.category_id + "app_logo: " + req.body.app_logo + "alt_logo: " + req.body.alt_logo);
	// Insert a new package into the existing app
	var catalogApp = catalogAppModel.CatalogApp.createNew();
	catalogApp.init();
	var newApp = catalogAppModel.App.createNew();
	newApp.initNewWithContent(req.body.app_name, req.body.package_id, req.body.app_info, "", req.body.app_logo);
	var result = catalogApp.updateAppByName(req.body.app_name, newApp.getApp()).then(
		function (response) {
			res.json(response);
		},
		function (err) {
			res.json(err);
		}
	);
}

exports.editApp = function (req, res) {
	console.log("editApp...");
}

exports.fetchAllSupportOS = function (req, res) {
	res.json(Config.osTypeList);
}

exports.knowladgeSearch = function(req, res){
	var searchInstance=catalogAppModel.IKSSearch.CreateNew();
	if(!searchInstance)
	{
		console.log("searchInstance is null");
		return;
	}
	var result = searchInstance.KnowlageSearch(req.body.query_string)
	 .then(
			function (response) {
				res.json(response);
			},
	 		function (err) {
	 			res.json(err);
	 		}
		);
}

exports.googleSearch = function(req, res){
	var searchInstance=catalogAppModel.IKSSearch.CreateNew();
	var result = searchInstance.GoogleSearch(req.body.query_string)
		 .then(
			function (response) {
				res.json(response);
			},
	 		function (err) {
	 			res.json(err);
	 		}
		);
}