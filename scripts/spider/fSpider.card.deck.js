var fSpider = fSpider || {};

fSpider.Deck = (function (Deck, undefined) {
    'use strict';

    //constructor
    Deck = function () {
        this.cards = [];
    };

    //getters/setters
    Deck.prototype.getCards = function () {
        return this.cards;
    };
    Deck.prototype.setCards = function (cards) {
        this.cards = cards;
    };

    //methods
    Deck.prototype.shuffle = function () {
        var length = this.getSize();
        for (var i = 0; i < length; i++) {
            var newIndex = Math.round(Math.random() * (length - 1));

            var temp = this.getCardAt(newIndex);
            this.setCardAt(newIndex, this.getCardAt(i));
            this.setCardAt(i, temp);
        }
    };

    Deck.prototype.getCardAt = function (index) {
        return this.cards[index];
    };

    Deck.prototype.setCardAt = function (index, card) {
        this.cards[index] = card;
    };

    Deck.prototype.getSize = function () {
        return (this.getCards() || []).length;
    };

    return Deck;
})(fSpider.Deck || {});