var fSpider = fSpider || {};

////dependencies\\\\
//fSpider
fSpider.Card = fSpider.Card || {};
fSpider.PlayingCard = fSpider.PlayingCard || {};
fSpider.Utils = fSpider.Utils || {};

fSpider.Pile = (function (Pile, undefined) {
    'use strict';

    Pile = function () {
    };

    //public fields
    Pile.prototype.cards = null;
    Pile.prototype.group = null;
    Pile.prototype.availHeight = 0;
    Pile.prototype.availWidth = 0;
    Pile.prototype.baseZIndex = 0;

    //getters/setters
    Pile.prototype.getCards = function () {
        return this.cards || [];
    };

    Pile.prototype.getCardAt = function (index) {
        return this.cards[index];
    };

    Pile.prototype.getSize = function () {
        return (this.cards || []).length;
    };

    Pile.prototype.getGroup = function () {
        return this.group;
    };

    Pile.prototype.setScale = function (scale) {
        this.group.setScale(scale);
    };

    Pile.prototype.setX = function (x) {
        this.group.setX(x);
    };
    Pile.prototype.getX = function () {
        return this.group.getX();
    };

    Pile.prototype.setWidth = function (width) {
        this.group.setWidth(width);
    };
    Pile.prototype.getWidth = function (scale) {
        if (scale == null) {
            scale = 1;
        }
        return this.group.getWidth() * scale;
    };

    Pile.prototype.setY = function (y) {
        this.group.setY(y);
    };
    Pile.prototype.getY = function () {
        return this.group.getY();
    };


    Pile.prototype.setHeight = function (height) {
        this.group.setHeight(height);
    };
    Pile.prototype.getHeight = function (scale) {
        if (scale == null) {
            scale = 1;
        }
        return this.group.getHeight() * scale;
    };

    Pile.prototype.setVisible = function (visible) {
        this.group.setVisible(visible);
    };

    Pile.prototype.setAvailableWidth = function (width) {
        this.availWidth = width;
    };

    Pile.prototype.setAvailableHeight = function (height) {
        this.availHeight = height;
    };

    Pile.prototype.setAvailableDimensions = function (width, height) {
        this.availWidth = width;
        this.availHeight = height;
    };

    //public functions
    Pile.prototype.moveToTop = function () {
        this.group.moveToTop();
    };

    Pile.prototype.transferCards = function (cards, settings, callback) {
        if (settings == null) {
            settings = {};
        }

        if (cards == null || cards.length <= 0) {
            if (callback != null) {
                callback();
            }
            return;
        }

        var self = this;
        var piles = [];
        var clndCards = cards.slice(0, cards.length);
        clndCards.forEach(function (card) {
            var absPos = { x: card.getAbsolutePosition().x, y: card.getAbsolutePosition().y };
            var pile = card.getPile();
            if (pile != null) {
                pile.removeCard(card);
                if (piles.indexOf(pile) < 0) {
                    piles.push(pile);
                }
            }
            self.addCard(card, absPos);
        });
        piles.forEach(function (pile) {
            pile.resetListening();
            pile.resetDraggable();
        });

        var fromIndex = this.cards.indexOf(cards[0]);
        if (fromIndex < 0) {
            fromIndex = 0;
        }
        this.arrangeCards(settings, callback, fromIndex);
    };

    Pile.prototype.addCard = function (card, absPos) {
        card.setPile(this);
        this.cards.push(card);
        this.group.add(card.getGroup());
        card.getGroup().setZIndex(this.baseZIndex + this.cards.indexOf(card));
        if (absPos != null) {
            card.setAbsolutePosition(absPos);
        }
    };

    Pile.prototype.addCards = function (cards, absPositions) {
        var self = this;
        cards.forEach(function (card, i) {
            var absPos;
            if (absPositions != null && i < absPositions.length) {
                absPos = absPositions[i];
            }
            self.addCard(card, absPos);
        });
    };

    Pile.prototype.removeCard = function (card) {
        var index = this.cards.indexOf(card);
        if (index >= 0) {
            this.cards.splice(index, 1);
            card.setPile(undefined);
            card.remove();
        }
        return card;
    };

    Pile.prototype.removeAllCards = function () {
        while (this.cards.length > 0) {
            this.removeCard(this.cards[0]);
        }
    };

    Pile.prototype.arrangeCards = function (settings, callback, fromIndex) {
        //specific to pile type
    };

    Pile.prototype.resetCardFaces = function (settings, callback) {
        //specific to pile type
    };

    Pile.prototype.resetListening = function () {
        //specific to pile type
    };

    Pile.prototype.resetDraggable = function () {
        //specific to pile type
    };

    Pile.prototype.resetCardZOrder = function () {
        var base = this.baseZIndex;
        this.cards.forEach(function (card, i) {
            card.setZIndex(base + i);
        });
    };


    Pile.prototype.reverseCards = function () {
        var cards = this.cards.reverse();
        cards.forEach(function (card) {
            card.getGroup().moveToTop();
        });
    };

    Pile.prototype.getLastCard = function () {
        var length = this.getSize();
        if (length > 0) {
            return this.cards[length - 1];
        }
        //else
        return null;
    };

    Pile.prototype.getCardAndCardsAfter = function (card) {
        var cardsToGive = [];
        var length = this.getSize();

        var index = this.cards.indexOf(card);
        if (index >= 0) {
            for (var i = index; i < length; i++) {
                cardsToGive.push(this.cards[i]);
            }
        }

        return cardsToGive;
    };

    Pile.prototype.countCardsAnimating = function () {
        var animating = 0;
        var length = this.cards.length;
        for (var i = 0; i < length; i++) {
            if (this.cards[i].areAnyAnimationsRunning() === true) {
                animating++;
            }
        }
        return animating;
    };

    Pile.prototype.moveAllCardsToGroup = function () {
        if (this.group == null) {
            return;
        }

        var length = this.cards.length;
        var card, pos;
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            if (card.getGroup().getParent() !== this.group) {
                pos = card.getAbsolutePosition();
                card.getGroup().moveTo(this.group);
                card.setAbsolutePosition(pos);
            }
        }
        this.resetCardZOrder();
    };

    Pile.prototype.destroy = function () {
        this.removeAllCards();
        this.group.remove();
    };

    return Pile;
})(fSpider.Pile || {});

