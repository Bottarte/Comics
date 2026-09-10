angular.module('comicsApp')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/components/grid-main.html',
                controller: 'ComicController'
            })
            .when('/report', {
                templateUrl: '/app/reports/reports.template.html',
                controller: 'ReportController'
            })
    }]);