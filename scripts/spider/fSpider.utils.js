var fSpider = fSpider || {};

fSpider.Utils = (function (Utils, Kinetic, undefined) {
    'use strict';

    Utils.isPointInBounds = function (point, bounds) {
        var xValid = point.x >= bounds.x && point.x <= (bounds.x + bounds.width); // x in bounds
        var yValid = point.y >= bounds.y && point.y <= (bounds.y + bounds.height); //y in bounds
        return xValid && yValid;
	};

	Utils.loadKineticImage = function (imageObj, w, h) {
	    var img = new Kinetic.Image({
	        image: imageObj,
	        width: w,
	        height: h
	    });
	    return img;
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