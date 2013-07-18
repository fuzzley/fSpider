var fSpider = fSpider || {};
////dependencies\\\\
//fSpider
fSpider.Utils = fSpider.Utils || {};

fSpider.Card = (function (Card, Kinetic, undefined) {
    'use strict';

    var Utils = fSpider.Utils;

    //constructor
    Card = function () {
    };

    //fields
    Card.prototype.hovering = null;
    Card.prototype.selected = null;
    Card.prototype.faceUp = null;
    Card.prototype.pile = null;

    Card.prototype.group = null;
    Card.prototype.faceImg = null;
    Card.prototype.backImg = null;
    Card.prototype.border = null;
    Card.prototype.activeBorder = null;
    Card.prototype.hoverBorder = null;

    Card.prototype._xAnim = null;
    Card.prototype._yAnim = null;

    Card.prototype.borderProps = {
        'visible': true,
        'stroke': '#F5F5F5',
        'strokeWidth': 1.85,
        'cornerRadius': 3.5,
        'fill': '',
        'opacity': 1,
        'padding': -.5
    };
    Card.prototype.activeBorderProps = {
        'visible': true,
        'stroke': '#fff9b0',
        'strokeWidth': 4,
        'cornerRadius': 6,
        'fill': '',
        'opacity': .9,
        'padding': 2
    };
    Card.prototype.hoverBorderProps = {
        'visible': true,
        'stroke': '#a8a8a8',
        'strokeWidth': 1.25,
        'cornerRadius': 4,
        'fill': '',
        'opacity': 1,
        'padding': 0
    };

    //getters setters
    Card.prototype.getFaceImg = function () {
        return this.faceImg;
    };

    Card.prototype.getBackImg = function () {
        return this.backImg;
    };

    Card.prototype.isFaceUp = function () {
        return this.faceUp;
    };
    Card.prototype.setFaceUp = function (faceUp, settings) {
        if (settings == null) {
            settings = {};
        }

        if (this.faceUp === faceUp) {
            return;
        }
        this.faceUp = faceUp;
        this.refresh();
    };

    Card.prototype.getXAnimation = function () {
        return this._xAnim;
    };
    Card.prototype._setXAnimation = function (xAnim) {
        this._xAnim = xAnim;
    };

    Card.prototype.getYAnimation = function () {
        return this._yAnim;
    };
    Card.prototype._setYAnimation = function (yAnim) {
        this._yAnim = yAnim;
    };

    Card.prototype.getGroup = function () {
        return this.group;
    };

    Card.prototype.getBorder = function () {
        return this.border;
    };

    Card.prototype.getActiveBorder = function () {
        return this.activeBorder;
    };

    Card.prototype.getHoverBorder = function () {
        return this.hoverBorder;
    };

    Card.prototype.getPile = function () {
        return this.pile;
    };
    Card.prototype.setPile = function (pile) {
        this.pile = pile;
    };

    Card.prototype.setX = function (x, settings) {
        if (settings == null) {
            settings = {};
        }

        var xAnim = this.getXAnimation();
        if (xAnim !== null) {
            xAnim.stop();
            this._setXAnimation(null);
        }

        if (Math.abs(this.getX() - x) < .1) {
            return;
        }

        var animTime = 0;
        var delay = 0;
        if (settings.animate === true) {
            if (settings.animTime != null) {
                animTime = settings.animTime;
            }
            if (settings.animDelay != null) {
                delay = settings.animDelay;
            }
        }
        var sound = settings.volume != null && settings.volume > 0;

        if (animTime > 0) {
            var self = this;

            var layer = this.group.getLayer();
            var scale = this.pile.getGroup().getScaleX();
            var fromX = this.group.getAbsolutePosition().x;
            var toX = this.group.getParent().getAbsolutePosition().x + x * scale;
            var dX = toX - fromX;
            var msStep = dX / animTime;
            self.pile.getGroup().moveToTop();

            xAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTime) {
                    xAnim.stop();
                    self._setXAnimation(null);
                    self.group.setX(x);
                } else {
                    var newX = fromX + frame.time * msStep;
                    if ((msStep < 0 && newX < toX) || (msStep > 0 && newX > toX)) {
                        newX = toX;
                    }
                    var newY = self.group.getAbsolutePosition().y;
                    self.group.setAbsolutePosition(newX, newY);
                }
            }, layer);
            this._setXAnimation(xAnim);

            setTimeout(function () {
                if (xAnim != null) {
                    xAnim.start();
                }
            }, delay);
        } else {
            this.group.setX(x);
        }
    };
    Card.prototype.getX = function () {
        return this.group.getX();
    };

    Card.prototype.setY = function (y, settings) {
        if (settings == null) {
            settings = {};
        }

        var yAnim = this.getYAnimation();
        if (yAnim !== null) {
            yAnim.stop();
            this._setYAnimation(null);
        }

        if (Math.abs(this.getY() - y) < .1) {
            return;
        }

        var animTime = 0;
        var delay = 0;
        if (settings.animate === true) {
            if (settings.animTime != null) {
                animTime = settings.animTime;
            }
            if (settings.animDelay != null) {
                delay = settings.animDelay;
            }
        }
        var sound = settings.volume != null && settings.volume > 0;

        if (animTime > 0) {
            var self = this;

            var layer = this.group.getLayer();
            var scale = this.pile.getGroup().getScaleY();
            this.group.setAbsolutePosition(this.group.getAbsolutePosition());
            var fromY = fSpider.Utils.formatPointToLayer({ y: this.group.getAbsolutePosition().y }, layer).y;
            var toY = fSpider.Utils.formatPointToLayer({ y: this.pile.getGroup().getAbsolutePosition().y }, layer).y + y * scale;
            var dY = toY - fromY;
            var msStep = dY / animTime;
            self.pile.getGroup().moveToTop();

            yAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTime) {
                    yAnim.stop();
                    self._setYAnimation(null);
                    self.group.setY(y);
                } else {
                    var newY = fromY + frame.time * msStep;
                    if ((msStep < 0 && newY < toY) || (msStep > 0 && newY > toY)) {
                        newY = toY;
                    }
                    var newX = self.group.getAbsolutePosition().x;
                    self.group.setAbsolutePosition(newX, newY);
                }
            }, layer);

            this._setYAnimation(yAnim);
            setTimeout(function () {
                if (yAnim != null) {
                    yAnim.start();
                }
            }, delay);
        } else {
            this.group.setY(y);
        }
    };
    Card.prototype.getY = function () {
        return this.group.getY();
    };

    Card.prototype.getWidth = function (scale) {
        if (scale == null) {
            scale = this.group.getScaleX();
        }
        return this.group.getWidth() * scale;
    };
    Card.prototype.setWidth = function (width) {
        if (this.group != null) {
            this.group.setWidth(width);
        }
        if (this.border != null) {
            this.border.setWidth(width + this.borderProps.padding * 2);
        }
        if (this.activeBorder != null) {
            this.activeBorder.setWidth(width + this.activeBorderProps.padding * 2);
        }
        if (this.hoverBorder != null) {
            this.hoverBorder.setWidth(width + this.hoverBorderProps.padding * 2);
        }
        if (this.backImg != null) {
            this.backImg.setWidth(width);
        }
        if (this.faceImg != null) {
            this.faceImg.setWidth(width);
        }
    };

    Card.prototype.getHeight = function (scale) {
        if (scale == null) {
            scale = this.group.getScaleY();
        }
        return this.group.getHeight() * scale;
    };
    Card.prototype.setHeight = function (height) {
        if (this.group != null) {
            this.group.setHeight(height);
        }
        if (this.border != null) {
            this.border.setHeight(height + this.borderProps.padding * 2);
        }
        if (this.activeBorder != null) {
            this.activeBorder.setHeight(height + this.activeBorderProps.padding * 2);
        }
        if (this.hoverBorder != null) {
            this.hoverBorder.setHeight(height + this.hoverBorderProps.padding * 2);
        }
        if (this.backImg != null) {
            this.backImg.setHeight(height);
        }
        if (this.faceImg != null) {
            this.faceImg.setHeight(height);
        }
    };

    Card.prototype.getAbsolutePosition = function () {
        return this.group.getAbsolutePosition();
    };
    Card.prototype.setAbsolutePosition = function (absPos) {
        return this.group.setAbsolutePosition(absPos);
    };

    Card.prototype.getAbsoluteCenter = function (scale) {
        if (scale === undefined) {
            scale = 1;
        }
        var pos = this.group.getAbsolutePosition();
        return {
            'x': pos.x + (this.getWidth(scale) / 2),
            'y': pos.y + (this.getHeight(scale) / 2)
        };
    };

    Card.prototype.setListening = function (listening) {
        this.group.setListening(listening);
    };

    Card.prototype.setDraggable = function (draggable) {
        this.group.setDraggable(draggable);
    };

    Card.prototype.setVisible = function (visible) {
        this.getGroup().setVisible(visible);
    };

    Card.prototype.setHovering = function (hovering) {
        if (this.hovering === hovering) {
            return;
        }
        this.hovering = hovering;
        this.refresh();
    };
    Card.prototype.isHovering = function () {
        return this.hovering;
    };

    Card.prototype.setSelected = function (selected, settings) {
        if (settings == null) {
            settings = {};
        }

        if (this.selected === selected) {
            return;
        }
        this.selected = selected;
        this.refresh();
        if (this.pile != null) {
            this.pile.arrangeCards(null, null, settings);
        }
    };
    Card.prototype.isSelected = function () {
        return this.selected;
    };

    //public methods
    Card.prototype.refresh = function () {
        //card face/back visibility
        if (this.faceImg != null) {
            this.faceImg.setVisible(this.faceUp === true);
        }
        if (this.backImg != null) {
            this.backImg.setVisible(this.faceUp !== true);
        }

        //active boarder
        this.activeBorder.setVisible(this.hovering === true || this.selected === true);

        //hover border
        this.hoverBorder.setVisible(this.hovering === true);
    };

    Card.prototype.remove = function () {
        this.group.remove();
    };

    Card.prototype.loadFaceImg = function (img, cropSqr, w, h) {
        if (this.faceImg == null) {
            this.faceImg = new Kinetic.Image();
            if (this.group != null) {
                this.group.add(this.faceImg);
            }
        }
        this.faceImg.setImage(img);
        this.faceImg.moveToBottom();
        if (cropSqr != null) {
            this.faceImg.setCrop(cropSqr);
        }
        if (w != null) {
            this.setWidth(w);
        }
        if (h != null) {
            this.setHeight(h);
        }
    };

    Card.prototype.loadBackImg = function (img, cropSqr, w, h) {
        if (this.backImg == null) {
            this.backImg = new Kinetic.Image();
            if (this.group != null) {
                this.group.add(this.backImg);
            }
        }
        this.backImg.setImage(img);
        this.backImg.moveToBottom();
        if (cropSqr != null) {
            this.backImg.setCrop(cropSqr);
        }
        if (w != null) {
            this.setWidth(w);
        }
        if (h != null) {
            this.setHeight(h);
        }
    };

    Card.prototype.on = function (eventName, callback) {
        this.group.on(eventName, callback);
    };

    Card.prototype.off = function (eventName, callback) {
        this.group.off(eventName, callback);
    };
    return Card;
})(fSpider.Card || {}, window.Kinetic);

