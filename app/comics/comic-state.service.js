angular.module('comicModule')
    .factory('ComicStateService', ['$rootScope', function($rootScope) {
        var service = {
            selectedComic: null,

            selectedGeneralDetail: null,
            detailFormData: {},
            isEditingDetail: false,

            comicGenres: [],
            selectedGenre: null,
            genreFormData: {},
            isEditingGenre: false,

            modalState: { active: null },
            shops: [],
            genres: [],
            types: [],

            // --- Хелпер для перетворення ID в об'єкти жанрів ---
            populateGenres: function(rawGenres) {
                if (!angular.isArray(rawGenres)) return [];
                
                return rawGenres.map(function(item) {
                    var id = (typeof item === 'object') ? (item.id || item.genreId) : item;
                    id = Number(id);

                    // Шукаємо повноцінний об'єкт жанру в загальному довіднику service.genres
                    if (service.genres && service.genres.length > 0) {
                        var found = service.genres.find(function(g) { return Number(g.id) === id; });
                        if (found) return found;
                    }

                    // Fallback, якщо довідник ще не завантажився
                    return (typeof item === 'object') ? item : { id: id, name: 'Жанр #' + id };
                });
            },

            setSelectedComic: function(comic) {
                service.selectedComic = comic;

                service.selectedGeneralDetail = (comic && comic.details && comic.details.length > 0) 
                    ? comic.details[0] 
                    : null;

                // 1. Формуємо нормальний масив об'єктів жанрів
                var rawGenres = comic ? (comic.genres || comic.genreIds || []) : [];
                service.comicGenres = service.populateGenres(rawGenres);

                // 2. Перевіряємо чи зберегти поточний вибраний жанр, чи скинути його
                if (service.selectedGenre) {
                    var selectedId = Number(service.selectedGenre.id || service.selectedGenre.genreId);
                    var stillExists = service.comicGenres.find(function(g) { 
                        return Number(g.id) === selectedId; 
                    });
                    
                    // Якщо вибраний жанр є в новому списку — залишаємо його, інакше скидаємо
                    service.selectedGenre = stillExists || null;
                } else {
                    service.selectedGenre = null;
                }

                $rootScope.$broadcast('comic:selected', comic);
            },

            resetDetails: function() {
                service.selectedGeneralDetail = null;
                service.detailFormData = {};
                service.isEditingDetail = false;
            },

            resetGenres: function() {
                service.selectedGenre = null;
                service.genreFormData = {};
                service.isEditingGenre = false;
            }
        };

        return service;
    }]);