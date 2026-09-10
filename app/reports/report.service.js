angular.module('reportModule', [])
    .factory('ReportService', ['$http', function($http) {
        var baseUrl = 'https://localhost:7184/api/report';

        return {
            getFirstReport: function() {
                return $http.get(baseUrl);
            },
            getSecondReport: function() {
                return $http.get(baseUrl + '/2');
            }
        };
    }]);