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
        this.applyState(this.options.startState, true);
    };

    //static fields
    Modal.prototype.STATES = {
        'EXPANDED': 0,
        'MINIMIZED': 1,
        'PINNED': 2,
        'CLOSED': 3
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
            expand: false,
            close: true,
            dragHandle: false
        },
        startState: Modal.prototype.STATES.EXPANDED,
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
        expanded: function () {
        },
        closed: function () {
        },
        opened: function () {
        }
    };

    //fields
    Modal.prototype.$modal = null;
    Modal.prototype.options = null;
    Modal.prototype.state = Modal.prototype.STATES.none;

    //"private" functions
    Modal.prototype.applyDraggable = function (el) {
        var opts = this.options || {};
        el.draggable(opts.draggableOptions || {});
    };

    Modal.prototype.wrapElement = function (el) {
        var self = this;

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
            .append($('<i />').addClass('icon-pushpin').addClass('modal-btn'))
            .on('click', function () {
                self.pin();
            });
        if (ctrls.pin !== true) {
            $pin.hide();
        }
        $controls.append($pin);

        //minimize
        var $minimize = $('<div />').addClass('modal-minimize').addClass('modal-control')
            .append($('<i />').addClass('icon-minus').addClass('modal-btn'))
            .on('click', function () {
                self.minimize();
            });
        if (ctrls.minimize !== true) {
            $minimize.hide();
        }
        $controls.append($minimize);

        //restore
        var $restore = $('<div />').addClass('modal-restore').addClass('modal-control')
            .append($('<i />').addClass('icon-external-link').addClass('modal-btn'))
            .on('click', function () {
                self.expand();
            });
        if (ctrls.expand !== true) {
            $restore.hide();
        }
        $controls.append($restore);

        //close
        var $close = $('<div />').addClass('modal-close').addClass('modal-control')
            .append($('<i />').addClass('icon-remove').addClass('modal-btn'))
            .on('click', function () {
                self.close();
            });
        if (ctrls.close !== true) {
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

    Modal.prototype.applyState = function (state, force) {
        if (force !== true && this.state === state) {
            return;
        }
        switch (state) {
            case this.STATES.EXPANDED:
                this.expand();
                break;
            case this.STATES.MINIMIZED:
                this.minimize();
                break;
            case this.STATES.PINNED:
                this.pin();
                break;
            case this.STATES.CLOSED:
                this.close();
                break;
        }
    };

    //public functions
    Modal.prototype.getState = function () {
        return this.state;
    };

    Modal.prototype.expand = function () {
        this.state = this.STATES.EXPANDED;
        this.$modal.show();
        this.options.expanded(this);
    };

    Modal.prototype.minimize = function () {
        this.state = this.STATES.MINIMIZED;
        this.options.minimized(this);
    };

    Modal.prototype.pin = function () {
        this.state = this.STATES.PINNED;
        this.options.pinned(this);
    };

    Modal.prototype.close = function () {
        this.state = this.STATES.CLOSED;
        this.$modal.hide();
        this.options.closed(this);
    };

    return Modal;
})(fSpider.Modal || {}, window.jQuery);