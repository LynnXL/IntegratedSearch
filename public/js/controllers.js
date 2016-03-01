'use strict';

/* Controllers */

var app = angular.module('myApp.controllers', ['ui.bootstrap']);

app.controller('AppCtrl', function ($scope, $http) {

});

app.controller('appListController', function ($rootScope, $scope, $http, $modal, $location, $log, JsonDBService, AppService, AppPackageService, TinySpinnerService, AlertMessageService) {
 $scope.refreshAppList = function () {
   $scope.startSpin();
   $scope.gridOptions.data = [];
   JsonDBService.fetchJSONDB().then(
      function (data, status, headers, config) {
        var appList = data["app_list"];
        $scope.osTypes = data["os_type"];
        // Count the number of apps, iOS and Android packages
        $scope.appCount = appList.length;

        $scope.gridOptions.data = appList;

        // Set data for sub-grid
        for(var i = 0; i < appList.length; i++){
          // if (appList[i].package_list.length === 0) {
          //   break;
          // }
          appList[i].subGridOptions = {
            columnDefs: [
              {
                name:'OS',
                field: 'os_type',
                width: '60',
                cellTemplate: '<span><img width=24 ng-src="{{grid.appScope.getOsIcon(row.entity.os_type)}}"></span>'
              },
              {name: "Version", field: "version_code"},
              {name: "Modified At", field: "last_modified"},
              {
                name: "Size",
                field: "bytes",
                cellTemplate: '<span package-size=row.entity.bytes></span>'
              },
              {
                name: 'Action',
                cellTemplate: '<span ng-click="grid.appScope.appPackageConfirmDialog(row)" class="package-action-item glyphicon glyphicon-trash" aria-hidden="true"></span><span class="package-action-item glyphicon glyphicon-edit" ng-click="grid.appScope.editAppPackage(row)" aria-hidden="true"></span>'
              }
            ],
            data: appList[i].package_list
          }
        }

        var osCountResult = AppService.calcOSDistribution(data["app_list"]);
        $scope.iOSCount = osCountResult.ios;
        $scope.androidCount = osCountResult.android;
        $scope.stopSpin();
      },
      function (err) {
        $log.error(JSON.stringify(err));

        // Send out the broadcast to message system
        AlertMessageService.showAlert({'dependId': 'app-list', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});

      }
    );
 }
  // error(function (data, status, headers, config) {
  //   $scope.name = 'Error!';
  // });

  $scope.gridOptions = {
    enableSorting: true,
    enableFiltering: true,
    rowHeight: 50,
    expandableRowTemplate: '<div ui-grid="row.entity.subGridOptions" style="height:140px;"></div>',
    expandableRowHeight: 150,
    enableRowSelection: true,
    enableRowHeaderSelection: false,
    selectionRowHeaderWidth: 35,
    multiSelect: false,
    // onRegisterApi: function (gridApi) {
    //   gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
    //     if (row.isExpanded) {
    //       row.entity.subGridOptions = {
    //         columnDefs: [
    //         { name: 'name'},
    //         { name: 'gender'},
    //         { name: 'company'}
    //       ]};

    //       $http.get('/data/100.json')
    //         .success(function(data) {
    //           row.entity.subGridOptions.data = data;
    //         });
    //     }
    //   });
    // }
    //subGridVariable will be available in subGrid scope
    expandableRowScope: {
      editAppPackage: function(row) {
        $scope.editAppPackage(row);
      },
      appPackageConfirmDialog: function (row) {
        var modalInstance = $modal.open({
          templateUrl: 'appPackageConfirmModal.html',
          controller: 'appPackageModalInstanceController',
          resolve: {
            currentAppPackage: function () {
              return row;
            }
           }
         });
      },
      getOsIcon: function (type) {
        return 'img/osLogo/' + type + '_sm.png';
      }
    },

    columnDefs: [
      {
        name:'Icon',
        field: 'app_logo',
        width: '60',
        cellClass: 'app-logo-cell',
        enableColumnMenu: false,
        enableSorting: false,
        enableFiltering: false,
        cellTemplate: '<app-logo-icon applogo="row.entity.app_logo"></app-logo-icon>'
      },
      { name:'App Name', field: 'app_name', enableFiltering: true },
      { name:'Package Identifier', field: 'package_id', enableFiltering: true },
      { name:'Info', field: 'app_info', enableSorting: false, enableFiltering: false, enableColumnMenu: false},
      {
        name:'OS',
        field: 'os_cover',
        width: '80',
        enableSorting: false,
        enableFiltering: false,
        enableColumnMenu: false,
        cellTemplate: '<span ng-repeat="os in row.entity.os_cover"><img width=24 ng-src="img/osLogo/{{os}}_sm.png"></span>'
      },
      {
        name: 'Action',
        enableSorting: false,
        enableFiltering: false,
        enableColumnMenu: false,
        cellTemplate: '<span ng-mouseover="appActionItemVisible = true" ng-mouseleave="appActionItemVisible = false" ng-init="appActionItemVisible=false"><span class="app-action-item glyphicon glyphicon-trash" aria-hidden="true" ng-click="grid.appScope.appConfirmDialog(row.entity.app_name)"></span><span class="app-action-item glyphicon glyphicon-edit" aria-hidden="true" ng-click="grid.appScope.editApp(row.entity.app_name)"></span></span>'
      }
    ]
  };

  $scope.removeApp = function (appName) {
    $scope.stopSpin();
    AppService.removeApp(appName).then(
      function (response) {
        if (response.result) {
          $scope.refreshAppList();
        }
        $scope.stopSpin();
      },
      function (err) {
        // Send out the broadcast to message system
        AlertMessageService.showAlert({'dependId': 'app-list', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));

        $scope.stopSpin();
      }
    );
  };

  $scope.editApp = function (appName) {
    $location.url('editApp?appName=' + appName);
  };

  $scope.editAppPackage = function (row) {
    console.log('editAppPackage...');
    $location.url('/editApp?appName=' + row.grid.parentRow.entity.app_name + '&osType=' + row.entity.os_type + '&versionCode=' + row.entity.version_code);
  };

  $scope.removeAppPackage = function (appName, pack) {
    console.log('removeAppPackage...');
    $scope.startSpin();
    AppPackageService.removeAppPackage(appName, pack).then(
      function(data) {
        $log.info(data);
        $scope.stopSpin();
      },
      function(err) {
        AlertMessageService.showAlert({'dependId': 'app-list', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));
        $scope.stopSpin();
      }
    );
  };

  $scope.startSpin = function() {
    TinySpinnerService.startSpin('spinner-1');
  };

  $scope.stopSpin = function() {
    TinySpinnerService.stopSpin('spinner-1');
  };

  $scope.go = function ( path ) {
    $location.path(path);
  };

  $scope.appConfirmDialog = function (appName) {
    var modalInstance = $modal.open({
      templateUrl: 'appConfirmModal.html',
      controller: 'appModalInstanceController',
      resolve: {
        currentAppName: function () {
          return appName;
        }
       }
     });
  };
  $scope.$on('deleteEvent', function(event, args) {
    //$scope.refreshAppList();
    var len = $scope.gridOptions.data.length;
    for (var i=0; i < len; i++) {
      var temp = $scope.gridOptions.data[i];
      if (temp.app_name === args){
          $scope.gridOptions.data.splice(i, 1);
      }
    }
  });
  $scope.$on('deletePackageEvent', function(event, args) {
    //$scope.refreshAppList();
    var appName = args.grid.parentRow.entity.app_name,
        appPackageVersion = args.entity.version_code,
        appPackageOsType = args.entity.os_type;

    var len = $scope.gridOptions.data.length,
        len2;
    for (var i=0; i < len; i++) {
      var temp = $scope.gridOptions.data[i];
      if (temp.app_name === appName){
          len2 =  temp.package_list.length;
          for (var j=0; j< len2; j++){
              var temp2 = temp.package_list[j];
              if(temp2.os_type === appPackageOsType && temp2.version_code === appPackageVersion){
                  $scope.gridOptions.data[i].package_list.splice(j, 1);
              }
          }
      }
    }
  });
  $scope.refreshAppList();
});
app.controller('appModalInstanceController', function ($rootScope, $scope, $log, $modalInstance, AppService, AlertMessageService, currentAppName) {
  $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
  };
  $scope.appName = currentAppName;
  $scope.removeApp = function (appName) {
    AppService.removeApp(appName).then(
      function (response) {
        if (response.result) {
          $modalInstance.dismiss('cancel');
          $rootScope.$broadcast('deleteEvent', currentAppName);
        }
      },
      function (err) {
        AlertMessageService.showAlert({'dependId': 'app-list', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));
      }
    );
  };
});
app.controller('appPackageModalInstanceController', function ($rootScope, $scope, $log, $modalInstance, AppPackageService, AlertMessageService, currentAppPackage) {
  $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
  };
  $scope.appName = currentAppPackage.grid.parentRow.entity.app_name;
  $scope.pack = currentAppPackage.entity;
  $scope.removeAppPackage = function (appName, pack) {
    console.log('removeAppPackage...');
    AppPackageService.removeAppPackage(appName, pack).then(
      function(data) {
        $log.info(data);
        $modalInstance.dismiss('cancel');
        $rootScope.$broadcast('deletePackageEvent',currentAppPackage);
      },
      function(err) {
        AlertMessageService.showAlert({'dependId': 'app-list', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));
      }
    );
  };
});
app.controller('appPackageEditController', function ($scope, $modalInstance, $http, $location, $log, $route, AppPackageService, TinySpinnerService, AlertMessageService, FileUploader, currentAppPackage, currentApp, osTypeCode, osInfo) {
  $scope.fetchAppPackage = function () {
    $scope.stopSpin();
    if (currentApp && currentAppPackage === undefined) {
        var emptyPackage = {
          "os_type": osTypeCode,
          "bytes": "",
          "version_code": "",
          "install_url": "",
          "min_os": "",
          "max_os": "",
          "active_flag": true
        };
        $scope.currentAppPackage = emptyPackage;
        $scope.creatingAppPackageStatus = true;
        $scope.packageFileReady = false;
    } else {
        $scope.currentAppPackage = currentAppPackage;
        $scope.creatingAppPackageStatus = false;
        $scope.packageFileReady = true;
    }

    var installUrlSplited = $scope.currentAppPackage.install_url.split('.');
    // if (installUrlSplited[installUrlSplited.length - 1].toLowerCase() === "ipa") {
    //   $scope.qrUrl = 'itms-services:///?action=download-manifest&url=' + $scope.currentAppPackage.install_url.substring(0, $scope.currentAppPackage.install_url.length - 3) + 'plist';
    // } else {
    //   $scope.qrUrl = $scope.currentAppPackage.install_url;
    // }
    console.log($scope.currentAppPackage.install_url);
    $scope.qrUrl = $scope.currentAppPackage.install_url;
    $scope.osTypeCode = osTypeCode;
    $scope.matchedOsInfo = osInfo[osTypeCode].version_history;
    //$scope.currentAppPackage.install_url = $scope.qrUrl;
    $scope.$on('modal.show',function(){
      console.log("show");
    });
  };

  var uploader = $scope.uploader = new FileUploader({
          url: '/api/uploadPackageFile'
      });

  // FILTERS
  uploader.filters.push({
    name: 'customFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      var name = item.name.split('.');
      var fileTypeValid = false;
      var correctFileType = '';

      if (osTypeCode === 'iOS') {
        correctFileType = 'IPA';
        fileTypeValid = (name[name.length - 1].toLowerCase() === "ipa");
      } else if (osTypeCode === 'Android') {
        correctFileType = 'APK';
        fileTypeValid = (name[name.length - 1].toLowerCase() === "apk");
      } else if (osTypeCode === 'Windows') {
        correctFileType = 'XAP';
        fileTypeValid = (name[name.length - 1].toLowerCase() === "xap");
      }

      if (!fileTypeValid) {
        AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'warning', 'message': 'Please choose the correct *.' + correctFileType + ' file.'});
      }

      return fileTypeValid;
    }
  });

  // Callbacks for Angular-file-upload
  uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
      console.info('onWhenAddingFileFailed', item, filter, options);
  };
  uploader.onAfterAddingFile = function(fileItem) {
    $scope.packageFileReady = false;
    console.info('onAfterAddingFile', fileItem);
    $scope.packageFile = fileItem;
    $scope.currentAppPackage.bytes = $scope.packageFile.file.size;
    if (uploader.queue.length !== 1) {
      uploader.queue.splice(0, 1); // only one file in the queue
    }
  };
  uploader.onProgressItem = function(fileItem, progress) {
    $scope.packageFileReady = false;
    console.info('onProgressItem', fileItem, progress);
  };
  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    $scope.packageFileReady = true;
    console.info('onSuccessItem', fileItem, response, status, headers);
  };
  uploader.onCompleteItem = function(fileItem, response, status, headers) {
    $scope.currentAppPackage.install_url = response;
    $scope.packageFileReady = true;
    console.info('onCompleteItem', fileItem, response, status, headers);
  };

  $scope.delete = function () {
    $scope.startSpin();
    AppPackageService.removeAppPackage(currentApp.app_name, $scope.currentAppPackage).then(
      function(response) {
        if (response.result) {
          $route.reload();
          $modalInstance.dismiss('cancel');
        } else {
          AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
          $log.error(JSON.stringify(response));
        }
        $scope.stopSpin();
      },
      function(err) {
        AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));
        $scope.stopSpin();
      }
    );
  };
  $scope.maxIsBtMin = function (min, max){
    var flag = true, 
        minArray, maxArray;
    if (min && max){
      minArray = min.split('.');
      maxArray = max.split('.');
      var len = maxArray.length > minArray.length ? minArray.length : maxArray.length;
      for (var i=0; i<len; i++){
          if (minArray[i] > maxArray[i]) {
            return false;
          }
      }
    }
    
    return flag;
  };
  $scope.ok = function () {
    $scope.submitted = true;
    var packageVersionCodePattern = /^\d+(\.\d+){1,2}$/;
    $scope.versionCodeValidation = packageVersionCodePattern.test($scope.currentAppPackage.version_code);
    $scope.startSpin();
    if (!$scope.maxIsBtMin($scope.currentAppPackage.min_os, $scope.currentAppPackage.max_os)){
      AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': 'Please make sure Max version greater than Min version'});
      return;
    }
    if ($scope.packageFileReady && $scope.packageForm.$dirty && $scope.versionCodeValidation) {
      if ($scope.creatingAppPackageStatus) {
        AppPackageService.insertAppPackage(currentApp.app_name, $scope.currentAppPackage).then(
          function(response) {
            if (response.result) {
              // $route.reload();
              $modalInstance.dismiss('cancel');
              $location.url('editApp?appName=' + currentApp.app_name + '&osType=' + $scope.currentAppPackage.os_type + '&versionCode=' + $scope.currentAppPackage.version_code);
              // AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'success', 'message': 'Success to insert the package into this app.'});
            } else {
              AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
              $log.error(JSON.stringify(response));
            }
            $scope.stopSpin();
          },
          function(err) {
            AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
            $log.error(JSON.stringify(err));
            $scope.stopSpin();
          }
        );
      } else {
        AppPackageService.updateAppPackage(currentApp.app_name, $scope.currentAppPackage).then(
          function(response) {
            if (response.result) {
              // $route.reload();
              $modalInstance.dismiss('cancel');
            } else {
              AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
              $log.error(JSON.stringify(response));
            }
            $scope.stopSpin();
          },
          function(err) {
            AlertMessageService.showAlert({'dependId': 'package-modal', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
            $log.error(JSON.stringify(err));
            $scope.stopSpin();
          }
        );
      }
    } else {
      $scope.stopSpin();
    }
  };




  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.startSpin = function() {
    TinySpinnerService.startSpin('spinner-1');
  };

  $scope.stopSpin = function() {
    TinySpinnerService.stopSpin('spinner-1');
  };

  $scope.fetchAppPackage();
});
// Controller for edit an app
app.controller('editAppController', function ($scope, $timeout, $http, $modal, $route, $routeParams, $location, $log, JsonDBService, AppService, AppPackageService, TinySpinnerService, AlertMessageService, FileUploader) {

  $scope.fetchApp = function () {
    $scope.logoFileReady = false;
    if (angular.isDefined($routeParams.osType)) {
      $scope.osTypeCode = $routeParams.osType;
    } else {
      $scope.osTypeCode = '10001';
    }

    if ($routeParams.appName !== undefined) {
      $scope.startSpin();

      // Fetch all the available os
      JsonDBService.fetchAllSupportOS().then(
        function (data) {
          $scope.availableOS = data;
          // Fetch the matched app
          AppService.fetchAppByName($routeParams.appName).then(
            function (data, status, headers, config) {
              $scope.currentApp = data.app;
              $scope.logoFileReady = true;

              if ($scope.currentApp.hasOwnProperty("package_list")) {
                for (var i = 0; i < $scope.currentApp["package_list"].length; i++) {
                  var pack = $scope.currentApp["package_list"][i];
                  $scope.splitedPackageList = AppPackageService.splitPackagesByOSTypes($scope.availableOS, $scope.currentApp["package_list"]);

                  if (pack.version_code === $routeParams.versionCode && pack.os_type === $scope.osTypeCode) {
                    // $scope.currentAppPackage = $scope.currentApp["package_list"][i];
                    $scope.open($scope.osTypeCode, $scope.currentApp, $scope.currentApp["package_list"][i]);
                    break;
                  }
                }
              }
              $scope.stopSpin();
            },
            function (data, status, headers, config) {
              $scope.name = 'Error!';
              $scope.stopSpin();
            }
          );
        },
        function () {
          $scope.stopSpin();
        }
      );

      $scope.creatingAppStatus = false;
    } else {
      var emptyApp = {
        "app_name": "",
        "package_id": "",
        "app_info": "",
        "category_id": "",
        "app_logo": "",
        "alt_logo": "",
        "package_list": []
      };

      $scope.currentApp = emptyApp;
      $scope.creatingAppStatus = true;
    }
  };

  $scope.open = function (osTypeCode, currentApp, currentPackage) {

    var modalInstance = $modal.open({
      templateUrl: 'editPackageModal.html',
      controller: 'appPackageEditController',
      size: 'lg',
      resolve: {
        currentAppPackage: function () {
          return currentPackage;
        },
        currentApp: function () {
          return currentApp;
        },
        osTypeCode: function () {
          return osTypeCode;
        },
        osInfo: function () {
          return $scope.availableOS;
        }
       }
    });

    modalInstance.opened.then(function () {
      $timeout(function(){
        $scope.stopSpin();
      }, 200);

    }, function () {
      // $log.info('Modal dismissed at: ' + new Date());
    });
  };

  var uploader = $scope.uploader = new FileUploader({
          url: '/api/uploadImageFile'
      });

  uploader.filters.push({
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          var fileTypeValid = '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;

          if (!fileTypeValid) {
            AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'warning', 'message': 'Please choose the correct image file.'});
          }

          return fileTypeValid;
      }
  });

  // CALLBACKS
  uploader.onAfterAddingFile = function(fileItem) {
      console.info('onAfterAddingFile', fileItem);
      $scope.logoFileReady = false;
      console.info('onAfterAddingFile', fileItem);
      $scope.logoFile = fileItem;
      if (uploader.queue.length !== 1) {
        uploader.queue.splice(0, 1); // only one file in the queue
      }
  };
  // uploader.onAfterAddingAll = function(addedFileItems) {
