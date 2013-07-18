var fSpider = fSpider || {};

fSpider.SpiderSettings = (function (SpiderSettings, undefined) {
    'use strict';

    //constructor
    SpiderSettings = function () {
    };

    //fields
    SpiderSettings.prototype.animate = true;
    SpiderSettings.prototype.volume = 0;
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

    return SpiderSettings;
})(fSpider.SpiderSettings || {});