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
    Card.prototype.faceUp = false;
    Card.prototype.hovering = false;
    Card.prototype.selected = false;
    Card.prototype.pile = null;

    Card.prototype.group = undefined;
    Card.prototype.faceImg = undefined;
    Card.prototype.faceKineticImg = undefined;
    Card.prototype.backImg = undefined;
    Card.prototype.backKineticImg = undefined;
    Card.prototype.border = undefined;
    Card.prototype.activeBorder = undefined;
    Card.prototype.hoverBorder = undefined;

    Card.prototype._xAnim = null;
    Card.prototype._yAnim = null;

    //getters setters
    Card.prototype.getFaceImg = function () {
        return this.faceImg;
    };
    Card.prototype.setFaceImg = function (faceImg) {
        this.faceImg = faceImg;
    };

    Card.prototype.getFaceKineticImg = function () {
        return this.faceKineticImg;
    };
    Card.prototype.setFaceKineticImg = function (faceKineticImg) {
        this.faceKineticImg = faceKineticImg;
    };

    Card.prototype.getBackImg = function () {
        return this.backImg;
    };
    Card.prototype.setBackImg = function (backImg) {
        this.backImg = backImg;
    };

    Card.prototype.getBackKineticImg = function () {
        return this.backKineticImg;
    };
    Card.prototype.setBackKineticImg = function (backKineticImg) {
        this.backKineticImg = backKineticImg;
    };

    Card.prototype.isFaceUp = function () {
        return this.faceUp;
    };
    Card.prototype.setFaceUp = function (faceUp) {
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

    Card.prototype.setX = function (x, animTimeMS, delay) {
        var xAnim = this.getXAnimation();
        if (xAnim !== null) {
            xAnim.stop();
            this._setXAnimation(null);
        }

        if (Math.abs(this.getX() - x) < .1) {
            return;
        }

        if (animTimeMS !== undefined && animTimeMS > 0) {
            if (delay === undefined) {
                delay = 0;
            }

            var self = this;

            var layer = this.group.getLayer();
            var scale = this.pile.getGroup().getScaleX();
            var fromX = this.group.getAbsolutePosition().x;
            var toX = this.group.getParent().getAbsolutePosition().x + x * scale;
            var dX = toX - fromX;
            var msStep = dX / animTimeMS;

            this.group.getParent().moveToTop();

            xAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTimeMS + delay) {
                    xAnim.stop();
                    self._setXAnimation(null);
                    self.group.setX(x);
                } else if (frame.time > delay) {
                    var newX = fromX + (frame.time - delay) * msStep;
                    if ((msStep < 0 && newX < toX) || (msStep > 0 && newX > toX)) {
                        newX = toX;
                    }
                    var newY = self.group.getAbsolutePosition().y;
                    self.group.setAbsolutePosition(newX, newY);
                }
            }, layer);
            this._setXAnimation(xAnim);
            xAnim.start();
        } else {
            this.group.setX(x);
        }
    };
    Card.prototype.getX = function () {
        return this.group.getX();
    };

    Card.prototype.setY = function (y, animTimeMS, delay) {
        var yAnim = this.getYAnimation();
        if (yAnim !== null) {
            yAnim.stop();
            this._setYAnimation(null);
        }

        if (Math.abs(this.getY() - y) < .1) {
            return;
        }

        if (animTimeMS !== undefined && animTimeMS > 0) {
            if (delay === undefined) {
                delay = 0;
            }

            var self = this;

            var layer = this.group.getLayer();
            var scale = this.pile.getGroup().getScaleY();
            this.group.setAbsolutePosition(this.group.getAbsolutePosition());
            var fromY = fSpider.Utils.formatPointToLayer({ y: this.group.getAbsolutePosition().y }, layer).y;
            var toY = fSpider.Utils.formatPointToLayer({ y: this.pile.getGroup().getAbsolutePosition().y }, layer).y + y * scale;
            var dY = toY - fromY;
            var msStep = dY / animTimeMS;

            this.group.getParent().moveToTop();

            yAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTimeMS + delay) {
                    yAnim.stop();
                    self._setYAnimation(null);
                    self.group.setY(y);
                } else if (frame.time > delay) {
                    var newY = fromY + (frame.time - delay) * msStep;
                    if ((msStep < 0 && newY < toY) || (msStep > 0 && newY > toY)) {
                        newY = toY;
                    }
                    var newX = self.group.getAbsolutePosition().x;
                    self.group.setAbsolutePosition(newX, newY);
                }
            }, layer);
            this._setYAnimation(yAnim);
            yAnim.start();
        } else {
            this.group.setY(y);
        }
    };
    Card.prototype.getY = function () {
        return this.group.getY();
    };

    Card.prototype.getWidth = function (scale) {
        if (scale === undefined) {
            scale = 1;
        }
        return this.group.getWidth() * scale;
    };

    Card.prototype.getHeight = function (scale) {
        if (scale === undefined) {
            scale = 1;
        }
        return this.group.getHeight() * scale;
    };

    Card.prototype.getAbsolutePosition = function () {
        return this.group.getAbsolutePosition();
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

    Card.prototype.setSelected = function (selected) {
        if (this.selected === selected) {
            return;
        }
        this.selected = selected;
        this.refresh();
    };
    Card.prototype.isSelected = function () {
        return this.selected;
    };

    //public methods
    Card.prototype.refresh = function () {
        //card face/back visibility
        if (this.faceKineticImg != null) {
            this.faceKineticImg.setVisible(this.faceUp === true);
        }
        if (this.backKineticImg != null) {
            this.backKineticImg.setVisible(this.faceUp !== true);
        }

        //active boarder
        this.activeBorder.setVisible(this.hovering === true || this.selected === true);

        //hover border
        this.hoverBorder.setVisible(this.hovering === true);
    };

    Card.prototype.remove = function () {
        this.group.remove();
    };

    Card.prototype.loadFaceImg = function (img, w, h) {
        this.setFaceImg(img);
        this.setFaceKineticImg(Utils.loadKineticImage(this.faceImg, w, h));
        this.group.add(this.faceKineticImg);
        this.border.remove();
        this.group.add(this.border); //make sure it's on top
    };

    Card.prototype.loadBackImg = function (img, w, h) {
        this.setBackImg(img);
        this.setBackKineticImg(Utils.loadKineticImage(this.backImg, w, h));
        this.group.add(this.backKineticImg);
        this.border.remove();
        this.group.add(this.border); //make sure it's on top
    };

    Card.prototype.on = function (eventName, callback) {
        this.group.on(eventName, callback);
    };

    Card.prototype.off = function (eventName, callback) {
        this.group.off(eventName, callback);
    };

    Card.prototype.toString = function () {
        return '[fSpider.Card]faceup: ' + this.isFaceUp() + ';';
    };

    return Card;
})(fSpider.Card || {}, window.Kinetic);

