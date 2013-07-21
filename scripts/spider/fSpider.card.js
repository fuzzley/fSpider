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

    Card.prototype.animationLayer = null;
    Card.prototype.positionAnimator = null;
    Card.prototype.positionAnimatorContext = null;
    Card.prototype.positionAnimationTimeout = null;

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

    Card.prototype.setAnimationLayer = function (layer) {
        this.animationLayer = layer;
    };
    Card.prototype.getAnimationLayer = function () {
        return this.animationLayer;
    };

    Card.prototype.getPile = function () {
        return this.pile;
    };
    Card.prototype.setPile = function (pile) {
        this.pile = pile;
    };

    Card.prototype.setPosition = function (x, y, settings) {
        if (settings == null) {
            settings = {};
        }

        //stop any existing position animation
        if (this.isPositionAnimationRunning() === true) {
            this.stopPositionAnimation(false);
        }

        if (Math.abs(this.group.getX() - x) < .001 && Math.abs(this.group.getY() - y) < .001) {
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
            this.positionAnimatorContext = this.preparePositionAnimationContext(x, y, animTime);
        }
        var sound = settings.volume != null && settings.volume > 0;

        var self = this;
        var setPos = function () {
            if (animTime > 0) {
                self.group.getLayer().draw();
                self.startPositionAnimation();
            } else {
                self.group.setPosition(x, y);
            }
        };

        if (delay > 0) {
            this.positionAnimationTimeout = setTimeout(function () {
                setPos();

                clearTimeout(self.positionAnimationTimeout);
                self.positionAnimationTimeout = null;
            }, delay);
        } else {
            setPos();
        }
    };
    Card.prototype.getPosition = function () {
        return this.group.getPosition();
    };

    Card.prototype.getX = function () {
        return this.group.getX();
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

    Card.prototype.setZIndex = function (zIndex) {
        this.group.setZIndex(zIndex);
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
            this.pile.arrangeCards(settings);
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

    Card.prototype.isPositionAnimationRunning = function () {
        return this.positionAnimationTimeout != null || (this.positionAnimator != null && this.positionAnimator.isRunning() === true);
    };

    Card.prototype.stopPositionAnimation = function (moveToIntendedPos) {
        var context = this.positionAnimatorContext;

        if (this.positionAnimationTimeout != null) {
            //stop any existing position change delay
            clearTimeout(this.positionAnimationTimeout);
            this.positionAnimationTimeout = null;
        }

        if (this.positionAnimator != null && this.positionAnimator.isRunning() === true) {
            this.positionAnimator.stop();
        }

        if (moveToIntendedPos === true) {
            this.group.setAbsolutePosition(context.intendedAbsPos);
//            this.group.setPosition(context.intendedPos);
        }

        var layer = this.group.getLayer();
        //we need to wait for other animations in the group to stop before moving them all back to original layer
        //otherwise we get some graphical glitches with cards having the wrong z order because of 2 layers
        if (this.pile != null && this.pile.getGroup() !== this.group.getParent()) {
            var animating = this.pile.countCardsAnimating();
            if (animating <= 1) {
                this.pile.moveAllCardsToGroup();
                this.group.getLayer().draw();
                if (layer !== this.group.getLayer()) {
                    layer.draw();
                }
            }
        }

        //redraw original layer
        if (context.originalLayer != null) {
            context.originalLayer.draw();
        }

        //cleanup
        this.positionAnimator = null;
        this.positionAnimatorContext = null;
    };

    Card.prototype.stepPositionAnimation = function (frame) {
        var context = this.positionAnimatorContext;
        if (frame.time >= context.animTime) { //done with animation
            this.stopPositionAnimation(true);
        } else {  //animation delta
            var absPos = this.group.getAbsolutePosition();
            var newAbsPos = { x: absPos.x + frame.timeDiff * context.msStep.x, y: absPos.y + frame.timeDiff * context.msStep.y };
            this.group.setAbsolutePosition(newAbsPos);
        }
    };

    Card.prototype.startPositionAnimation = function () {
        //if animation layer isn't current layer, move to animation layer
        if (this.tryMoveToAnimationLayer() === true) {
            this.group.moveToTop();
        } else if (this.pile != null && this.pile.getGroup() != null && this.group.getLayer() != null) {
            this.pile.moveToTop();
        }

        var layer = this.group.getLayer();
        if (layer != null && this.animationLayer != null && layer !== this.animationLayer) {
            layer.draw();
        }

        if (this.positionAnimator == null) {
            var self = this;
            this.positionAnimator = new Kinetic.Animation(function (frame) {
                self.stepPositionAnimation(frame);
            }, this.animationLayer || layer);
        }

        this.positionAnimator.start();
    };

    Card.prototype.tryMoveToAnimationLayer = function () {
        if (this.animationLayer == null || this.group.getLayer() === this.animationLayer) {
            return false;
        }

        var absPos = this.getAbsolutePosition();
        this.group.moveTo(this.animationLayer);
        this.setAbsolutePosition(absPos);
        return true;
    };

    Card.prototype.tryMoveToPileGroup = function () {
        if (this.pile == null || this.pile.getGroup() == null || this.group.getParent() == this.pile.getGroup()) {
            return false;
        }

        var absPos = this.getAbsolutePosition();
        this.group.moveTo(this.pile.getGroup());
        this.setAbsolutePosition(absPos);
        this.pile.resetCardZOrder();
        return true;
    };

    Card.prototype.stopAllAnimations = function () {
        if (this.isPositionAnimationRunning() === true) {
            this.stopPositionAnimation(true);
        }
    };

    Card.prototype.preparePositionAnimationContext = function (x, y, animTime) {
        //find absolute positions for ourselves and our parent
        var scale = this.group.getScaleX();
        var absPos = this.group.getAbsolutePosition();
        var layer = this.group.getLayer();
        var ownerAbsPos, ownerLayer;
        if (this.pile != null && this.pile.getGroup() != null) {
            ownerAbsPos = this.pile.getGroup().getAbsolutePosition();
            scale = this.pile.getGroup().getScaleX();
            ownerLayer = this.pile.getGroup().getLayer();
        } else {
            ownerAbsPos = { x: absPos.x, y: absPos.y };
            ownerLayer = this.group.getLayer();
        }

        //figure out our delta
        var from = fSpider.Utils.formatPointToLayer(absPos, this.animationLayer || layer);
        var to = fSpider.Utils.formatPointToLayer(ownerAbsPos, ownerLayer);
        to.y += y * scale;
        to.x += x * scale;
        var delta = { x: to.x - from.x, y: to.y - from.y };

        //build context
        var context = {};
        context.originalLayer = layer;
        context.animTime = animTime;
        context.intendedPos = { x: x, y: y };
        context.intendedAbsPos = to;
        context.originalAbsPos = from;
        context.msStep = { x: delta.x / animTime, y: delta.y / animTime };

        return context;
    };

    Card.prototype.toString = function () {
        return '[Card]faceup: ' + this.faceUp;
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
        var self = this;

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
    PlayingCard.prototype.toString = function () {
        return '[PlayingCard]suit: ' + this.suit + ', type: ' + this.type + ';';
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

    return PlayingCard;
})(fSpider.PlayingCard || {}, window.Kinetic);