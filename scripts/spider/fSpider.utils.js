var fSpider = fSpider || {};

fSpider.Utils = (function (Utils, undefined) {
    'use strict';

    Utils.extendObj = function(childObj, parentObj) {
        //http://davidshariff.com/blog/javascript-inheritance-patterns/
        var tmpObj = function () {};
        tmpObj.prototype = parentObj.prototype;
        childObj.prototype = new tmpObj();
        childObj.prototype.constructor = childObj;
    };

    Utils.isPointInBounds = function (point, bounds) {
        var xValid = point.x >= bounds.x && point.x <= (bounds.x + bounds.width); // x in bounds
        var yValid = point.y >= bounds.y && point.y <= (bounds.y + bounds.height); //y in bounds
        return xValid && yValid;
    };

    Utils.doRectsIntersect = function (rect1, rect2) {
        return rect1.x < (rect2.x + rect2.width) && (rect1.x + rect1.width) > rect2.x
            && rect1.y < (rect2.y + rect2.height) && (rect1.y + rect1.height) > rect2.y;
    };

    Utils.distance = function (pnt1, pnt2) {
        var dX = pnt2.x - pnt1.x;
        var dY = pnt2.y - pnt1.y;

        return Math.sqrt((dX * dX) + (dY * dY));
    };

    Utils.formatPointToLayer = function (point, layer, scale) {
        if (point.x != null) {
            point.x -= layer.getAbsolutePosition().x;
            if (scale != null && scale !== 0) {
                point.x /= scale;
            }
        }

        if (point.y != null) {
            point.y -= layer.getAbsolutePosition().y;
            if (scale != null && scale !== 0) {
                point.y /= scale;
            }
        }

        return point;
    };

    Utils.formatTime = function (timeMS) {
        var timeStr = '';

        var remaining = timeMS;
        var hours = Math.floor(remaining / 3600000);
        remaining %= 3600000;
        var mins = Math.floor(remaining / 60000);
        remaining %= 60000;
        var secs = Math.floor(remaining / 1000);

        if (hours > 0) {
            if (hours < 10) {
                timeStr += '0';
            }
            timeStr += String(hours);
            timeStr += ':';
        }

        if (mins <= 0) {
            timeStr += '00:';
        } else {
            if (mins < 10) {
                timeStr += '0';
            }
            timeStr += String(mins);
            timeStr += ':';
        }

        if (secs <= 0) {
            timeStr += '00';
        } else {
            if (secs < 10) {
                timeStr += '0';
            }
            timeStr += String(secs);
        }

        return timeStr;
    };

    return Utils;
})(fSpider.Utils || {});