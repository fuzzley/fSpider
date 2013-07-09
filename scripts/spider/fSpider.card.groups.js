var fSpider = fSpider || {};

////dependencies\\\\
//fSpider
fSpider.Card = fSpider.Card || {};
fSpider.PlayingCard = fSpider.PlayingCard || {};
fSpider.Utils = fSpider.Utils || {};

fSpider.Pile = (function (Pile, undefined) {
    'use strict';

    Pile = function () {};

    //public fields
    Pile.prototype.cards = [];
    Pile.prototype.group = undefined;

    //getters/setters
    Pile.prototype.getCards = function () {
        return this.cards;
    };

    Pile.prototype.getCardAt = function (index) {
        return this.getCards()[index];
    };

    Pile.prototype.getSize = function () {
        return (this.getCards() || []).length;
    };

    Pile.prototype.getGroup = function () {
        return this.group;
    };

    Pile.prototype.setX = function (x) {
        this.getGroup().setX(x);
    };
    Pile.prototype.getX = function () {
        return this.getGroup().getX();
    };

    Pile.prototype.getWidth = function () {
        return this.group.getWidth() * this.getGroup().getScaleX();
    };

    Pile.prototype.setY = function (y) {
        this.getGroup().setY(y);
    };
    Pile.prototype.getY = function () {
        return this.getGroup().getY();
    };

    Pile.prototype.getHeight = function () {
        return this.group.getHeight() * this.getGroup().getScaleY();
    };

    //public functions
    Pile.prototype.transferCards = function (cards) {
        var self = this;
        cards.forEach(function (card) {
            var absPos = { x: card.getGroup().getAbsolutePosition().x, y: card.getGroup().getAbsolutePosition().y };
            var pile = card.getPile();
            if (pile != null) {
                pile.removeCard(card);
                pile.resetListening();
                pile.resetDraggable();
            }
            self.addCard(card, absPos);
        });
    };

    Pile.prototype.addCard = function (card, absPos) {
        card.setPile(this);
        this.cards.push(card);
        this.getGroup().add(card.getGroup());
        if (absPos != null) {
            card.getGroup().setAbsolutePosition(absPos);
        }
    };

    Pile.prototype.addCards = function (cards) {
        var self = this;
        cards.forEach(function (card) {
            self.addCard(card);
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

        var index = this.cards.indexOf(card);
        if (index >= 0) {
            for (var i = index; i < this.cards.length; i++) {
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
        this.hovering = false;

        this._hoverBorder = new Kinetic.Rect({
            visible: false,
            opacity: TableauPile.HOVER_BORDER.opacity,
            fill: TableauPile.HOVER_BORDER.fill,
            stroke: TableauPile.HOVER_BORDER.stroke,
            strokeWidth: TableauPile.HOVER_BORDER.strokeWidth,
            cornerRadius: TableauPile.HOVER_BORDER.cornerRadius,
            width: PlayingCard.CARD_DIM.w,
            height: PlayingCard.CARD_DIM.h
        });
        this.group.add(this._hoverBorder);
    };

    Utils.extendObj(TableauPile, Pile);

    TableauPile.prototype.getHoverBorder = function () {
        return this._hoverBorder;
    };

    TableauPile.prototype.setPlaceHolderImg = function (placeHolderImg) {
        this._placeHolderImg = placeHolderImg;
    };
    TableauPile.prototype.getPlaceHolderImg = function () {
        return this._placeHolderImg;
    };

    TableauPile.prototype.setPlaceHolderKineticImg = function (placeHolderKineticImg) {
        this._placeHolderKineticImg = placeHolderKineticImg;
    };
    TableauPile.prototype.getPlaceHolderKineticImg = function () {
        return this._placeHolderKineticImg;
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

    //public methods
    TableauPile.prototype.refresh = function () {
        //hover border
        this.getHoverBorder().setVisible(this.isHovering() === true && TableauPile.HOVER_BORDER.visible);
    };

    TableauPile.prototype.getCompleteSequence = function () {
        var nCardsInCompleteSequence = 13;

        var sequence = [];
        var size = this.getSize();

        //basic check first, in case we don't have to iterate through all cards
        if (size < nCardsInCompleteSequence || this.getCardAt(size - nCardsInCompleteSequence).isFaceUp() !== true) { //don't have enough faceup cards
            return sequence;
        }

        //otherwise we try find the sequence from top to bottom
        for (var i = 0; i < size; i++) {
            var card = this.getCardAt(i);
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

        var length = this.getCards().length;
        if (length > 0) {
            changed = this.getCards()[length - 1].isFaceUp() !== faceUp;
            this.getCards()[length - 1].setFaceUp(faceUp);
        }

        return changed;
    };

    TableauPile.prototype.loadPlaceHolderImg = function (img) {
        this.setPlaceHolderImg(img);
        this.setPlaceHolderKineticImg(Utils.loadKineticImage(this.getPlaceHolderImg(), PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h));
        this.getGroup().add(this.getPlaceHolderKineticImg());
    };

    TableauPile.prototype.canAddCard = function (card) {
        var cards = this.getCards();
        if (cards.length === 0) { //if no cards, always allowed
            return true;
        }
        var lastCard = cards[cards.length - 1]; //check last card
        //needs to be face up and of a type greater by 1
        return lastCard.isFaceUp() === true && lastCard.getType() === card.getType() + 1;
    };

    TableauPile.prototype.canRemoveCard = function (card) {
        var cards = this.getCards();
        //basic conditions first
        if (card.isFaceUp() !== true) {
            return false;
        }
        var index = cards.indexOf(card);
        index++; //so we can start scanning cards after it
        while (index < cards.length) {
            if (cards[index].getSuit() !== card.getSuit() || cards[index].getType() !== cards[index - 1].getType() - 1) {
                return false;
            }
            index++;
        }
        return true;
    };

    TableauPile.prototype.arrangeCards = function (w, h, animTime, delay) {
        var i;

        var cards = this.getCards();

        //count all face up cards (for padding amount)
        var faceUpCount = 0;
        for (i = 0; i < cards.length; i++) {
            if (cards[i].isFaceUp() === true) {
                faceUpCount++;
            }
        }
        var faceDownCount = cards.length - faceUpCount;
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
        for (i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.setX(0, animTime, delay);
            if (i > 0) {
                var prevCard = cards[i - 1];
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
        var cards = this.getCards();
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            if (i === cards.length - 1) { //if last card
                card.setFaceUp(true);
            } else { //otherwise
                card.setFaceUp(false);
            }
        }
    };

    TableauPile.prototype.resetListening = function () {
        var cards = this.getCards();
        cards.forEach(function (card) {
            card.setListening(card.isFaceUp());
        });
        if (cards.length > 0) {
            cards[cards.length - 1].setListening(true);
        }

        var phImage = this.getPlaceHolderKineticImg();
        if (phImage !== undefined) {
            phImage.setListening(cards.length === 0);
        }
    };

    TableauPile.prototype.resetDraggable = function () {
        var self = this;
        this.getCards().forEach(function (card) {
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

        var cards = this.getCards();

        var paddingRight = w - PlayingCard.CARD_DIM.w;
        if (paddingRight < 0) {
            paddingRight = 0;
        }

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.setX(Math.floor(i / tableauPiles) * paddingRight, animTime, delay);
            card.setY(0, animTime, delay);
        }
    };

    StockPile.prototype.resetCardFaces = function () {
        this.getCards().forEach(function (card) {
            card.setFaceUp(false);
        });
    };

    StockPile.prototype.resetListening = function () {
        var cards = this.getCards();
        cards.forEach(function (card) {
            card.setListening(false);
        });
        if (cards.length > 0) {
            cards[cards.length - 1].setListening(true);
        }
    };

    StockPile.prototype.resetDraggable = function () {
        var cards = this.getCards();
        cards.forEach(function (card) {
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
        this.getCards().forEach(function (card) {
            card.setX(0, animTime, delay);
            card.setY(0, animTime, delay);
        });
    };

    FoundationPile.prototype.resetCardFaces = function () {
        this.getCards().forEach(function (card) {
            card.setFaceUp(true);
        });
    };

    FoundationPile.prototype.resetListening = function () {
        this.getCards().forEach(function (card) {
            card.setListening(false);
        });
    };

    FoundationPile.prototype.resetDraggable = function () {
        this.getCards().forEach(function (card) {
            card.setDraggable(false);
        });
    };

    return FoundationPile;
})(fSpider.FoundationPile || {});