fSpider.PlayingCard = (function (PlayingCard, Kinetic, undefined) {
    'use strict';

    var Card = fSpider.Card;
    var Utils = fSpider.Utils;

    PlayingCard = function (suit, type) {
        this.cardSuit = suit;
        this.cardType = type;

        this.group = new Kinetic.Group({
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.border = new Kinetic.Rect({
            x: 0 - PlayingCard.BORDER.padding,
            y: 0 - PlayingCard.BORDER.padding,
            visible: true,
            opacity: PlayingCard.BORDER.opacity,
            fill: PlayingCard.BORDER.fill,
            stroke: PlayingCard.BORDER.stroke,
            strokeWidth: PlayingCard.BORDER.strokeWidth,
            cornerRadius: PlayingCard.BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w + PlayingCard.BORDER.padding,
            height: PlayingCard.CARD_DIM.h + PlayingCard.BORDER.padding
        });
        this.activeBorder = new Kinetic.Rect({
            visible: false,
            opacity: PlayingCard.ACTIVE_BORDER.opacity,
            fill: PlayingCard.ACTIVE_BORDER.fill,
            stroke: PlayingCard.ACTIVE_BORDER.stroke,
            strokeWidth: PlayingCard.ACTIVE_BORDER.strokeWidth,
            cornerRadius: PlayingCard.ACTIVE_BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.hoverBorder = new Kinetic.Rect({
            visible: false,
            opacity: PlayingCard.HOVER_BORDER.opacity,
            fill: PlayingCard.HOVER_BORDER.fill,
            stroke: PlayingCard.HOVER_BORDER.stroke,
            strokeWidth: PlayingCard.HOVER_BORDER.strokeWidth,
            cornerRadius: PlayingCard.HOVER_BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });

        this.group.add(this.activeBorder);
        this.group.add(this.hoverBorder);
        this.group.add(this.border);
    };

    Utils.extendObj(PlayingCard, Card);

    //getters setters
    PlayingCard.prototype.getType = function () {
        return this.cardType;
    };

    PlayingCard.prototype.getSuit = function () {
        return this.cardSuit;
    };

    //public functions
    PlayingCard.prototype.toString = function () {
        return '[fSpider.PlayingCard]suit: ' + this.getSuit() + ', type: ' + this.getType() + ', faceup: ' + this.isFaceUp() + ';';
    };

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
    PlayingCard.BORDER = {
        'visible': true,
        'stroke': '#F0F0F0',
        'strokeWidth': 1.5,
        'cornerRadius': 4.25,
        'fill': '',
        'opacity': 1,
        'padding': -.5
    };
    PlayingCard.ACTIVE_BORDER = {
        'visible': true,
        'stroke': '#fff9b0',
        'strokeWidth': 6,
        'cornerRadius': 4,
        'fill': '',
        'opacity': .9
    };
    PlayingCard.HOVER_BORDER = {
        'visible': true,
        'stroke': '#a8a8a8',
        'strokeWidth': 1.5,
        'cornerRadius': 4,
        'fill': '',
        'opacity': 1
    };

    return PlayingCard;
})(fSpider.PlayingCard || {}, window.Kinetic);