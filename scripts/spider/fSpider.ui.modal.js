var fSpider = fSpider || {};

fSpider.Modal = (function (Modal, $, undefined) {
    'use strict';

    //constructor
    Modal = function (element, options) {
        this.options = $.extend(true, {}, this.defaultOptions, options);

        var $tEl = $(element);
        var $parent = $tEl.parent();
        $tEl.addClass('modal-content');
        this.$element = $('<div />').addClass('modal');
        this.$element.append($tEl);
        this.$element.css(this.options.startPosition);
        $parent.append(this.$element);

        //prepare element
        if (this.options.draggable === true) {
            this.applyDraggable(this.$element);
        }
        this.wrapControls(this.$element);
        this.applyState(this.options.startState);
    };

    //static fields
    Modal.prototype.STATES = {
        'none': 0,
        'expanded': 1,
        'minimized': 2,
        'pinned': 3,
        'closed': 4
    };
    Modal.prototype.defaultOptions = {
        draggable: true,
        containment: 'body',
        title: '',
        controls: {
            pin: true,
            minimize: true,
            restore: true,
            close: true,
            dragHandle: true
        },
        startState: Modal.prototype.STATES.expanded,
        startPosition: {
            top: '',
            left: '',
            bottom: '',
            right: ''
        },
        //events
        pinned: function () {
        },
        minimized: function () {
        },
        restored: function () {
        },
        closed: function () {
        },
        opened: function () {
        },
        dragstart: function () {
        },
        dragging: function () {
        },
        dragend: function () {
        }
    };

    //fields
    Modal.prototype.$element = null;
    Modal.prototype.options = null;
    Modal.prototype.state = Modal.prototype.STATES.none;

    //"private" functions
    Modal.prototype.applyDraggable = function (el) {
        var opts = this.options || {};

        el.draggable({
            'containment': opts.containment,
            'dragstart': opts.dragstart,
            'dragging': opts.dragging,
            'dragend': opts.dragend
        });
    };

    Modal.prototype.wrapControls = function (el) {
        var opts = this.options || {};
        var ctrls = opts.controls || {};

        el.addClass('modal');

        var $wrapTop = $('<div />').addClass('modal-top');

        //title bar
        var $titleBar = $('<div />').addClass('modal-title').html(opts.title);
        $wrapTop.append($titleBar);

        var $controls = $('<div />').addClass('modal-controls');
        //pin
        var $pin = $('<div />').addClass('modal-pin').addClass('modal-control')
            .append($('<i />').addClass('icon-pushpin'));
        if (ctrls.pin !== true) {
            $pin.hide();
        }
        $controls.append($pin);

        //minimize
        var $minimize = $('<div />').addClass('modal-minimize').addClass('modal-control')
            .append($('<i />').addClass('icon-minus'));
        if (ctrls.pin !== true) {
            $minimize.hide();
        }
        $controls.append($minimize);

        //restore
        var $restore = $('<div />').addClass('modal-restore').addClass('modal-control')
            .append($('<i />').addClass('icon-external-link'));
        $restore.hide();
        $controls.append($restore);

        //close
        var $close = $('<div />').addClass('modal-close').addClass('modal-control')
            .append($('<i />').addClass('icon-remove'));
        if (ctrls.pin !== true) {
            $minimize.hide();
        }
        $controls.append($close);
        $wrapTop.append($controls);
        $wrapTop.append($('<div />').addClass('clear'));

        el.prepend($wrapTop);

        var $wrapRight = $('<div />').addClass('modal-right');

        //drag handle
        var $dragHandle = $('<div />').addClass('modal-drag-handle');
        if (ctrls.dragHandle !== true) {
            $dragHandle.hide();
        }
        $wrapRight.append($dragHandle);

        el.append($wrapRight);
    };

    Modal.prototype.applyState = function (state) {
        switch (state) {
            case this.STATES.expanded:
                break;
            case this.STATES.minimized:
                break;
            case this.STATES.pinned:
                break;
            case this.STATES.closed:
                break;
            default: break;
        }
    };

    //public functions
    Modal.prototype.getState = function () {
        return this.state;
    };

    Modal.prototype.expand = function () {

    };

    Modal.prototype.minimize = function () {

    };

    Modal.prototype.pin = function () {

    };

    Modal.prototype.close = function () {

    };

    return Modal;
})(fSpider.Modal || {}, window.jQuery);