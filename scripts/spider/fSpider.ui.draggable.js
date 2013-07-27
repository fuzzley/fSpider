(function ($, window, document, undefined) {
    $.fn.draggable = function (options) {
        var opts = $.extend({ }, $.fn.draggable.defaults, options);
        var $contain = $(opts.containment);

        return this.each(function () {
            var $this = $(this);

            var originalPos = { left: $this.offset().left, top: $this.offset().top };
            var cssPos = { left: parseFloat($this.css('left')), top: parseFloat($this.css('top')) };
            if (isNaN(cssPos.left) !== true) {
                originalPos.left -= parseFloat(cssPos.left);
            }
            if (isNaN(cssPos.top) !== true) {
                originalPos.top -= parseFloat(cssPos.top);
            }

            var offset = { left: 0, top: 0 };
            var cursor = 'auto';

            //prepare element
            $this.on('mousedown', onMouseDown);

            function onMouseDown(evt) {
                if (isIgnoreNodeType(evt.target) === true) {
                    return;
                }

                //attach move/up listeners
                $(document).on('mousemove', onMouseMove);
                $(document).on('mouseup', onMouseUp);

                //change cursor
                cursor = document.body.style.cursor;
                document.body.style.cursor = opts.cursor;

                //capture offset
                offset.left = evt.offsetX;
                offset.top = evt.offsetY;

                $(document.body).css({ 'user-select': 'none' });
            }

            function onMouseUp(evt) {
                //detach move/up listeners
                $(document).off('mouseup', onMouseUp);
                $(document).off('mousemove', onMouseMove);

                //change cursor
                document.body.style.cursor = cursor;

                $(document.body).css({ 'user-select': 'auto' });
            }

            function onMouseMove(evt) {
                var pos = {};
                pos.left = evt.clientX - offset.left;
                pos.top = evt.clientY - offset.top;
                var posType = $this.css('position');
                if (posType == 'relative') {
                    pos.left -= originalPos.left;
                    pos.top -= originalPos.top;
                }
                $this.css({ 'left': pos.left + 'px', 'top': pos.top + 'px' });
            }

            function isIgnoreNodeType(target) {
                return opts.ignoreNodeTypes.indexOf(target.nodeName) >= 0;
            }
        });
    };

    $.fn.draggable.defaults = {
        containment: 'document',
        cursor: 'move',
        ignoreNodeTypes: [
            'BUTTON',
            'INPUT',
            'SELECT'
        ]
    };
})(window.jQuery, window, window.document);