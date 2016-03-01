'use strict';

/* Services */

var appService = angular.module('myApp.services', []).
  value('version', '0.1.0');

appService.service("TinySpinnerService", function ($rootScope) {
  this.startSpin = function (key) {
    $rootScope.$broadcast('tiny-spinner:start', key);
  };

  this.stopSpin = function (key) {
    $rootScope.$broadcast('tiny-spinner:stop', key);
  };
});

appService.service("AlertMessageService", function ($rootScope) {
  this.showAlert = function (type, message) {
    $rootScope.$broadcast('alert-message:show', type);
  };
});

appService.service("errHandler",function ($rootScope) {
   this.parseError = function(){

            $('#errorModal').modal('show');
            this.rootScope.errorContent = "Server data format error";
      
        }
});

/**
  * JsonDBService: all the related service to operate the JSON DB
  *
  */
appService.service("JsonDBService", function ($http, $log, $q) {
  this.fetchJSONDB = function() {
    var deffed = $q.defer();

    // $http returns a promise, which has a then function, which also returns a promise
    $http.get('/api/fetchJSONDB')
      .success(function (data, status, headers, config) {
        deffed.resolve(data);
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    // Return the promise to the controller
    return deffed.promise;
  };

  this.fetchAllSupportOS = function() {
    var deffed = $q.defer();

    // $http returns a promise, which has a then function, which also returns a promise
    $http.get('/api/fetchAllSupportOS')
      .success(function (data, status, headers, config) {
        deffed.resolve(data);
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    // Return the promise to the controller
    return deffed.promise;
  }
});

appService.service("AppService", function ($http, $log, $q) {

  this.fetchAppByName = function (appName) {
    var deffed = $q.defer();
    $http.get('/api/fetchAppByName/' + appName)
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };

  this.removeApp = function (appName) {
    var deffed = $q.defer();
    $http.delete('/api/removeApp/' + appName)
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };

  this.updateAppByName = function (app) {
    var deffed = $q.defer();
    $http.post('/api/updateAppByName', JSON.stringify(app))
      .success(function(data) {
        if (data.result) {
          deffed.resolve(data);
        } else {
          deffed.reject(data);
        }
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };

  this.insertApp = function (app) {
    var deffed = $q.defer();
    $http.post('/api/insertApp', JSON.stringify(app))
      .success(function(data) {
        if (data.result) {
          deffed.resolve(data);
        } else {
          deffed.reject(data);
        }
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };


   this.Search = function (app) {
    var deffed = $q.defer();
    $http.post('/api/knowladgeSearch', JSON.stringify(app))
      .success(function(data) {
        if (data) {
          deffed.resolve(data);
        } else {
          deffed.reject(data);
        }
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };



   this.google = function (app) {
    var deffed = $q.defer();
    $http.post('/api/googleSearch', JSON.stringify(app))
      .success(function(data) {
        if (data) {
          deffed.resolve(data);
        } else {
          deffed.reject(data);
        }
      })
      .error(function (data, status, headers, config) {
        deffed.reject(data);
      });

    return deffed.promise;
  };



  this.calcOSDistribution = function (appList) {
    var iOSCount = 0, androidCount = 0;

    for (var i = 0; i < appList.length; i++) {
      var app = appList[i];
      var packageList = app["package_list"];
      if (packageList !== undefined && packageList.length > 0) {

        // TODO Replace the consts
        for (var j = 0; j < packageList.length; j++) {
          if (packageList[j].os_type === "10001") {
            iOSCount++;
          } else if (packageList[j].os_type === "10002") {
            androidCount++;
          }
        };
      }
    }

    return {"ios":  iOSCount, "android": androidCount};
  };
});

appService.service("AppPackageService", function ($http, $log, $q) {
  this.removeAppPackage = function (appName, osType, versionCode) {
    var deffed = $q.defer();
    $http.post('/api/removeAppPackage', '{"appName":"' + appName + '","osType":"' + osType + '","versionCode":"' + versionCode + '"}')
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (response) {
        deffed.reject(response);
      });

    return deffed.promise;
  };

  this.updateAppPackage = function (appName, appPackage) {
    var deffed = $q.defer();
    $http.post('/api/updateAppPackageByName', '{"appName":"' + appName + '","pack":' + JSON.stringify(appPackage) + '}')
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (response) {
        deffed.reject(response);
      });

    return deffed.promise;
  };

  this.insertAppPackage = function (appName, appPackage) {
    var deffed = $q.defer();
    $http.post('/api/insertAppPackage', '{"appName":"' + appName + '","pack":' + JSON.stringify(appPackage) + '}')
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (response) {
        deffed.reject(response);
      });

    return deffed.promise;
  };

  this.removeAppPackage = function (appName, appPackage) {
    var deffed = $q.defer();

    $http.post('/api/removeAppPackage', '{"appName":"' + appName + '","osType":"' + appPackage.os_type + '","versionCode":"' + appPackage.version_code + '"}')
      .success(function(data) {
        deffed.resolve(data);
      })
      .error(function (response) {
        deffed.reject(response);
      });

    return deffed.promise;
  };

  this.splitPackagesByOSTypes = function (availableOS, packageList) {
    var packagesDist = [];

    for (var osKey in availableOS) {
      packagesDist[osKey] = [];
    }

    for (var i = 0; i < packageList.length; i++) {
      var pack = packageList[i];
      packagesDist[pack.os_type].push(pack);
    }

    return packagesDist;
  };

});