angular.module('comicModule')
.controller('ActionController', ['$scope', '$http', function($scope, $http) {
    
    $scope.minPages = 0;

    $scope.submitBestseller = function() {
        var pages = $scope.minPages || 0;

        var apiUrl = 'https://localhost:7184/api/action/bestseller?minPages=' + pages;

        $http.put(apiUrl)
            .then(function(response) {
                alert((response.data && response.data.message) || 'Успішно оновлено!');
                
                $scope.$emit('bestsellersUpdated');
                $scope.closeModal();
            })
            .catch(function(error) {
                console.error('Помилка при оновленні бестселерів:', error);
                var detail = (error.data && error.data.detail) ? error.data.detail : 'Не вдалося виконати запит';
                alert('Помилка: ' + detail);
            });
    };

    $scope.closeModal = function() {

    if ($scope.$parent) {
        $scope.$parent.showMinPagesModal = false;
        $scope.$parent.selectedAction = '';
    }

    $scope.$emit('closeBestsellersModal');
    $scope.minPages = 0;
};
}]);