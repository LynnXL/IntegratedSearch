'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'ngRoute',
  'ui.bootstrap',
  // 'smart-table'
  'ui.grid',
  'ui.grid.expandable',
  'ui.grid.resizeColumns',
  'ui.grid.selection',
  'angularFileUpload',
  "monospaced.qrcode"
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/appList', {
      templateUrl: 'partials/appList',
      controller: 'appListController'
    }).
    when('/editApp', {
      templateUrl: 'partials/editApp',
      controller: 'editAppController'
    }).
     when('/IKSSearch', {
      templateUrl: 'partials/IKSSearch',
      controller: 'IKSSearchController'
    }).
      when('/GoogleSearch', {
      templateUrl: 'partials/GoogleSearch',
      controller: 'GoogleSearchController'
    }).
    otherwise({
      redirectTo: '/IKSSearch'
    });

  $locationProvider.html5Mode(true);
});
