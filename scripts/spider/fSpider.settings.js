var fSpider = fSpider || {};

fSpider.SpiderSettings = (function (SpiderSettings, undefined) {
    'use strict';

    var Utils = fSpider.Utils;

    //constructor
    SpiderSettings = function () {
    };

    //fields
    SpiderSettings.prototype.animate = true;
    SpiderSettings.prototype.volume = 1;
    SpiderSettings.prototype.animTime = 150;
    SpiderSettings.prototype.animDelay = 0;

    //public functions
    SpiderSettings.prototype.filter = function (props) {
        if (props == null) {
            props = [];
        }

        var settings = {};
        var length = props.length;
        var prop;
        for (var i = 0; i < length; i++) {
            prop = props[i];
            settings[prop] = this[prop];
        }

        return settings;
    };

    SpiderSettings.prototype.extendForAnimate = function (animate) {
        Utils.extendProps({ animate: animate }, this);
    };

    return SpiderSettings;
})(fSpider.SpiderSettings || {});