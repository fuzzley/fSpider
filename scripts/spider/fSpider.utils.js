var fSpider = fSpider || {};

fSpider.Utils = (function (Utils, Kinetic, undefined) {
    'use strict';

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

	Utils.loadKineticImage = function (imageObj, w, h) {
	    return new Kinetic.Image({
	        image: imageObj,
	        width: w,
	        height: h
	    });
	};

	Utils.formatPointToLayer = function (point, layer, scale) {
	    if (point.x !== undefined) {
	        point.x -= layer.getAbsolutePosition().x;
	        if (scale !== undefined && scale !== 0) {
	            point.x /= scale;
	        }
	    }

	    if (point.y !== undefined) {
	        point.y -= layer.getAbsolutePosition().y;
	        if (scale !== undefined && scale !== 0) {
	            point.y /= scale;
	        }
	    }

	    return point;
	};

	return Utils;
})(fSpider.Utils || {}, window.Kinetic);