//     console.info('onAfterAddingAll', addedFileItems);
  // };
  // uploader.onBeforeUploadItem = function(item) {
//     console.info('onBeforeUploadItem', item);
  // };
  uploader.onProgressItem = function(fileItem, progress) {
    $scope.logoFileReady = false;
    console.info('onProgressItem', fileItem, progress);
  };
  // uploader.onProgressAll = function(progress) {
//     console.info('onProgressAll', progress);
  // };
  uploader.onSuccessItem = function(fileItem, response, status, headers) {
    $scope.logoFileReady = true;
    console.info('onSuccessItem', fileItem, response, status, headers);
  };
  // uploader.onErrorItem = function(fileItem, response, status, headers) {
//     console.info('onErrorItem', fileItem, response, status, headers);
  // };
  // uploader.onCancelItem = function(fileItem, response, status, headers) {
//     console.info('onCancelItem', fileItem, response, status, headers);
  // };
  uploader.onCompleteItem = function(fileItem, response, status, headers) {
    $scope.logoFileReady = true;
    $scope.iconTransferingLink = response;
    $scope.editAppForm.$dirty = true;

    console.info('onCompleteItem', fileItem, response, status, headers);
  };
  // uploader.onCompleteAll = function() {
//     console.info('onCompleteAll');
  // };

  // TODO
  $scope.delete = function () {
    $scope.startSpin();
    AppService.removeApp($scope.currentApp.app_name).then(
      function (response) {
        if (response.result) {

        } else {
          AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
          $log.error(JSON.stringify(response));
        }
        $scope.stopSpin();
      },
      function (err) {
        AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
        $log.error(JSON.stringify(err));
        $scope.stopSpin();
      }
    );
  };

  $scope.ok = function () {
    $scope.submitted = true;

    // var packageVersionCodePattern = /^\d+(\.\d+){1,2}$/;
    // $scope.versionCodeValidation = packageVersionCodePattern.test($scope.currentAppPackage.version_code);
    $scope.startSpin();
    var packageIdPattern = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]*$/;
    $scope.packageIdValidation = packageIdPattern.test($scope.currentApp.package_id);

    $scope.currentApp.app_logo = $scope.iconTransferingLink;
    $scope.currentApp.alt_logo = $scope.iconTransferingLink;

    if ($scope.creatingAppStatus) {
      AppService.insertApp($scope.currentApp).then(
        function (response) {
          if (response.result) {
            $scope.creatingAppStatus = false;
            $location.url('editApp?appName=' + $scope.currentApp.app_name);
          } else {
            AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
            $log.error(JSON.stringify(response));
          }
          $scope.stopSpin();
        },
        function (err) {
          AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
          $log.error(JSON.stringify(err));
          $scope.stopSpin();
        }
      );
    } else {
      AppService.updateAppByName($scope.currentApp).then(
        function (response) {
          if (response.result) {
            $scope.creatingAppStatus = false;
            $location.url('editApp?appName=' + $scope.currentApp.app_name + '&randomNum=' + (new Date()).getTime());
          } else {
            AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': response.message + ' ERR CODE [' + response.code + ']'});
            $log.error(JSON.stringify(response));
          }
          $scope.stopSpin();
        },
        function (err) {
          AlertMessageService.showAlert({'dependId': 'edit-app', 'type': 'danger', 'message': err.message + ' ERR CODE [' + err.code + ']'});
          $log.error(JSON.stringify(err));
          $scope.stopSpin();
        }
      );
    }
  };

  $scope.startSpin = function() {
    TinySpinnerService.startSpin('spinner-1');
  };

  $scope.stopSpin = function() {
    TinySpinnerService.stopSpin('spinner-1');
  };

  $scope.fetchApp();
});


