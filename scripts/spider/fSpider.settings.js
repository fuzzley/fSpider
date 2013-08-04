var fSpider = fSpider || {};

fSpider.SpiderSettings = (function (SpiderSettings, $, undefined) {
    'use strict';

    var Utils = fSpider.Utils;

    //constructor
    SpiderSettings = function () {
    };

    //static
    SpiderSettings.prototype.DIFFICULTIES = {
        'ONE_SUIT': 0,
        'TWO_SUIT': 1,
        'FOUR_SUIT': 2
    };

    //fields
    SpiderSettings.prototype.animate = true;
    SpiderSettings.prototype.volume = 1;
    SpiderSettings.prototype.difficulty = SpiderSettings.prototype.DIFFICULTIES.ONE_SUIT;
    SpiderSettings.prototype.animTime = 150;
    SpiderSettings.prototype.animDelay = 0;
    SpiderSettings.prototype.windows = {
        options: {
            position: { top: '', bottom: '56px', left: '5px', right: '' },
            modalState: 0
        },
        score: {
            position: { top: '', bottom: '60px', left: '95px', right: '' },
            modalState: 0
        },
        moves: {
            position: { top: '', bottom: '60px', left: '150px', right: '' },
            modalState: 0
        },
        time: {
            position: { top: '', bottom: '60px', left: '210px', right: '' },
            modalState: 0
        },
        game: {
            position: { top: '', bottom: '5px', left: '5px', right: '' },
            modalState: 0
        }
    };

    //public functions
    SpiderSettings.prototype.set = function (options) {
        if (options == null) {
            return;
        }
        this.animate = options.animate != null ? options.animate : this.animate;
        this.volume = options.volume != null ? options.volume : this.volume;
        this.difficulty = options.difficulty != null ? options.difficulty : this.difficulty;
        this.animTime = options.animTime != null ? options.animTime : this.animTime;
        this.animDelay = options.animDelay != null ? options.animDelay : this.animDelay;
        this.windows = $.extend(true, this.windows, options.windows || {});
    };

    SpiderSettings.prototype.setWindowPosFromElement = function (windowName, element) {
        if (this.windows[windowName] == null || element == null) {
            return;
        }
        var $element = $(element);
        this.windows[windowName].position.top = $element.css('top');
        this.windows[windowName].position.bottom = $element.css('bottom');
        this.windows[windowName].position.left = $element.css('left');
        this.windows[windowName].position.right = $element.css('right');
    };

    SpiderSettings.prototype.setWindowModalState = function (windowName, state) {
        if (this.windows[windowName] == null || state == null) {
            return;
        }
        this.windows[windowName].modalState = state;
    };

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

    SpiderSettings.prototype.extend = function (options) {
        return Utils.extendProps(options, this);
    };

    SpiderSettings.prototype.extendAnimate = function (animate) {
        return Utils.extendProps({ animate: animate }, this);
    };

    SpiderSettings.prototype.extendAnimTime = function (animTime) {
        return Utils.extendProps({ animTime: animTime }, this);
    };

    SpiderSettings.prototype.extendAnimDelay = function (animDelay) {
        return Utils.extendProps({ animDelay: animDelay }, this);
    };

    SpiderSettings.prototype.attributes = function () {
        return Utils.filterOutProperties(this, [], []);
    };

    SpiderSettings.prototype.save = function () {
        if (localStorage != null) {
            localStorage.setItem('SpiderSettings', this.toJSON());
            return true;
        }
        return false;
    };

    SpiderSettings.prototype.load = function () {
        if (localStorage != null) {
            try {
                var settings = JSON.parse(localStorage.getItem('SpiderSettings'));
                this.set(settings);
                return true;
            } catch (ex) {
                console.log(ex);
                this.save();
            }
        }
        return false;
    };

    SpiderSettings.prototype.toJSON = function () {
        return JSON.stringify(this.attributes());
    };

    return SpiderSettings;
})(fSpider.SpiderSettings || {}, window.jQuery);