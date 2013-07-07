var fSpider = fSpider || {};
////dependencies\\\\
//fSpider
fSpider.Utils = fSpider.Utils || {};

fSpider.Card = (function (Card, Kinetic, undefined) {
    'use strict';

    var Utils = fSpider.Utils;

    //constructor
    function Card(type, suit) {
        this.cardType = type;
        this.cardSuit = suit;
        this.faceUp = false; //bool
        this.hovering = false;
        this.selected = false;
        this.pile = undefined;
        this._faceImg = undefined; //Image
        this._backImg = undefined; //Image
        this._faceKineticImg = undefined;
        this._backKineticImg = undefined; //Kinetic.Image
        this._xAnim = null;
        this._yAnim = null;
        this._group = new Kinetic.Group({
            width: Card.cardDim.w,
            height: Card.cardDim.h
        });
        this._border = new Kinetic.Rect({
            x: 0 - Card.border.padding,
            y: 0 - Card.border.padding,
            visible: true,
            opacity: Card.border.opacity,
            fill: Card.border.fill,
            stroke: Card.border.stroke,
            strokeWidth: Card.border.strokeWidth,
            cornerRadius: Card.border.cornerRadius,
            width: Card.cardDim.w + Card.border.padding,
            height: Card.cardDim.h + Card.border.padding
        });
        this._activeBorder = new Kinetic.Rect({
            visible: false,
            opacity: Card.activeBorder.opacity,
            fill: Card.activeBorder.fill,
            stroke: Card.activeBorder.stroke,
            strokeWidth: Card.activeBorder.strokeWidth,
            cornerRadius: Card.activeBorder.cornerRadius,
            width: Card.cardDim.w,
            height: Card.cardDim.h
        });
        this._hoverBorder = new Kinetic.Rect({
            visible: false,
            opacity: Card.hoverBorder.opacity,
            fill: Card.hoverBorder.fill,
            stroke: Card.hoverBorder.stroke,
            strokeWidth: Card.hoverBorder.strokeWidth,
            cornerRadius: Card.hoverBorder.cornerRadius,
            width: Card.cardDim.w,
            height: Card.cardDim.h
        });

        this._group.add(this._activeBorder);
        this._group.add(this._hoverBorder);
        this._group.add(this._border);
    }

    //getters setters
    Card.prototype.getType = function () {
        return this.cardType;
    };

    Card.prototype.getSuit = function () {
        return this.cardSuit;
    };

    Card.prototype.getFaceImg = function () {
        return this._faceImg;
    };
    Card.prototype.setFaceImg = function (faceImg) {
        this._faceImg = faceImg;
    };

    Card.prototype.getFaceKineticImg = function () {
        return this._faceKineticImg;
    };
    Card.prototype.setFaceKineticImg = function (faceKineticImg) {
        this._faceKineticImg = faceKineticImg;
    };

    Card.prototype.getBackImg = function () {
        return this._backImg;
    };
    Card.prototype.setBackImg = function (backImg) {
        this._backImg = backImg;
    };

    Card.prototype.getBackKineticImg = function () {
        return this._backKineticImg;
    };
    Card.prototype.setBackKineticImg = function (backKineticImg) {
        this._backKineticImg = backKineticImg;
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
        return this._group;
    };

    Card.prototype.getBorder = function () {
        return this._border;
    };

    Card.prototype.getActiveBorder = function () {
        return this._activeBorder;
    };

    Card.prototype.getHoverBorder = function () {
        return this._hoverBorder;
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

            var layer = this.getGroup().getLayer();
            var scale = this.getPile().getGroup().getScaleX();
            var fromX = this.getGroup().getAbsolutePosition().x;
            var toX = this.getGroup().getParent().getAbsolutePosition().x + x * scale;
            var dX = toX - fromX;
            var msStep = dX / animTimeMS;

            this.getGroup().getParent().moveToTop();

            xAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTimeMS + delay) {
                    xAnim.stop();
                    self._setXAnimation(null);
                    self.getGroup().setX(x);
                } else if (frame.time > delay) {
                    var newX = fromX + (frame.time - delay) * msStep;
                    if ((msStep < 0 && newX < toX) || (msStep > 0 && newX > toX)) {
                        newX = toX;
                    }
                    var newY = self.getGroup().getAbsolutePosition().y;
                    self.getGroup().setAbsolutePosition(newX, newY);
                }
            }, layer);
            this._setXAnimation(xAnim);
            xAnim.start();
        } else {
            this.getGroup().setX(x);
        }
    };
    Card.prototype.getX = function () {
        return this.getGroup().getX();
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

            var layer = this.getGroup().getLayer();
            var scale = this.getPile().getGroup().getScaleY();
            this.getGroup().setAbsolutePosition(this.getGroup().getAbsolutePosition());
            var fromY = fSpider.Utils.formatPointToLayer({ y: this.getGroup().getAbsolutePosition().y }, layer).y;
            var toY = fSpider.Utils.formatPointToLayer({ y: this.getPile().getGroup().getAbsolutePosition().y }, layer).y + y * scale;
            var dY = toY - fromY;
            var msStep = dY / animTimeMS;

            this.getGroup().getParent().moveToTop();

            yAnim = new Kinetic.Animation(function (frame) {
                if (frame.time >= animTimeMS + delay) {
                    yAnim.stop();
                    self._setYAnimation(null);
                    self.getGroup().setY(y);
                } else if (frame.time > delay) {
                    var newY = fromY + (frame.time - delay) * msStep;
                    if ((msStep < 0 && newY < toY) || (msStep > 0 && newY > toY)) {
                        newY = toY;
                    }
                    var newX = self.getGroup().getAbsolutePosition().x;
                    self.getGroup().setAbsolutePosition(newX, newY);
                }
            }, layer);
            this._setYAnimation(yAnim);
            yAnim.start();
        } else {
            this.getGroup().setY(y);
        }
    };
    Card.prototype.getY = function () {
        return this.getGroup().getY();
    };

    Card.prototype.setListening = function (listening) {
        this.getGroup().setListening(listening);
    };

    Card.prototype.setDraggable = function (draggable) {
        this.getGroup().setDraggable(draggable);
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
        if (this.getFaceKineticImg() !== undefined) {
            this.getFaceKineticImg().setVisible(this.isFaceUp());
        }
        if (this.getBackKineticImg() !== undefined) {
            this.getBackKineticImg().setVisible(!this.isFaceUp());
        }

        //active boarder
        this.getActiveBorder().setVisible((this.isHovering() === true || this.isSelected() === true) && Card.activeBorder.visible);

        //hover border
        this.getHoverBorder().setVisible(this.isHovering() === true && Card.hoverBorder.visible);
    };

    Card.prototype.remove = function () {
        this.getGroup().remove();
    };

    Card.prototype.loadFaceImg = function (img) {
        this.setFaceImg(img);
        this.setFaceKineticImg(Utils.loadKineticImage(this.getFaceImg(), Card.cardDim.w, Card.cardDim.h));
        this.getGroup().add(this.getFaceKineticImg());
        this.getBorder().remove();
        this.getGroup().add(this.getBorder()); //make sure it's on top
    };

    Card.prototype.loadBackImg = function (img) {
        this.setBackImg(img);
        this.setBackKineticImg(Utils.loadKineticImage(this.getBackImg(), Card.cardDim.w, Card.cardDim.h));
        this.getGroup().add(this.getBackKineticImg());
        this.getBorder().remove();
        this.getGroup().add(this.getBorder()); //make sure it's on top
    };

    Card.prototype.on = function (eventName, callback) {
        this.getGroup().on(eventName, callback);
    };

    Card.prototype.off = function (eventName, callback) {
        this.getGroup().off(eventName, callback);
    };

    Card.prototype.toString = function () {
        return '[fSpider.Card]suit: ' + this.getSuit() + ', type: ' + this.getType() + ', faceup: ' + this.isFaceUp() + ';';
    };

    //static fields
    Card.cardTypes = {
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
    Card.cardSuits = {
        clubs: 0,
        hearts: 1,
        spades: 2,
        diamonds: 3
    };
    Card.cardDim = { w: 90, h: 120 };
    Card.border = {
        'visible': true,
        'stroke': '#E8E8E8',
        'strokeWidth': 1.5,
        'cornerRadius': 4.25,
        'fill': '',
        'opacity': 1,
        'padding': -.5
    };
    Card.activeBorder = {
        'visible': true,
        'stroke': '#fff9b0',
        'strokeWidth': 6,
        'cornerRadius': 4,
        'fill': '',
        'opacity': .9
    };
    Card.hoverBorder = {
        'visible': true,
        'stroke': '#a8a8a8',
        'strokeWidth': 1.5,
        'cornerRadius': 4,
        'fill': '',
        'opacity': 1
    };

    return Card;
})(fSpider.Card || {},window.Kinetic);