app.controller('IKSSearchController',function ($scope, $timeout,$location,$sce, $http, $modal, $route,$routeParams, $log,  AppService,  AlertMessageService,errHandler) {
 $scope.showKnowledgeList = false;
  $scope.showgoogleList=false;
 $scope.source ="Bing";
 $scope.OptionInSearch=[{name:"Bing Search",value:"Bing"},{name:"IKS Search",value:"IKS"}];
 $scope.SearchIKSList=function(){
     // $scope.startSpin();
   var source=$scope.source;
   if("IKS"==source)
   {
          AppService.Search( $scope.IKSSearch).then(
             function (response) {
            
                /* if(typeof(response.Status)=="undefined"){
                        window.location.reload();
                        return false;
                    }
                    else{*/
                        try {
                             $scope.searchItems = [];
                           var homeData = JSON.parse(response);
                          // angular.toJson(homeData);
                            homeData=angular.fromJson(homeData);
                            $scope.showKnowledgeList = true;
                            if(homeData.Payload.Status == "Success")
                            {
                             var hits = homeData.Payload.Results;
                             var i = 0;
                                while (true) {
                                    var hit = hits["Hit-" + i++];
                                    if (hit) {
                                      if (hit.Reference.indexOf("eit1-p.svcs.hp.com") > -1) {
                                         hit.Reference = hit.Reference.replace("eit1-p.svcs.hp.com", "eit1-i.svcs.hp.com")
                                         };
                                         $scope.searchItems.push({ KnowledgeTitle: hit.Title, KnowledgeURL: hit.Reference });
                                    }
                                    else
                                        break;
                                }

                               // $scope.stopSpin();
                            }
                            else {
                              errHandler.parseError();
                              // AlertMessageService.showAlert({'dependId': 'SearchIKSListRequest_fail', 'type': 'fail', 'message': homeData.Payload.Message });
                             //   $scope.stopSpin();
                            }
                        }
                        catch (e) {
                             AlertMessageService.showAlert({'dependId': 'SearchIKSListParse_error', 'type': 'danger', 'message': e });
                             $log.error(JSON.stringify(e));
                           // $scope.stopSpin();
                        }
                   // }
            },
            function (err) {
           //   AlertMessageService.showAlert({'dependId': 'SearchIKSListRequest_error', 'type': 'danger', 'message': err + ' ERR CODE [' + err.code + ']'});
              $log.error(JSON.stringify(err));
             // $scope.stopSpin();
            }
      );
   }else if("Bing"==source){
         AppService.google( $scope.IKSSearch).then(
            function(response)
            {
                if(response)
                {
                  $scope.googleSearchItem = [];
                    
                   try
                   {
                    var data=angular.fromJson(response);
                    if(data)
                    {
                        $scope.showgoogleList=true;
                       $scope.googleSearchItem=data;
                    }
                   }
                   catch(e)
                   {
                      AlertMessageService.showAlert({'dependId': 'SearchGoogleListParse_error', 'type': 'danger', 'message': e });
                             $log.error(JSON.stringify(e));
                   }
               
                }
            },
            function(err)
            {
                 $log.error(JSON.stringify(err));
            }
          );
   }
 
  };
});

app.controller('GoogleSearchController',function ($scope, $routeParams,$sce) {
  $scope.decode = atob($routeParams.content); 
  $scope.googleBody=$sce.trustAsHtml($scope.decode);
});