fSpider.TableauPile = (function (TableauPile, undefined) {
    'use strict';

    var Pile = fSpider.Pile;
    var PlayingCard = fSpider.PlayingCard;
    var Utils = fSpider.Utils;

    //constructor
    TableauPile = function (cards) {
        this.cards = cards || [];
        this.group = new Kinetic.Group();
        this.baseZIndex = 2;

        this.placeHolderImg = new Kinetic.Image();

        this.hoverBorder = new Kinetic.Rect({
            visible: false,
            opacity: this.HOVER_BORDER.opacity,
            fill: this.HOVER_BORDER.fill,
            stroke: this.HOVER_BORDER.stroke,
            strokeWidth: this.HOVER_BORDER.strokeWidth,
            cornerRadius: this.HOVER_BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.group.add(this.hoverBorder);
        this.group.add(this.placeHolderImg);

        this.setWidth(PlayingCard.CARD_DIM.w);
    };

    Utils.extendObj(TableauPile, Pile);

    //fields
    TableauPile.prototype.hovering = false;
    TableauPile.prototype.hoverBorder = null;

    TableauPile.prototype.HOVER_BORDER = {
        'visible': true,
        'stroke': '#FFFF99',
        'strokeWidth': 5,
        'cornerRadius': 4,
        'fill': '#FFFF99',
        'opacity': 0.25
    };

    //getters/setters
    TableauPile.prototype.getPlaceHolderImg = function () {
        return this.placeHolderImg;
    };

    TableauPile.prototype.setHovering = function (hovering) {
        if (this.hovering === hovering) {
            return;
        }
        this.hovering = hovering;
        this.refresh();
    };
    TableauPile.prototype.isHovering = function () {
        return this.hovering;
    };

    TableauPile.prototype.getPlaceHolderWidth = function () {
        return this.placeHolderImg.getWidth();
    };
    TableauPile.prototype.setPlaceHolderWidth = function (width) {
        if (this.placeHolderImg != null) {
            this.placeHolderImg.setWidth(width);
        }
        if (this.hoverBorder != null) {
            this.hoverBorder.setWidth(width);
        }
    };

    TableauPile.prototype.getPlaceHolderHeight = function () {
        return this.placeHolderImg.getHeight();
    };
    TableauPile.prototype.setPlaceHolderHeight = function (height) {
        if (this.placeHolderImg != null) {
            this.placeHolderImg.setHeight(height);
        }
        if (this.hoverBorder != null) {
            this.hoverBorder.setHeight(height);
        }
    };

    //public methods
    TableauPile.prototype.refresh = function () {
        //hover border
        this.hoverBorder.setVisible(this.hovering === true && this.HOVER_BORDER.visible);
    };

    TableauPile.prototype.getCompleteSequence = function () {
        var nCardsInCompleteSequence = 13;
        var card;

        var sequence = [];
        var length = this.getSize();

        //basic check first, in case we don't have to iterate through all cards
        if (length < nCardsInCompleteSequence || this.cards[length - nCardsInCompleteSequence].isFaceUp() !== true) { //don't have enough faceup cards
            return sequence;
        }

        //otherwise we try find the sequence from top to bottom
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            if (card.isFaceUp() !== true) { //not face up
                continue; //just skip it
            }
            if (sequence.length === 0) { //no possible sequence started yet
                if (card.getType() === PlayingCard.CARD_TYPES.king) { //card is a king
                    sequence.push(card); //start a possible sequence
                }
            } else { //possible sequence already started
                var lastCard = sequence[sequence.length - 1];
                if (card.getSuit() === lastCard.getSuit() && card.getType() === lastCard.getType() - 1) { //same suit and type less by 1
                    sequence.push(card); //add to possible sequence
                } else { //doesn't fit
                    sequence = []; //restart search
                    if (card.getType() === PlayingCard.CARD_TYPES.king) { //card is a king
                        sequence.push(card); //start a possible sequence
                    }
                }
            }
        }

        //make sure it's a complete sequence
        if (sequence.length !== nCardsInCompleteSequence) {
            sequence = [];
        }

        return sequence;
    };

    TableauPile.prototype.setLastCardFaceUp = function (faceUp, settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var changed = false;

        var length = this.getSize();
        if (length > 0) {
            var card = this.cards[length - 1];
            changed = card.isFaceUp() !== faceUp;
            card.setFaceUp(faceUp, settings, function () {
                if (callback != null) {
                    callback(true);
                }
            });
        }

        if (changed !== true) {
            if (callback != null) {
                callback(false);
            }
        }

        return changed;
    };

    TableauPile.prototype.loadPlaceHolderImg = function (img, cropSqr, w, h) {
        if (this.placeHolderImg == null) {
            this.placeHolderImg = new Kinetic.Image();
            if (this.group != null) {
                this.group.add(this.placeHolderImg);
            }
        }
        this.placeHolderImg.setImage(img);
        this.placeHolderImg.moveToBottom();
        this.hoverBorder.moveToBottom();
        if (cropSqr != null) {
            this.placeHolderImg.setCrop(cropSqr);
        }
        if (w != null) {
            this.setPlaceHolderWidth(w);
        }
        if (h != null) {
            this.setPlaceHolderHeight(h);
        }
    };

    TableauPile.prototype.canAddCard = function (card) {
        var length = this.getSize();
        if (length === 0) { //if no cards, always allowed
            return true;
        }
        var lastCard = this.cards[length - 1]; //check last card
        //needs to be face up and of a type greater by 1
        return lastCard.isFaceUp() === true && lastCard.getType() === card.getType() + 1;
    };

    TableauPile.prototype.canRemoveCard = function (card) {
        var length = this.getSize();
        var cardT;
        //basic conditions first
        if (card.isFaceUp() !== true) {
            return false;
        }
        var i = this.cards.indexOf(card);
        i++; //so we can start scanning cards after it
        while (i < length) {
            cardT = this.cards[i];
            if (cardT.getSuit() !== card.getSuit() || cardT.getType() !== this.cards[i - 1].getType() - 1) {
                return false;
            }
            i++;
        }
        return true;
    };

    TableauPile.prototype.getFirstCardThatCanRemove = function () {
        var length = this.getSize();
        var card = null;
        var cardT;
        var i = length - 1;
        while (length >= 0) {
            cardT = this.cards[i];
            //has to be face up
            if (cardT.isFaceUp() !== true) {
                break;
            }
            //if not last card and has same suit and type is one more than last one, can remove
            if (i < length - 1 && (cardT.getSuit() !== card.getSuit() || cardT.getType() !== card.getType() + 1)) {
                break;
            } //else
            card = cardT;
            i--;
        }
        return card;
    };

    TableauPile.prototype.arrangeCards = function (settings, callback, fromIndex) {
        if (settings == null) {
            settings = {};
        }
        if (fromIndex == null || fromIndex < 0) {
            fromIndex = 0;
        }

        var cards = this.cards;
        var length = cards.length;

        //count all face up cards (for padding amount)
        var faceUpCount = 0;
        var faceDownCount = 0;
        for (var i = 0; i < length; i++) {
            if (cards[i].isFaceUp() === true) {
                faceUpCount++;
            } else {
                faceDownCount++;
            }
        }

        //calculate padding
        var padTopFaceDown = 7;
        if (this.availHeight - (padTopFaceDown * faceDownCount) < 2) {
            padTopFaceDown = 2;
        }
        var faceDownTotalPad = faceDownCount * padTopFaceDown;

        var maxPadTopFaceUp = 20;
        var padTopFaceUp = (this.availHeight - PlayingCard.CARD_DIM.h - faceDownTotalPad) / faceUpCount;
        if (faceUpCount > 12) {
            padTopFaceUp /= 1.5;
        }
        if (padTopFaceUp < 14) {
            padTopFaceUp = 14;
        }
        if (padTopFaceUp > maxPadTopFaceUp) {
            padTopFaceUp = maxPadTopFaceUp;
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var y = 0;
        var prevCard;
        //distribute height
        for (i = 0; i < length; i++) {
            expectedCallbacks++;
            if (i === length - 1) {
                stillLooping = false;
            }
            if (i > 0) {
                prevCard = this.cards[i - 1];
                if (prevCard.isFaceUp() === true) {
                    y += padTopFaceUp;
                    if (prevCard.isSelected() === true) {
                        y += padTopFaceUp;
                    }
                } else {
                    y += padTopFaceDown;
                }
            }
            if (i >= fromIndex) {
                this.cards[i].setPosition(0, y, settings, onCallback);
            } else {
                expectedCallbacks--;
            }
        }
        var height = y + PlayingCard.CARD_DIM.h;

        this.group.setHeight(height);
    };

    TableauPile.prototype.resetCardFaces = function (settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var card;
        var length = this.getSize();
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            expectedCallbacks++;
            if (i === length - 1) { //if last card
                stillLooping = false;
                card.setFaceUp(true, settings, onCallback);
            } else { //otherwise
                card.setFaceUp(false, settings, onCallback);
            }
        }
    };

    TableauPile.prototype.resetListening = function () {
        this.cards.forEach(function (card) {
            card.setListening(card.isFaceUp());
        });
        var length = this.getSize();
        if (length > 0) {
            this.cards[length - 1].setListening(true);
        }

        if (this.placeHolderImg != null) {
            this.placeHolderImg.setListening(length === 0);
        }
    };

    TableauPile.prototype.resetDraggable = function () {
        var self = this;
        this.cards.forEach(function (card) {
            card.setDraggable(self.canRemoveCard(card));
        });
    };

    return TableauPile;
})(fSpider.TableauPile || {});

fSpider.StockPile = (function (StockPile, undefined) {
    'use strict';

    var Pile = fSpider.Pile;
    var PlayingCard = fSpider.PlayingCard;
    var Utils = fSpider.Utils;

    //constructor
    StockPile = function (cards) {
        this.cards = cards || [];
        this.group = new Kinetic.Group();
        this.setHeight(PlayingCard.CARD_DIM.h);
    };

    Utils.extendObj(StockPile, Pile);

    //getters/setters

    //public methods
    StockPile.prototype.arrangeCards = function (settings, callback, fromIndex) {
        if (settings == null) {
            settings = {};
        }

        if (fromIndex == null) {
            fromIndex = 0;
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var tableauPiles = 10;
        var length = this.getSize();
        var card;

        var nSets = Math.floor(length / tableauPiles);
        if (nSets == 0) {
            nSets = .00000001;
        }
        var paddingRight = (this.availWidth - PlayingCard.CARD_DIM.w) / nSets;
        if (paddingRight < 0) {
            paddingRight = 0;
        }

        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            expectedCallbacks++;
            if (i === length - 1) {
                stillLooping = false;
            }
            card.setPosition(Math.floor((length - i - 1) / tableauPiles) * paddingRight, 0, settings, onCallback);
        }

        this.setWidth(paddingRight * nSets + PlayingCard.CARD_DIM.w);
    };

    StockPile.prototype.resetCardFaces = function (settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var self = this;
        this.cards.forEach(function (card, i) {
            expectedCallbacks++;
            if (i === self.cards.length - 1) {
                stillLooping = false;
            }
            card.setFaceUp(false, settings, onCallback);
        });
    };

    StockPile.prototype.resetListening = function () {
        this.cards.forEach(function (card) {
            card.setListening(false);
        });
        var length = this.getSize();
        if (length > 0) {
            this.cards[length - 1].setListening(true);
        }
    };

    StockPile.prototype.resetDraggable = function () {
        this.cards.forEach(function (card) {
            card.setDraggable(false);
        });
    };

    StockPile.prototype.drawCards = function (piles, setFaceUp, settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0) {
                var uniquePiles = [];
                piles.forEach(function (pile) {
                    if (uniquePiles.indexOf(pile) < 0) {
                        pile.resetListening();
                        pile.resetDraggable();
                        uniquePiles.push(pile);
                    }
                });
                if (callback != null) {
                    callback();
                }
            }
        };

        var delay = 0;
        if (settings.animate === true) {
            delay = settings.animDelay;
        }

        var pLength = piles.length;
        var pile, card;
        for (var i = 0; i < pLength; i++) {
            if (this.getSize() <= 0) {
                break;
            }
            pile = piles[i];
            card = this.getLastCard();
            if (setFaceUp === true) {
                expectedCallbacks++;
                card.setFaceUp(true, settings.extendAnimDelay(delay * i), onCallback);
            }
            expectedCallbacks++;
            if (i === pLength - 1) {
                stillLooping = false;
            }
            pile.transferCards([card], settings.extendAnimDelay(delay * i), onCallback);
        }
    };

    return StockPile;
})(fSpider.StockPile || {});

