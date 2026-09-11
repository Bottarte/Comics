angular.module('comicModule')
    .controller('ComicTechnicalController', ['$scope', 'ComicService', 'ComicHelperService', 'ComicStateService',
    function($scope, ComicService, ComicHelper, ComicState) {

        $scope.state = ComicState;
        $scope.technicalCurrentPage = 0;
        $scope.detailPageSize = 2;
        $scope.genreFormData = { genreIds: [] };
        $scope.isEditMode = false;
        $scope.isSaving = false;

        function getRawId(item) {
            if (item === null || item === undefined) return null;
            
            if (typeof item === 'number') return item;

            if (typeof item === 'string' && !isNaN(parseInt(item, 10))) {
                return parseInt(item, 10);
            }

            if (typeof item === 'object') {
                if (item.id !== undefined && item.id !== null) return item.id;
                if (item.genreId !== undefined && item.genreId !== null) return item.genreId;

                if (item.name && ComicState.genres && ComicState.genres.length) {
                    var found = findInArray(ComicState.genres, function(g) { return g.name === item.name; });
                    if (found) return found.id;
                }
                return null;
            }

            if (typeof item === 'string' && ComicState.genres && ComicState.genres.length) {
                var foundByTitle = findInArray(ComicState.genres, function(g) { return g.name === item; });
                if (foundByTitle) return foundByTitle.id;
            }

            return item;
        }

        function findInArray(array, predicate) {
            if (!array || !array.length) return null;
            var results = array.filter(predicate);
            return results.length > 0 ? results[0] : null;
        }

        $scope.closeModal = function() {
            ComicState.modalState.active = null;
            $scope.isEditMode = false;
        };

        $scope.$on('comic:selected', function(evt, comic) {
            $scope.technicalCurrentPage = 0;
            var genresArray = comic ? (comic.genres || comic.genreIds || []) : [];
            
            if (ComicState.selectedGenre) {
                var currentId = String(getRawId(ComicState.selectedGenre));
                var stillExists = genresArray.some(function(g) {
                    return String(getRawId(g)) === currentId;
                });

                if (!stillExists) {
                    ComicState.selectedGenre = null;
                }
            }
        });

        $scope.isGenreSelected = function(genre) {
            if (!ComicState.selectedGenre || !genre) return false;

            var selectedId = String(getRawId(ComicState.selectedGenre));
            var currentId = String(getRawId(genre));

            return selectedId === currentId;
        };

        $scope.selectGenre = function(genre) {
            if (genre === null || genre === undefined) return;

            var targetId = String(getRawId(genre));
            var currentSelectedId = ComicState.selectedGenre ? String(getRawId(ComicState.selectedGenre)) : null;

            if (currentSelectedId === targetId) {
                ComicState.selectedGenre = null;
            } else {
                var fullGenre = findInArray(ComicState.genres, function(g) {
                    return String(g.id) === targetId;
                });

                ComicState.selectedGenre = fullGenre || { 
                    id: targetId, 
                    name: $scope.getGenreName(genre) 
                };
            }
        };

        $scope.getGenreName = function(genreInput) {
            if (!genreInput) return '—';
            var idToFind = String(getRawId(genreInput));
            
            if (ComicState.genres && ComicState.genres.length) {
                var genre = findInArray(ComicState.genres, function(g) { 
                    return String(g.id) === idToFind; 
                });
                if (genre) return genre.name;
            }
            
            return (typeof genreInput === 'object' && genreInput.name) ? genreInput.name : idToFind;
        };

        $scope.getGenreDate = function(genreInput, index) {
            var comic = ComicState.selectedComic;
            if (!comic) return '—';

            if (typeof genreInput === 'object' && genreInput !== null) {
                var directDate = genreInput.timeAssigmant || genreInput.timeAssignment || genreInput.TimeAssigmant;
                if (directDate) return $scope.formatDate(directDate);
            }
s
            var rawId = getRawId(genreInput);
            if (rawId && ComicState.genres && ComicState.genres.length) {
                var foundInState = findInArray(ComicState.genres, function(g) {
                    return String(g.id) === String(rawId);
                });
                if (foundInState) {
                    var stateDate = foundInState.timeAssigmant || foundInState.timeAssignment || foundInState.TimeAssigmant;
                    if (stateDate) return $scope.formatDate(stateDate);
                }
            }

            var datesArray = comic.timeAssigmants || comic.timeAssignments || comic.TimeAssigmants || [];
            if (Array.isArray(datesArray) && datesArray.length > 0) {
                var realIndex = ($scope.technicalCurrentPage * $scope.detailPageSize) + index;
                if (datesArray[realIndex]) {
                    return $scope.formatDate(datesArray[realIndex]);
                }
            }

            return '—';
        };

        $scope.formatDate = function(dateStr) {
            if (!dateStr) return '—';
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            
            var day = ('0' + d.getDate()).slice(-2);
            var month = ('0' + (d.getMonth() + 1)).slice(-2);
            var year = d.getFullYear();
            var hours = ('0' + d.getHours()).slice(-2);
            var minutes = ('0' + d.getMinutes()).slice(-2);

            return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
        };

        $scope.getTechnicalNumberOfPages = function() {
            var comic = ComicState.selectedComic;
            if (!comic) return 1;

            var genresList = comic.comicGenre || comic.genres || comic.genreIds || [];
            return Math.ceil(genresList.length / $scope.detailPageSize) || 1;
        };

        $scope.setTechnicalPage = function(page, $event) {
            if ($event) {
                $event.preventDefault();
                $event.stopPropagation();
            }
            var maxPages = $scope.getTechnicalNumberOfPages();
            if (page >= 0 && page < maxPages) {
                $scope.technicalCurrentPage = page;
            }
        };

        $scope.getTechnicalPagesArray = function() {
            var pages = [];
            var totalPages = $scope.getTechnicalNumberOfPages();
            for (var i = 0; i < totalPages; i++) { 
                pages.push(i); 
            }
            return pages;
        };

        $scope.openAddGenreModal = function() {
            var comic = ComicState.selectedComic;
            if (!comic) return alert('Спочатку оберіть комікс у таблиці.');

            $scope.isEditMode = false;
            $scope.genreFormData = { genreIds: [] };
            ComicState.modalState.active = 'genres';
        };

        $scope.openEditGenreModal = function() {
            var comic = ComicState.selectedComic;
            var selectedGenre = ComicState.selectedGenre;

            if (!comic) return alert('Спочатку оберіть комікс.');
            if (!selectedGenre) return alert('Оберіть жанр у таблиці для редагування.');

            $scope.isEditMode = true;
            var rawSelectedId = getRawId(selectedGenre);

            $scope.genreFormData = {
                genreIds: [ Number(rawSelectedId) ]
            };

            ComicState.modalState.active = 'genres';
        };

        $scope.saveGenres = function() {
    var comic = ComicState.selectedComic;
    if (!comic) return;

    var rawFormIds = $scope.genreFormData.genreIds || [];
    var selectedFormIds = rawFormIds.map(function(id) { return String(getRawId(id)); });

    var rawCurrentList = comic.comicGenre || comic.genres || comic.genreIds || [];

    var currentGenreIds = rawCurrentList.map(function(item) {
        var rawId = getRawId(item);
        if (!rawId && item && item.name && ComicState.genres) {
            var matched = ComicState.genres.find(function(g) { return g.name === item.name; });
            if (matched) rawId = matched.id;
        }
        return String(rawId);
    });

    var finalGenreIds = [];

    if ($scope.isEditMode) {
        var targetOldId = String(getRawId(ComicState.selectedGenre));
        var filtered = currentGenreIds.filter(function(id) { 
            return id !== targetOldId && id !== 'null' && id !== 'undefined'; 
        });
        finalGenreIds = filtered.concat(selectedFormIds);
    } else {
        finalGenreIds = currentGenreIds.concat(selectedFormIds);
    }

    var numericFinalIds = finalGenreIds
        .filter(function(id) { return id && id !== 'null' && id !== 'undefined'; })
        .map(function(id) { return parseInt(id, 10); })
        .filter(function(id) { return !isNaN(id) && id !== null; })
        .filter(function(v, i, a) { return a.indexOf(v) === i; });

    var currentDetails = ComicHelper.prepareDetailsPayload(comic.details, ComicState.shops);
    var payload = ComicHelper.buildComicPayload(comic, currentDetails, numericFinalIds, ComicState.types);

    $scope.isSaving = true;

    ComicService.update(comic.id, payload)
        .then(function(response) {
            comic.genreIds = numericFinalIds;

            if (ComicState.genres && ComicState.genres.length) {
                comic.comicGenre = ComicState.genres
                    .filter(function(g) { return numericFinalIds.indexOf(Number(g.id)) !== -1; })
                    .map(function(g) {
                        return { name: g.name, timeAssigmant: new Date().toISOString() };
                    });
            }

            if (selectedFormIds.length > 0) {
                var targetId = selectedFormIds[0];
                var foundGenre = findInArray(ComicState.genres, function(g) { 
                    return String(g.id) === targetId; 
                });
                ComicState.selectedGenre = foundGenre || { id: targetId, name: $scope.getGenreName(targetId) };
            } else {
                ComicState.selectedGenre = null;
            }

            $scope.$emit('comic:reload', comic.id);
            $scope.closeModal();
        })
        .catch(function(err) {
            ComicHelper.handleApiError(err);
        })
        .finally(function() {
            $scope.isSaving = false;
        });
};

$scope.removeGenre = function() {
    var comic = ComicState.selectedComic;
    var selectedGenre = ComicState.selectedGenre;

    if (!comic) return alert('Спочатку оберіть комікс.');
    if (!selectedGenre) return alert('Оберіть жанр із таблиці для видалення.');

    var targetName = (typeof selectedGenre === 'object' && selectedGenre.name) ? selectedGenre.name : null;
    var targetRaw = getRawId(selectedGenre);

    if ((targetRaw === null || targetRaw === undefined) && targetName && ComicState.genres) {
        var matchedStateGenre = ComicState.genres.find(function(g) { return g.name === targetName; });
        if (matchedStateGenre) {
            targetRaw = matchedStateGenre.id;
        }
    }

    if (!targetRaw && !targetName) {
        return alert('Помилка: не вдалося ідентифікувати обраний жанр.');
    }

    if (!confirm('Вилучити цей жанр із коміксу?')) return;

    var rawList = comic.comicGenre || comic.genres || comic.genreIds || [];
    var numericUpdatedIds = [];

    for (var i = 0; i < rawList.length; i++) {
        var currentItem = rawList[i];
        var currentRawId = getRawId(currentItem);
        var currentName = (typeof currentItem === 'object' && currentItem.name) ? currentItem.name : null;

        if (!currentRawId && currentName && ComicState.genres) {
            var foundInState = ComicState.genres.find(function(g) { return g.name === currentName; });
            if (foundInState) currentRawId = foundInState.id;
        }

        var isTargetById = targetRaw && String(currentRawId) === String(targetRaw);
        var isTargetByName = targetName && currentName && targetName === currentName;

        if (!isTargetById && !isTargetByName) {
            var finalId = parseInt(currentRawId, 10);
            if (!isNaN(finalId) && numericUpdatedIds.indexOf(finalId) === -1) {
                numericUpdatedIds.push(finalId);
            }
        }
    }

    var currentDetails = ComicHelper.prepareDetailsPayload(comic.details, ComicState.shops);
    var payload = ComicHelper.buildComicPayload(comic, currentDetails, numericUpdatedIds, ComicState.types);

    $scope.isSaving = true;

    ComicService.update(comic.id, payload)
        .then(function() {
            comic.genreIds = numericUpdatedIds;
            if (Array.isArray(comic.comicGenre)) {
                comic.comicGenre = comic.comicGenre.filter(function(g) {
                    return g.name !== targetName;
                });
            }

            ComicState.selectedGenre = null;

            var newTotalPages = Math.ceil(numericUpdatedIds.length / $scope.detailPageSize);
            if ($scope.technicalCurrentPage > 0 && $scope.technicalCurrentPage >= newTotalPages) {
                $scope.technicalCurrentPage = Math.max(0, newTotalPages - 1);
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