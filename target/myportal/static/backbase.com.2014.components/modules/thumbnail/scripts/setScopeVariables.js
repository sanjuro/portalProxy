define(function () {
    'use strict';
    var reExcl = /!/g,
        reSingleQuote = /'/g,
        rePlusSign = /\+/g,
        reOpenParenthesis = /\(/g,
        reCloseParenthesise = /\)/g,
        reAsterisk = /\*/g,
        reTilde = /~/g,
        reSpace = /%20/g,
        reSpecialChars = /%[A-Z0-9]{2}/g;

    function hasNotBeenEncoded(str) {
        return !str.match(reSpecialChars);
    }

    function encodePath(str) {
        var result;
        str = String(str);
        result = str;
        if (hasNotBeenEncoded(str)) {
            result = str.replace(reSpace, ' ');
            result = encodeURIComponent(result)
                        .replace(reExcl, '%21')
                        .replace(reSingleQuote, '%27')
                        .replace(reOpenParenthesis, '%28')
                        .replace(reCloseParenthesise, '%29')
                        .replace(reAsterisk, '%2A')
                        .replace(reTilde, '%7E')
                        .replace(rePlusSign, '%2B');
        }

        return result;
    }

    return function ($scope, thumbnailUrl, thumbnailSrc) {
        var urlParts = [],
            srcParts = [],
            imageNameUrl,
            imageNameSrc,
            bkImageSrc;
        if(thumbnailUrl && thumbnailSrc){
            urlParts = thumbnailUrl.split('/');
            srcParts = thumbnailSrc.split('/'),
            imageNameUrl = urlParts[urlParts.length - 1];
            imageNameSrc = srcParts[srcParts.length - 1];
            $scope.thumbnailUrl = thumbnailUrl.replace(imageNameUrl, encodePath(imageNameUrl));
            bkImageSrc = $scope.thumbnailSrc = thumbnailSrc.replace(imageNameSrc, encodePath(imageNameSrc));

            $scope.bgImage = thumbnailSrc ? {
                'background-image': 'url(' + bkImageSrc + ')',
                'background-repeat': 'no-repeat',
                'background-size': 'contain'
            } : {};
        }
    };
});