angular.module('reportModule')
    .controller('ReportController', ['$scope', '$location', 'ReportService', function($scope, $location, ReportService) {
        $scope.reportData = [];
        $scope.isLoading = true;
        $scope.errorMessage = null;

        // Початкове значення випадаючого списку
        $scope.selectedReport = 'report-sales';

        // Перенаправлення суворо на /report
        $scope.onReportChange = function() {
            if ($scope.selectedReport === 'report-sales') {
                $location.path('/report');
            }
        };

        // Завантаження даних звіту
        $scope.loadReport = function() {
            $scope.isLoading = true;
            $scope.errorMessage = null;

            ReportService.getFirstReport()
                .then(function(response) {
                    $scope.reportData = response.data || [];
                })
                .catch(function(err) {
                    $scope.errorMessage = 'Не вдалося завантажити звіт з сервера.';
                    console.error('Report Load Error:', err);
                })
                .finally(function() {
                    $scope.isLoading = false;
                });
        };

        // Викликаємо завантаження при ініціалізації контролера сторінки
        $scope.loadReport();
    }]);