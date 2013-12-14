var fSpider = fSpider || {};

fSpider.Modal = (function (Modal, $, ko, undefined) {
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

        this.vm = new Modal.VM(this);

        this.setState(this.options.modalState, true);
    };

    //static fields
    Modal.prototype.STATES = {
        'CLOSED': 0,
        'EXPANDED': 1,
        'MINIMIZED': 2,
        'PINNED': 3
    };
    Modal.prototype.defaultOptions = {
        draggable: true,
        draggableOptions: {
            ignoreClasses: [
                'modal-control',
                'modal-btn'
            ],
            dragend: function (evt) {

            }
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
        modalState: Modal.prototype.STATES.EXPANDED,
        position: {
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

    //"private" functions
    Modal.prototype.applyDraggable = function (el) {
        var opts = this.options || {};
        if (opts.draggableOptions != null && opts.draggableOptions.owner == null) {
            opts.draggableOptions.owner = this;
        }
        el.draggable(opts.draggableOptions || {});
    };

    Modal.prototype.wrapElement = function (el) {
        var self = this;

        var opts = this.options || {};
        var ctrls = opts.controls || {};

        var $el = $(el);
        $el.addClass('modal-content');

        var $modal = $('<div />').addClass('modal');
        $modal.css(this.options.position);
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

    Modal.prototype.applyState = function (state, noNotify) {
        switch (state) {
            case this.STATES.EXPANDED:
                this.expand(noNotify);
                break;
            case this.STATES.MINIMIZED:
                this.minimize(noNotify);
                break;
            case this.STATES.PINNED:
                this.pin(noNotify);
                break;
            case this.STATES.CLOSED:
                this.close(noNotify);
                break;
        }
    };

    //public functions
    Modal.prototype.getState = function () {
        return this.state;
    };

    Modal.prototype.setState = function (state, noNotify) {
        if (noNotify === true) {
            this.vm.setStateQuiet(state);
        } else {
            this.vm.state(state);
        }
    };

    Modal.prototype.expand = function (noNotify) {
        this.state = this.STATES.EXPANDED;
        this.$modal.show();
        if (noNotify !== true) {
            this.options.expanded.call(this);
        }
    };

    Modal.prototype.minimize = function (noNotify) {
        this.state = this.STATES.MINIMIZED;
        if (noNotify !== true) {
            this.options.minimized.call(this);
        }
    };

    Modal.prototype.pin = function (noNotify) {
        this.state = this.STATES.PINNED;
        if (noNotify !== true) {
            this.options.pinned.call(this);
        }
    };

    Modal.prototype.close = function (noNotify) {
        this.state = this.STATES.CLOSED;
        this.$modal.hide();
        if (noNotify !== true) {
            this.options.closed.call(this);
        }
    };

    Modal.prototype.save = function (prefix) {
        if (prefix == null) {
            prefix = 'fModal';
        }

        var key = [prefix, '.', this.options.id].join('');
        if (localStorage != null) {
            localStorage.setItem(key, this.toJSON());
            return true;
        }
        return false;
    };

    Modal.prototype.load = function (prefix) {
        if (prefix == null) {
            prefix = 'fModal';
        }

        var key = [prefix, '.', this.options.id].join('');
        if (localStorage != null) {
            try {
                var data = localStorage.getItem(key);
                if (data != null && data != '') {
                    var attributes = JSON.parse(data);
                    this.set(attributes, true);
                }
                return true;
            } catch (ex) {
                console.log(ex);
            }
        }
        return false;
    };

    Modal.prototype.attributes = function () {
        return {
            state: this.getState(),
            position: {
                top: this.$modal.css('top'),
                bottom: this.$modal.css('bottom'),
                left: this.$modal.css('left'),
                right: this.$modal.css('right')
            }
        }
    };

    Modal.prototype.set = function (attributes, noNotify) {
        if (attributes == null) {
            return this;
        }

        if (attributes.state != null) {
            this.setState(attributes.state, noNotify);
        }
        if (attributes.position != null) {
            if (attributes.position.top != null) {
                this.$modal.css('top', attributes.position.top);
            }
            if (attributes.position.bottom != null) {
                this.$modal.css('bottom', attributes.position.bottom);
            }
            if (attributes.position.left != null) {
                this.$modal.css('left', attributes.position.left);
            }
            if (attributes.position.right != null) {
                this.$modal.css('right', attributes.position.right);
            }
        }

        return this;
    };

    Modal.prototype.toJSON = function () {
        return JSON.stringify(this.attributes());
    };

    Modal.VM = function (modal) {
        this.modal = modal;

        this.nextSetStateQuiet = false;
        this.state = ko.observable(0);

        this.isOpen = ko.observable(false);
        this.isOpen.subscribe(function (newIsOpen) {
            if (newIsOpen == true) {
                this.state(Modal.prototype.STATES.EXPANDED);
            } else {
                this.state(Modal.prototype.STATES.CLOSED);
            }
        }, this);

        this.state.subscribe(function (newState) {
            this.modal.applyState(newState, this.nextSetStateQuiet);
            this.nextSetStateQuiet = false;

            this.isOpen(newState == Modal.prototype.STATES.EXPANDED);
        }, this);
    };

    Modal.VM.prototype.setStateQuiet = function (state) {
        this.nextSetStateQuiet = true;
        this.state(state);
    };

    Modal.VM.prototype.STATES = Modal.prototype.STATES;

    return Modal;
})(fSpider.Modal || {}, window.jQuery, window.ko);