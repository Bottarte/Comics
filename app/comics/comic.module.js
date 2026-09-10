angular.module('comicModule', [])
    .filter('startFrom', function() {
        return function(input, start) {
            start = +start;
            return input ? input.slice(start) : [];
        };
    })
    .factory('ComicService', ['$http', function($http) {
        var baseUrl = 'https://localhost:7184/api';
        var api = baseUrl + '/comics';

        return {
            getAll: function() {
                return $http.get(api);
            },
            getById: function(id) {
                return $http.get(api + '/' + id);
            },
            create: function(comic) {
                return $http.post(api, comic);
            },
            update: function(id, comic) {
                return $http.put(api + '/' + id, comic);
            },
            delete: function(id) {
                return $http.delete(api + '/' + id);
            },
            getShops: function() {
                return $http.get(baseUrl + '/shops');
            },
            getGenres: function() {
                return $http.get(baseUrl + '/genres');
            },
            getTypes: function() {
                return $http.get(baseUrl + '/types');
            }
        };
    }
]);