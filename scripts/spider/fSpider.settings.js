var fSpider = fSpider || {};

fSpider.Settings = (function (Settings, $, undefined) {
    'use strict';

    //dependencies
    var Utils = fSpider.Utils;

    //constructor
    Settings = function (options) {
        this.set(options);
    };

    //fields
    Settings.prototype.defaultSettings = null;
    Settings.prototype.vm = null;

    //public functions
    Settings.prototype.set = function (options) {
        $.extend(true, this, this.defaultSettings, this, options);
    };

    Settings.prototype.filter = function (props) {
        if (props == null) {
            props = [];
        }

        var settings = {};
        var length = props.length;
        var prop;
        for (var i = 0; i < length; i++) {
            prop = props[i];
            settings[prop] = this.settings[prop];
        }

        return settings;
    };

    Settings.prototype.extend = function (options) {
        return Utils.extendProps(options, this);
    };

    Settings.prototype._save = function (key) {
        if (localStorage != null) {
            localStorage.setItem(key, this.toJSON());
            return true;
        }
        return false;
    };

    Settings.prototype._load = function (key) {
        if (localStorage != null) {
            try {
                var settings = JSON.parse(localStorage.getItem(key));
                this.set(settings);
                return true;
            } catch (ex) {
                console.log(ex);
            }
        }
        return false;
    };

    Settings.prototype.attributes = function () {
        return Utils.filterInProperties(this, Object.keys(this.defaultSettings || {}), []);
    };

    Settings.prototype.toJSON = function () {
        return JSON.stringify(this.attributes());
    };

    return Settings;
})(fSpider.Settings || {}, $);

fSpider.GameSettings = (function (GameSettings, $, ko, undefined) {
    'use strict';

    var Utils = fSpider.Utils;
    var Settings = fSpider.Settings;

    //constructor
    GameSettings = function () {
        //setup vm proxies
        this.vm = new GameSettings.VM();
        this.vm.changed.subscribe(function() {
            this.save();
        }.bind(this));

        Object.defineProperty(this, 'animate', {
            get: function () {
                return this.vm.animate();
            },
            set: function (value) {
                this.vm.animate(value);
            },
            enumerable: true
        });
        Object.defineProperty(this, 'volume', {
            get: function () {
                return this.vm.volume() ? 1 : 0;
            },
            set: function (value) {
                this.vm.volume(value > 0);
            },
            enumerable: true
        });
        Object.defineProperty(this, 'difficulty', {
            get: function () {
                return this.vm.difficulty();
            },
            set: function (value) {
                this.vm.difficulty(value);
            },
            enumerable: true
        });
        Object.defineProperty(this, 'animTime', {
            get: function () {
                return this.vm.animTime();
            },
            set: function (value) {
                this.vm.animTime(value);
            },
            enumerable: true
        });
        Object.defineProperty(this, 'animDelay', {
            get: function () {
                return this.vm.animDelay();
            },
            set: function (value) {
                this.vm.animDelay(value);
            },
            enumerable: true
        });

        if (this.load() !== true) {
            this.set();
            this.save();
        }
    };

    Utils.extendObj(GameSettings, Settings);

    //VM
    GameSettings.VM = function () {
        this.build();
        this.reset();
    };

    GameSettings.VM.prototype.build = function () {
        this.animate = ko.observable();
        this.volume = ko.observable();
        this.difficulty = ko.observable();
        this.difficultyOptions = ko.observableArray([
            { text: '1 Suit', value: GameSettings.prototype.DIFFICULTIES.ONE_SUIT },
            { text: '2 Suits', value: GameSettings.prototype.DIFFICULTIES.TWO_SUIT },
            { text: '4 Suits', value: GameSettings.prototype.DIFFICULTIES.FOUR_SUIT }
        ]);
        this.animTime = ko.observable();
        this.animDelay = ko.observable();

        this.changed = ko.computed(function () {
           return ko.toJS(fSpider.Utils.filterOutProperties(this, ['changed'], [], true));
        }.bind(this));
    };

    GameSettings.VM.prototype.reset = function () {
        this.animate(GameSettings.prototype.defaultSettings.animate);
        this.volume(GameSettings.prototype.defaultSettings.volume);
        this.difficulty(GameSettings.prototype.defaultSettings.difficulty);
        this.animTime(GameSettings.prototype.defaultSettings.animTime);
        this.animDelay(GameSettings.prototype.defaultSettings.animDelay);
    };

    GameSettings.VM.prototype.bind = function (element) {
        ko.applyBindings(element);
    };

    //fields
    GameSettings.prototype.DIFFICULTIES = {
        'ONE_SUIT': 0,
        'TWO_SUIT': 1,
        'FOUR_SUIT': 2
    };

    GameSettings.prototype.defaultSettings = {
        animate: true,
        volume: 1,
        difficulty: GameSettings.prototype.DIFFICULTIES.ONE_SUIT,
        animTime: 150,
        animDelay: 0
    };

    //public functions
    GameSettings.prototype.extendAnimate = function (animate) {
        return Utils.extendProps({ animate: animate }, this);
    };

    GameSettings.prototype.extendAnimTime = function (animTime) {
        return Utils.extendProps({ animTime: animTime }, this);
    };

    GameSettings.prototype.extendAnimDelay = function (animDelay) {
        return Utils.extendProps({ animDelay: animDelay }, this);
    };

    GameSettings.prototype.save = function () {
        return this._save('GameSettings');
    };

    GameSettings.prototype.load = function () {
        return this._load('GameSettings');
    };

    return GameSettings;
})(fSpider.GameSettings || {}, window.jQuery, window.ko);

