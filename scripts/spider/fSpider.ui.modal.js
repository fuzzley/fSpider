var fSpider = fSpider || {};

fSpider.Modal = (function (Modal, $, undefined) {
    'use strict';

    //constructor
    Modal = function (element, options) {
        this.options = $.extend(true, {}, this.defaultOptions, options);

        //prepare element
        this.$modal = this.wrapElement(element);
        this.$modal.attr('id', this.options.id);
        if (this.options.draggable === true) {
            this.applyDraggable(this.$modal);
        }
        this.applyState(this.options.startState);
        if (this.options.startVisible !== true) {
            this.$modal.hide();
        }
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
        draggableOptions: {
            ignoreClasses: [
                'modal-control',
                'modal-btn'
            ]
        },
        title: '',
        id: '',
        controls: {
            pin: false,
            minimize: false,
            restore: false,
            close: true,
            dragHandle: false
        },
        startState: Modal.prototype.STATES.expanded,
        startPosition: {
            top: '',
            left: '',
            bottom: '',
            right: ''
        },
        startVisible: true,
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
        }
    };

    //fields
    Modal.prototype.$element = null;
    Modal.prototype.options = null;
    Modal.prototype.state = Modal.prototype.STATES.none;

    //"private" functions
    Modal.prototype.applyDraggable = function (el) {
        var opts = this.options || {};
        el.draggable(opts.draggableOptions || {});
    };

    Modal.prototype.wrapElement = function (el) {
        var opts = this.options || {};
        var ctrls = opts.controls || {};

        var $el = $(el);
        $el.addClass('modal-content');

        var $modal = $('<div />').addClass('modal');
        $modal.css(this.options.startPosition);
        $el.parent().append($modal);

        //LEFT
        var $wrapLeft = $('<div />').addClass('modal-left');
        var $wrapLeftTop = $('<div />').addClass('modal-left-top');
        var $wrapLeftBottom = $('<div />').addClass('modal-left-bottom');

        //LEFT-TOP
        //title bar
        var $titleBar = $('<div />').addClass('modal-title').html(opts.title);
        $wrapLeftTop.append($titleBar);

        var $controls = $('<div />').addClass('modal-controls');
        //pin
        var $pin = $('<div />').addClass('modal-pin').addClass('modal-control')
            .append($('<i />').addClass('icon-pushpin').addClass('modal-btn'));
        if (ctrls.pin !== true) {
            $pin.hide();
        }
        $controls.append($pin);

        //minimize
        var $minimize = $('<div />').addClass('modal-minimize').addClass('modal-control')
            .append($('<i />').addClass('icon-minus').addClass('modal-btn'));
        if (ctrls.pin !== true) {
            $minimize.hide();
        }
        $controls.append($minimize);

        //restore
        var $restore = $('<div />').addClass('modal-restore').addClass('modal-control')
            .append($('<i />').addClass('icon-external-link').addClass('modal-btn'));
        $restore.hide();
        $controls.append($restore);

        //close
        var $close = $('<div />').addClass('modal-close').addClass('modal-control')
            .append($('<i />').addClass('icon-remove').addClass('modal-btn'));
        if (ctrls.pin !== true) {
            $minimize.hide();
        }
        $controls.append($close);

        $wrapLeftTop.append($controls);
        $wrapLeftTop.append($('<div />').addClass('clear'));

        $wrapLeft.append($wrapLeftTop);

        //LEFT-BOTTOM
        $wrapLeftBottom.append($el);
        $wrapLeft.append($wrapLeftBottom);

        //LEFT END
        $modal.prepend($wrapLeft);

        //RIGHT
        var $wrapRight = $('<div />').addClass('modal-right');
        var $wrapRightTop = $('<div />').addClass('modal-right-top');
        var $wrapRightBottom = $('<div />').addClass('modal-right-bottom');

        //RIGHT-TOP
        $wrapRight.append($wrapRightTop);

        //RIGHT-BOTTOM
        //drag handle
        var $dragHandle = $('<div />').addClass('modal-drag-handle');
        if (ctrls.dragHandle !== true) {
            $dragHandle.hide();
        }
        $wrapRightBottom.append($dragHandle);

        $wrapRight.append($wrapRightBottom);

        //RIGHT END
        $modal.append($wrapRight);

        return $modal;
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