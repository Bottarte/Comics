angular.module('comicModule')
    .factory('ComicHelperService', function() {

        var safeParseInt = function(val, defaultVal) {
            var parsed = parseInt(val, 10);
            return isNaN(parsed) ? (defaultVal !== undefined ? defaultVal : null) : parsed;
        };

        var safeParseFloat = function(val, defaultVal) {
            var parsed = parseFloat(val);
            return isNaN(parsed) ? (defaultVal !== undefined ? defaultVal : 0) : parsed;
        };

        var formatDateOnly = function(dateVal) {
            if (!dateVal) return null;
            var d = new Date(dateVal);
            if (isNaN(d.getTime())) return null;
            var month = '' + (d.getMonth() + 1);
            var day = '' + d.getDate();
            var year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        };

        var extractAuthorIds = function(authors) {
            if (!authors || !Array.isArray(authors)) return [];
            return authors
                .map(function(a) { return typeof a === 'object' && a !== null ? a.id : a; })
                .map(function(id) { return safeParseInt(id, 0); })
                .filter(function(id) { return id > 0; });
        };

        var extractTypeIds = function(types, typesList) {
            if (!types || !types.length) return [];
            return types.map(function(item) {
                if (typeof item === 'number') return item;
                if (typeof item === 'string') {
                    var found = (typesList || []).find(function(t) { return t.name === item; });
                    return found ? found.id : safeParseInt(item, 0);
                }
                if (typeof item === 'object' && item !== null) return item.id || safeParseInt(item.value, 0);
                return null;
            }).filter(function(id) {
                return id !== null && !isNaN(id) && id > 0;
            });
        };

        // 1. ОКРЕМИЙ витяг Жанрів (напряму для коміксу)
        var extractGenreIds = function(input, genresList) {
            if (!input) return [];
            var raw = Array.isArray(input) ? input.slice() : (typeof input === 'string' ? input.split(',') : [input]);

            return raw.map(function(g) {
                if (typeof g === 'number') return g;
                if (typeof g === 'object' && g !== null) return g.id !== undefined ? g.id : g.value;
                if (typeof g === 'string') {
                    var parsed = parseInt(g, 10);
                    if (!isNaN(parsed)) return parsed;
                    var found = (genresList || []).find(function(gen) { 
                        return gen.name && gen.name.toLowerCase() === g.trim().toLowerCase(); 
                    });
                    return found ? found.id : null;
                }
                return null;
            })
            .map(function(id) { return safeParseInt(id, 0); })
            .filter(function(id) { return id > 0; });
        };

        var extractShopId = function(detail, shopsList) {
            if (!detail) return null;
            
            if (detail.shopId !== undefined && detail.shopId !== null && !isNaN(parseInt(detail.shopId, 10))) {
                var parsedShopId = parseInt(detail.shopId, 10);
                if (parsedShopId > 0) return parsedShopId;
            }
            
            if (detail.shop && typeof detail.shop === 'object' && detail.shop.id) {
                var parsedObjId = parseInt(detail.shop.id, 10);
                if (!isNaN(parsedObjId) && parsedObjId > 0) return parsedObjId;
            }
            
            var shopNameStr = detail.shopName || (typeof detail.shop === 'string' ? detail.shop : null);
            if (shopNameStr) {
                var found = (shopsList || []).find(function(s) { 
                    return s.name && s.name.toLowerCase() === shopNameStr.trim().toLowerCase(); 
                });
                if (found) return found.id;
            }

            return null;
        };

        // 2. ОКРЕМА підготовка Деталей (Без жанрів всередині!)
        var prepareDetailsPayload = function(details, shopsList) {
            if (!details || !Array.isArray(details) || details.length === 0) return [];

            return details
                .map(function(d) {
                    if (!d) return null;
                    var sId = extractShopId(d, shopsList);

                    return {
                        id: safeParseInt(d.id, 0),
                        price: safeParseFloat(d.price, 0),
                        quantity: safeParseInt(d.quantity, 1),
                        shopId: sId
                    };
                })
                .filter(function(d) {
                    return d !== null && 
                           d.shopId !== null && 
                           d.shopId > 0 && 
                           d.price > 0; 
                });
        };

        // 3. ПОВНИЙ PAYLOAD: Жанри та Деталі збираються незалежно
        var buildComicPayload = function(comic, detailsPayload, genreIdsPayload, typesList, genresList) {
            return {
                id: safeParseInt(comic.id, 0),
                title: comic.title ? comic.title.trim() : '',
                releaseDate: formatDateOnly(comic.releaseDate),
                pages: safeParseInt(comic.pages, 0),
                typeIds: extractTypeIds(comic.typeIds || comic.types || [], typesList),
                authorIds: extractAuthorIds(comic.authorIds || comic.authors || []),
                genreIds: genreIdsPayload || extractGenreIds(comic.genreIds || comic.genres || [], genresList),
                details: detailsPayload || []
            };
        };

        var handleApiError = function(error) {
            console.error('API Error details:', error);
            var message = 'Сталася помилка при виконанні запиту.';
            if (error && error.data) {
                if (typeof error.data === 'string') {
                    message += '\n' + error.data;
                } else if (error.data.errors) {
                    message += '\n' + JSON.stringify(error.data.errors, null, 2);
                } else if (error.data.title) {
                    message += '\n' + error.data.title;
                }
            }
            alert(message);
        };

        return {
            safeParseInt: safeParseInt,
            safeParseFloat: safeParseFloat,
            formatDateOnly: formatDateOnly,
            extractAuthorIds: extractAuthorIds,
            extractTypeIds: extractTypeIds,
            extractGenreIds: extractGenreIds,
            extractShopId: extractShopId,
            prepareDetailsPayload: prepareDetailsPayload,
            buildComicPayload: buildComicPayload,
            handleApiError: handleApiError
        };
    });