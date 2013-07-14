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
    Pile.prototype.cards = [];
    Pile.prototype.group = null;

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

    Pile.prototype.getWidth = function (scale) {
        if (scale == null) {
            scale = this.group.getScaleX();
        }
        return this.group.getHeight() * scale;
    };

    Pile.prototype.setY = function (y) {
        this.group.setY(y);
    };
    Pile.prototype.getY = function () {
        return this.group.getY();
    };

    Pile.prototype.getHeight = function (scale) {
        if (scale == null) {
            scale = this.group.getScaleY();
        }
        return this.group.getHeight() * scale;
    };

    Pile.prototype.setVisible = function (visible) {
        this.group.setVisible(visible);
    };

    //public functions
    Pile.prototype.moveToTop = function () {
        this.group.moveToTop();
    };

    Pile.prototype.transferCards = function (cards, animate) {
        var self = this;
        var piles = [];
        cards.forEach(function (card) {
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
    };

    Pile.prototype.addCard = function (card, absPos) {
        card.setPile(this);
        this.cards.push(card);
        this.group.add(card.getGroup());
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

    Pile.prototype.arrangeCards = function (w, h, animTime, delay) {
        //specific to pile type
    };

    Pile.prototype.resetCardFaces = function () {
        //specific to pile type
    };

    Pile.prototype.resetListening = function () {
        //specific to pile type
    };

    Pile.prototype.resetDraggable = function () {
        //specific to pile type
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
        this.placeHolderImg = new Kinetic.Image();

        this.hoverBorder = new Kinetic.Rect({
            visible: false,
            opacity: TableauPile.HOVER_BORDER.opacity,
            fill: TableauPile.HOVER_BORDER.fill,
            stroke: TableauPile.HOVER_BORDER.stroke,
            strokeWidth: TableauPile.HOVER_BORDER.strokeWidth,
            cornerRadius: TableauPile.HOVER_BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.group.add(this.hoverBorder);
        this.group.add(this.placeHolderImg);
    };

    Utils.extendObj(TableauPile, Pile);

    //fields
    TableauPile.prototype.hovering = false;
    TableauPile.prototype.hoverBorder = null;

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
        this.hoverBorder.setVisible(this.hovering === true && TableauPile.HOVER_BORDER.visible);
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

    TableauPile.prototype.setLastCardFaceUp = function (faceUp) {
        var changed = false;

        var length = this.getSize();
        if (length > 0) {
            var card = this.cards[length - 1];
            changed = card.isFaceUp() !== faceUp;
            card.setFaceUp(faceUp);
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

    TableauPile.prototype.arrangeCards = function (w, h, animTime, delay) {
        var card;
        var length = this.getSize();

        //count all face up cards (for padding amount)
        var faceUpCount = 0;
        var faceDownCount = length - faceUpCount;
        var padTopFaceDown = 7;
        if (h - (padTopFaceDown * faceDownCount) < 0) {
            padTopFaceDown = 0;
        }
        var faceDownTotalPad = faceDownCount * padTopFaceDown;

        //find amount of padding to add to face up cards
        var maxPadTopFaceUp = 20;
        var padTopFaceUp = (h - PlayingCard.CARD_DIM.h - faceDownTotalPad) / faceUpCount;
        if (faceUpCount > 12) {
            padTopFaceUp /= 1.5;
        }
        if (padTopFaceUp < 0) {
            padTopFaceUp = 0;
        }
        if (padTopFaceUp > maxPadTopFaceUp) {
            padTopFaceUp = maxPadTopFaceUp;
        }

        var y = 0;
        //distribute height
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            card.setX(0, animTime, delay);
            if (i > 0) {
                var prevCard = this.cards[i - 1];
                if (prevCard.isFaceUp() === true) {
                    y += padTopFaceUp;
                    if (prevCard.isSelected() === true) {
                        y += padTopFaceUp;
                    }
                } else {
                    y += padTopFaceDown;
                }
            }
            card.setY(y, animTime, delay);
        }
        var actualHeight = y + PlayingCard.CARD_DIM.h;

        this.group.setWidth(w);
        this.group.setHeight(actualHeight);
    };

    TableauPile.prototype.resetCardFaces = function () {
        var card;
        var length = this.getSize();
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            if (i === length - 1) { //if last card
                card.setFaceUp(true);
            } else { //otherwise
                card.setFaceUp(false);
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

    TableauPile.HOVER_BORDER = {
        'visible': true,
        'stroke': '#FFFF99',
        'strokeWidth': 5,
        'cornerRadius': 4,
        'fill': '#FFFF99',
        'opacity': 0.25
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
    };

    Utils.extendObj(StockPile, Pile);

    //getters/setters

    //public methods
    StockPile.prototype.arrangeCards = function (w, h, animTime, delay) {
        var tableauPiles = 10;
        var card;

        var paddingRight = w - PlayingCard.CARD_DIM.w;
        if (paddingRight < 0) {
            paddingRight = 0;
        }

        var length = this.getSize();
        for (var i = 0; i < length; i++) {
            card = this.cards[i];
            card.setX(Math.floor(i / tableauPiles) * paddingRight, animTime, delay);
            card.setY(0, animTime, delay);
        }
    };

    StockPile.prototype.resetCardFaces = function () {
        this.cards.forEach(function (card) {
            card.setFaceUp(false);
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

    return StockPile;
})(fSpider.StockPile || {});

fSpider.FoundationPile = (function (FoundationPile, undefined) {
    'use strict';

    var Pile = fSpider.Pile;
    var Utils = fSpider.Utils;

    //constructor
    FoundationPile = function (cards) {
        this.cards = cards || [];
        this.group = new Kinetic.Group();
    };

    Utils.extendObj(FoundationPile, Pile);

    //getters/setters

    //public methods
    FoundationPile.prototype.arrangeCards = function (w, h, animTime, delay) {
        this.cards.forEach(function (card) {
            card.setX(0, animTime, delay);
            card.setY(0, animTime, delay);
        });
    };

    FoundationPile.prototype.resetCardFaces = function () {
        this.cards.forEach(function (card) {
            card.setFaceUp(true);
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