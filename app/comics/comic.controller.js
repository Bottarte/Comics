angular.module('comicModule')
    .controller('ComicController', ['$scope', '$q', 'ComicService', 'ComicStateService', 'ComicHelperService',
    function($scope, $q, ComicService, ComicState, ComicHelper) {
        
        $scope.state = ComicState;

        // --- State Variables ---
        $scope.comics = [];
        $scope.activeTab = 'general';

        // Master Grid Pagination
        $scope.currentPage = 0;
        $scope.pageSize = 2;

        // Dynamic Templates
        $scope.tabTemplates = {
            general: 'views/components/tab-general.html',
            technical: 'views/components/tab-technical.html'
        };

        $scope.isEditingMain = false;
        $scope.isSaving = false;
        $scope.mainFormData = { typeIds: [], genreIds: [] };

        // --- Helper Methods ---
        $scope.setTab = function(tabName) {
            $scope.activeTab = tabName;
        };

        // Єдиний метод для вибору коміксу (синхронізує і $scope, і ComicState)
        $scope.selectComic = function(comic) {
            $scope.selectedComic = comic;
            ComicState.setSelectedComic(comic);
        };

        $scope.closeModal = function() {
            ComicState.modalState.active = null;
            $scope.mainFormData = { typeIds: [], genreIds: [] };
            $scope.isEditingMain = false;
            $scope.isSaving = false;
        };

        // --- Pagination ---
        $scope.numberOfPages = function() {
            return Math.ceil(($scope.comics || []).length / $scope.pageSize) || 1;
        };

        $scope.setPage = function(page) {
            if (page >= 0 && page < $scope.numberOfPages()) {
                $scope.currentPage = page;
            }
        };

        $scope.getPagesArray = function() {
            var pages = [];
            for (var i = 0; i < $scope.numberOfPages(); i++) { pages.push(i); }
            return pages;
        };

        // --- Data Loading ---
        $scope.loadComics = function(keepSelectedComicId) {
            return ComicService.getAll()
                .then(function(response) {
                    $scope.comics = response.data || [];
                    
                    if ($scope.comics.length > 0) {
                        var target = keepSelectedComicId 
                            ? $scope.comics.find(function(c) { return c.id === keepSelectedComicId; }) 
                            : $scope.comics[0];
                        
                        // Гарантовано обираємо та записуємо в ComicState
                        $scope.selectComic(target || $scope.comics[0]);
                    } else {
                        $scope.selectComic(null);
                    }
                })
                .catch(ComicHelper.handleApiError);
        };

        // Паралельне завантаження довідників через $q.all
        $scope.loadDictionaries = function() {
            return $q.all([
                ComicService.getShops(),
                ComicService.getGenres(),
                ComicService.getTypes()
            ]).then(function(results) {
                ComicState.shops = results[0].data || [];
                ComicState.genres = results[1].data || [];
                ComicState.types = results[2].data || [];
            }).catch(ComicHelper.handleApiError);
        };

        // --- Master Actions ---
        $scope.openMainModal = function(isEdit) {
            $scope.isSaving = false;
            $scope.isEditingMain = !!isEdit;
            
            var selected = ComicState.selectedComic || $scope.selectedComic;

            if ($scope.isEditingMain && selected) {
                $scope.mainFormData = {
                    id: selected.id,
                    title: selected.title,
                    releaseDate: selected.releaseDate ? new Date(selected.releaseDate) : new Date(),
                    pages: selected.pages,
                    typeIds: ComicHelper.extractTypeIds(selected.types || selected.typeIds, ComicState.types) || [],
                    genreIds: ComicHelper.extractGenreIds(selected.genres || selected.genreIds, ComicState.genres) || []
                };
            } else {
                $scope.mainFormData = {
                    id: 0,
                    title: '',
                    releaseDate: new Date(),
                    pages: 100,
                    typeIds: (ComicState.types && ComicState.types.length > 0) ? [ComicState.types[0].id] : [],
                    genreIds: []
                };
            }
            ComicState.modalState.active = 'main';
        };

        $scope.saveMainComic = function() {
            if ($scope.isSaving || !$scope.mainFormData.title) return;
            $scope.isSaving = true;

            var selected = ComicState.selectedComic || $scope.selectedComic;

            var currentDetails = ($scope.isEditingMain && selected) 
                ? ComicHelper.prepareDetailsPayload(selected.details, ComicState.shops)
                : [];

            var payload = {
                title: $scope.mainFormData.title.trim(),
                releaseDate: ComicHelper.formatDateOnly($scope.mainFormData.releaseDate),
                pages: ComicHelper.safeParseInt($scope.mainFormData.pages, 0),
                typeIds: ComicHelper.extractTypeIds($scope.mainFormData.typeIds, ComicState.types),
                genreIds: ComicHelper.extractGenreIds($scope.mainFormData.genreIds, ComicState.genres),
                details: currentDetails
            };

            var promise = $scope.mainFormData.id ? ComicService.update($scope.mainFormData.id, payload) : ComicService.create(payload);
            
            promise.then(function(res) {
                var targetId = $scope.mainFormData.id || (res && res.data ? (res.data.id || res.data) : null);
                return $scope.loadComics(targetId);
            })
            .then($scope.closeModal)
            .catch(ComicHelper.handleApiError)
            .finally(function() { $scope.isSaving = false; });
        };

        $scope.deleteComic = function() {
            var selected = ComicState.selectedComic || $scope.selectedComic;
            if (!selected || !selected.id || $scope.isSaving) return;
            
            if (confirm('Ви впевнені, що хочете видалити комікс "' + selected.title + '"?')) {
                $scope.isSaving = true;
                ComicService.delete(selected.id)
                    .then(function() {
                        $scope.selectComic(null);
                        return $scope.loadComics();
                    })
                    .catch(ComicHelper.handleApiError)
                    .finally(function() { $scope.isSaving = false; });
            }
        };

        $scope.$on('comic:reload', function(evt, comicId) {
            $scope.loadComics(comicId);
        });

        $scope.init = function() {
            $scope.loadDictionaries().then(function() {
                return $scope.loadComics();
            });
        };

        $scope.init();
    }]);