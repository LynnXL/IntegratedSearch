'use strict';

/* Directives */

angular.module('myApp.directives', [])
  .directive('appVersion', function (version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  })
  .directive('fieldRequired', function (version) {
    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        var starSpan = document.createElement('font');
        starSpan.appendChild(document.createTextNode('*'));
        starSpan.className = 'field-required';
        element[0].appendChild(starSpan);
      }
    }
  })
  .directive('packageSize', function () {
    var helper = {
      sizeUnit: function(indexAt) {
        var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
        return units[indexAt];
      }
    };
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var size = scope.$eval(attr.packageSize);
            var sizeLevel = 0;
            while(size > 1024) {
              size = size / 1024;
              sizeLevel++;
            }
            element.html(size.toFixed(2) + ' ' + helper.sizeUnit(sizeLevel));
        }
    };
  })
  .directive('alertMessage', function () {
    return {
      restrict: 'A',
      template: '<alert ng-repeat="alert in alerts" type="{{alert.type}}" close="closeAlert($index)">{{alert.message}}</alert>',
      link: function (scope, element, attr) {
        // { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
        scope.$on('alert-message:show', function (event, alertMsg) {
          scope.addAlert(alertMsg);
        });

        scope.addAlert = function(alertMsg) {
          if (element[0].id === alertMsg.dependId) {
            if (angular.isUndefined(scope.alerts)) {
              scope.alerts = [];
            }

            scope.alerts.push({type: alertMsg.type, message: alertMsg.message});

            if (scope.alerts.length >= 3) {
              scope.closeAlert(0);
            }
          }
        };

        scope.closeAlert = function(index) {
          scope.alerts.splice(index, 1);
        };
      }
    }
  })
  .directive('tinySpinner', function () {
    return {
      restrict: 'A',
      template: '<span class="spinner glyphicon glyphicon-refresh" aria-hidden="true"></span>',
      link: function (scope, element, attr) {
        // scope.switchOn = scope.$eval(attr.switcherOn);
        var animateClass = "icon-refresh-animate";
        var spinKey = angular.isDefined(attr.spinKey) ? attr.spinKey : false;

        // scope.$watch(attr.switcherOn, function(newValue, oldValue) {
        //   if (newValue) {
        //     element.addClass(animateClass);
        //   } else {
        //     element.removeClass(animateClass);
        //   }
        // }, true);

       scope.spin = function () {
          if (element[0].attributes["spin-key"].value === spinKey) {
            element.addClass(animateClass);
            element.css('visibility', 'visible');
          }
        };

        scope.stop = function () {
          if (element[0].attributes["spin-key"].value === spinKey) {
            element.removeClass(animateClass);
            element.css('visibility', 'hidden');
          }
        };

        scope.$on('tiny-spinner:start', function (event, key) {
            scope.spin();
        });

        scope.$on('tiny-spinner:stop', function (event, key) {
            scope.stop();
        });
      }
    };
  })
  .directive('appLogoIcon', function () {
    console.log(arguments);
  	return {
      restrict: 'E',
      scope: {
        applogo: '=applogo'
      },
      template: '<img width=32 ng-src="{{applogo}}">',
      replace: true
    };
  })
    /**
    * The ng-thumb directive
    * @author: nerv
    * @version: 0.1.2, 2014-01-09
    */
    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attr) {
                if (!helper.support) return;

                var params = scope.$eval(attr.ngThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }]);