fSpider.FoundationPile = (function (FoundationPile, undefined) {
    'use strict';

    var Pile = fSpider.Pile;
    var PlayingCard = fSpider.PlayingCard;
    var Utils = fSpider.Utils;

    //constructor
    FoundationPile = function (cards) {
        this.cards = cards || [];
        this.group = new Kinetic.Group();
        this.setWidth(PlayingCard.CARD_DIM.w);
        this.setHeight(PlayingCard.CARD_DIM.h);
    };

    Utils.extendObj(FoundationPile, Pile);

    //getters/setters

    //public methods
    FoundationPile.prototype.arrangeCards = function (settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var self = this;
        this.cards.forEach(function (card, i) {
            expectedCallbacks++;
            if (i === self.cards.length - 1) {
                stillLooping = false;
            }
            card.setPosition(0, 0, settings, onCallback);
        });
    };

    FoundationPile.prototype.resetCardFaces = function (settings, callback) {
        if (settings == null) {
            settings = {};
        }

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        var self = this;
        this.cards.forEach(function (card, i) {
            expectedCallbacks++;
            if (i === self.cards.length - 1) {
                stillLooping = false;
            }
            card.setFaceUp(true, settings, onCallback);
        });
    };

    FoundationPile.prototype.resetListening = function () {
        this.cards.forEach(function (card) {
            card.setListening(false);
        });
    };

    FoundationPile.prototype.resetDraggable = function () {
        this.cards.forEach(function (card) {
            card.setDraggable(false);
        });
    };

    return FoundationPile;
})(fSpider.FoundationPile || {});