fSpider.UISettings = (function (UISettings, $, ko, undefined) {
    'use strict';

    var Utils = fSpider.Utils;
    var Settings = fSpider.Settings;

    //constructor
    UISettings = function (options) {
        this.options = $.extend(true, {}, this.defaultSettings, options);
    };

    Utils.extendObj(UISettings, Settings);

    //fields
    UISettings.prototype.defaultSettings = {
        windows: {
            options: {
                elementId: 'options-wrap',
                id: 'options-modal',
                title: 'Options',
                position: { top: '', bottom: '56px', left: '5px', right: '' },
                modalState: 1,
                draggableOptions: {
                    containment: '#ui-container',
                    dragend: function () {
                        this.save();
                    }
                },
                closed: function () {
                    this.save();
                },
                expanded: function () {
                    this.save();
                }
            },
            score: {
                elementId: 'score-display',
                id: 'score-display-modal',
                title: 'Score',
                position: { top: '', bottom: '60px', left: '95px', right: '' },
                modalState: 1,
                draggableOptions: {
                    containment: '#ui-container',
                    dragend: function () {
                        this.save();
                    }
                },
                closed: function () {
                    this.save();
                },
                expanded: function () {
                    this.save();
                }
            },
            moves: {
                elementId: 'moves-display',
                id: 'moves-display-modal',
                title: 'Moves',
                position: { top: '', bottom: '60px', left: '150px', right: '' },
                modalState: 1,
                draggableOptions: {
                    containment: '#ui-container',
                    dragend: function () {
                        this.save();
                    }
                },
                closed: function () {
                    this.save();
                },
                expanded: function () {
                    this.save();
                }
            },
            time: {
                elementId: 'time-display',
                id: 'time-display-modal',
                title: 'Time',
                position: { top: '', bottom: '60px', left: '210px', right: '' },
                modalState: 1,
                draggableOptions: {
                    containment: '#ui-container',
                    dragend: function () {
                        this.save();
                    }
                },
                closed: function () {
                    this.save();
                },
                expanded: function () {
                    this.save();
                }
            },
            game: {
                elementId: 'game-ctrls-wrap',
                id: 'game-ctrls-modal',
                title: 'Game',
                position: { top: '', bottom: '5px', left: '5px', right: '' },
                modalState: 1,
                draggableOptions: {
                    containment: '#ui-container',
                    dragend: function () {
                        this.save();
                    }
                },
                closed: function () {
                    this.save();
                },
                expanded: function () {
                    this.save();
                }
            }
        }
    };

    //functions
    UISettings.prototype.loadWindows = function () {
        this.windows = {};

        var w;
        for (var window in this.options.windows) {
            w = this.options.windows[window];
            this.windows[window] = new fSpider.Modal(['#', w.elementId].join(''), fSpider.Utils.filterOutProperties(w, ['elementId'], [], true));
            this.windows[window].load();
        }

        return this.windows;
    };

    return UISettings;
})(fSpider.UISettings || {}, window.jQuery, window.ko);