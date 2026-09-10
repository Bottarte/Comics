angular.module('comicModule')
    .controller('ComicGeneralController', ['$scope', 'ComicService', 'ComicHelperService', 'ComicStateService',
    function($scope, ComicService, ComicHelper, ComicState) {
        
        $scope.state = ComicState;
        $scope.generalCurrentPage = 0;
        $scope.detailPageSize = 2;

        // --- Допоміжна функція для безпечного витягування масиву ID жанрів ---
        function extractCurrentGenreIds(comic) {
            if (!comic) return [];
            var rawList = comic.genres || comic.genreIds || [];
            
            var ids = rawList.map(function(item) {
                if (item === null || item === undefined) return null;
                if (typeof item === 'number') return item;
                if (typeof item === 'object') {
                    if (item.id !== undefined && item.id !== null) return item.id;
                    if (item.genreId !== undefined && item.genreId !== null) return item.genreId;
                    if (item.name && ComicState.genres && ComicState.genres.length) {
                        var found = ComicState.genres.filter(function(g) { return g.name === item.name; })[0];
                        if (found) return found.id;
                    }
                }
                if (typeof item === 'string' && ComicState.genres && ComicState.genres.length) {
                    var foundByName = ComicState.genres.filter(function(g) { return g.name === item; })[0];
                    if (foundByName) return foundByName.id;
                }
                return item;
            });

            return ids
                .map(function(id) { return parseInt(id, 10); })
                .filter(function(id) { return !isNaN(id); })
                .filter(function(v, i, a) { return a.indexOf(v) === i; });
        }

        $scope.$on('comic:selected', function(evt, comic) {
            $scope.generalCurrentPage = 0;
        });

        $scope.selectGeneralDetail = function(detail) {
            ComicState.selectedGeneralDetail = detail;
        };

        // --- Методи пагінації ---
        $scope.getGeneralNumberOfPages = function() {
            var comic = ComicState.selectedComic;
            var detailsList = (comic && comic.details && Array.isArray(comic.details)) ? comic.details : [];
            return Math.ceil(detailsList.length / $scope.detailPageSize) || 1;
        };

        $scope.setGeneralPage = function(page) {
            var maxPages = $scope.getGeneralNumberOfPages();
            if (page >= 0 && page < maxPages) {
                $scope.generalCurrentPage = page;
            }
        };

        $scope.getGeneralPagesArray = function() {
            var pages = [];
            var totalPages = $scope.getGeneralNumberOfPages();
            for (var i = 0; i < totalPages; i++) {
                pages.push(i);
            }
            return pages;
        };

        // --- Відкриття модального вікна для Деталей (Ціна / Магазин / Кількість) ---
        $scope.openDetailModal = function(isEdit) {
            var currentComic = ComicState.selectedComic;
            
            if (!currentComic) {
                return alert('Спочатку оберіть комікс у таблиці.');
            }

            ComicState.isEditingDetail = !!isEdit;
            
            if (isEdit && ComicState.selectedGeneralDetail) {
                var det = angular.copy(ComicState.selectedGeneralDetail);
                ComicState.detailFormData = {
                    id: det.id || 0,
                    shopId: ComicHelper.extractShopId(det, ComicState.shops),
                    price: det.price,
                    quantity: det.quantity
                };
            } else {
                ComicState.detailFormData = {
                    id: 0,
                    price: 100,
                    quantity: 1,
                    shopId: (ComicState.shops && ComicState.shops.length > 0) ? ComicState.shops[0].id : null
                };
            }
            
            ComicState.modalState.active = 'detail';
        };

        // --- Збереження лише деталізації магазинів ---
        $scope.saveDetailMain = function() {
            var comic = ComicState.selectedComic;
            var formData = ComicState.detailFormData;
            var isEditing = ComicState.isEditingDetail;

            if (!comic || !formData) return;

            var shopId = ComicHelper.safeParseInt(formData.shopId, null);
            if (!shopId) return alert('Будь ласка, оберіть магазин.');

            var currentDetails = ComicHelper.prepareDetailsPayload(comic.details, ComicState.shops);
            
            var detailItem = {
                id: isEditing && ComicState.selectedGeneralDetail ? ComicState.selectedGeneralDetail.id : 0,
                price: ComicHelper.safeParseFloat(formData.price, 0),
                quantity: ComicHelper.safeParseInt(formData.quantity, 1),
                shopId: shopId
            };

            if (isEditing && ComicState.selectedGeneralDetail) {
                var idx = currentDetails.findIndex(function(d) { return d.id === ComicState.selectedGeneralDetail.id; });
                if (idx !== -1) currentDetails[idx] = detailItem;
            } else {
                currentDetails.push(detailItem);
            }

            // Зберігаємо наявні жанри
            var currentGenreIds = extractCurrentGenreIds(comic);
            var payload = ComicHelper.buildComicPayload(comic, currentDetails, currentGenreIds, ComicState.types);

            $scope.isSaving = true;

            ComicService.update(comic.id, payload)
                .then(function() {
                    $scope.$emit('comic:reload', comic.id);
                    ComicState.modalState.active = null;
                })
                .catch(function(err) {
                    ComicHelper.handleApiError(err);
                })
                .finally(function() {
                    $scope.isSaving = false;
                });
        };

        // --- Видалення деталізації магазину ---
        $scope.deleteGeneralDetail = function() {
            var comic = ComicState.selectedComic;
            var selectedDetail = ComicState.selectedGeneralDetail;

            if (!comic || !selectedDetail) {
                return alert('Будь ласка, оберіть деталь для видалення.');
            }

            if (!confirm('Ви дійсно бажаєте видалити цей магазин із деталізації коміксу?')) {
                return;
            }

            var currentDetails = ComicHelper.prepareDetailsPayload(comic.details, ComicState.shops);
            var updatedDetails = currentDetails.filter(function(d) {
                if (selectedDetail.id && d.id) {
                    return d.id !== selectedDetail.id;
                }
                return d.shopId !== ComicHelper.extractShopId(selectedDetail, ComicState.shops);
            });

            // Зберігаємо наявні жанри при видаленні деталізації!
            var currentGenreIds = extractCurrentGenreIds(comic);
            var payload = ComicHelper.buildComicPayload(comic, updatedDetails, currentGenreIds, ComicState.types);

            $scope.isSaving = true;

            ComicService.update(comic.id, payload)
                .then(function() {
                    ComicState.selectedGeneralDetail = null;

                    // Оновлюємо сторінку пагінації після видалення
                    if ($scope.generalCurrentPage > 0 && 
                        $scope.generalCurrentPage >= Math.ceil(updatedDetails.length / $scope.detailPageSize)) {
                        $scope.generalCurrentPage--;
                    }

                    $scope.$emit('comic:reload', comic.id);
                })
                .catch(function(err) {
                    ComicHelper.handleApiError(err);
                })
                .finally(function() {
                    $scope.isSaving = false;
                });
        };
    }]);