fSpider.PlayingCard = (function (PlayingCard, Kinetic, undefined) {
    'use strict';

    var Card = fSpider.Card;
    var Utils = fSpider.Utils;

    PlayingCard = function (suit, type) {
        this.suit = suit;
        this.type = type;

        this.group = new Kinetic.Group({
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.border = new Kinetic.Rect({
            visible: this.borderProps.visible,
            x: 0 - this.borderProps.padding,
            y: 0 - this.borderProps.padding,
            opacity: this.borderProps.opacity,
            fill: this.borderProps.fill,
            stroke: this.borderProps.stroke,
            strokeWidth: this.borderProps.strokeWidth,
            cornerRadius: this.borderProps.cornerRadius
        });
        this.activeBorder = new Kinetic.Rect({
            visible: false,
            x: 0 - this.activeBorderProps.padding,
            y: 0 - this.activeBorderProps.padding,
            opacity: this.activeBorderProps.opacity,
            fill: this.activeBorderProps.fill,
            stroke: this.activeBorderProps.stroke,
            strokeWidth: this.activeBorderProps.strokeWidth,
            cornerRadius: this.activeBorderProps.cornerRadius
        });
        this.hoverBorder = new Kinetic.Rect({
            visible: false,
            x: 0 - this.hoverBorderProps.padding,
            y: 0 - this.hoverBorderProps.padding,
            opacity: this.hoverBorderProps.opacity,
            fill: this.hoverBorderProps.fill,
            stroke: this.hoverBorderProps.stroke,
            strokeWidth: this.hoverBorderProps.strokeWidth,
            cornerRadius: this.hoverBorderProps.cornerRadius
        });

        this.group.add(this.border);
        this.group.add(this.activeBorder);
        this.group.add(this.hoverBorder);
    };

    Utils.extendObj(PlayingCard, Card);

    //fields
    PlayingCard.prototype.suit = 0;
    PlayingCard.prototype.type = 0;

    //getters setters
    PlayingCard.prototype.getSuit = function () {
        return this.suit;
    };
    PlayingCard.prototype.setSuit = function (suit) {
        this.suit = suit;
    };

    PlayingCard.prototype.getType = function () {
        return this.type;
    };
    PlayingCard.prototype.setType = function (type) {
        this.type = type;
    };

    //public functions

    //static fields
    PlayingCard.CARD_DIM = { w: 90, h: 120 };
    PlayingCard.CARD_TYPES = {
        ace: 0,
        two: 1,
        three: 2,
        four: 3,
        five: 4,
        six: 5,
        seven: 6,
        eight: 7,
        nine: 8,
        ten: 9,
        jack: 10,
        queen: 11,
        king: 12
    };
    PlayingCard.CARD_SUITS = {
        clubs: 0,
        hearts: 1,
        spades: 2,
        diamonds: 3
    };

    return PlayingCard;
})(fSpider.PlayingCard || {}, window.Kinetic);