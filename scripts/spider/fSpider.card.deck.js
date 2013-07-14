var fSpider = fSpider || {};

fSpider.Deck = (function (Deck, undefined) {
    'use strict';

    //constructor
    Deck = function () {
    };

    //fields
    Deck.prototype.cards = [];

    //getters/setters
    Deck.prototype.getCards = function () {
        return this.cards;
    };
    Deck.prototype.setCards = function (cards) {
        this.cards = cards;
    };

    //methods
    Deck.prototype.shuffle = function () {
        var newIndex, temp;

        var length = this.getSize();
        for (var i = 0; i < length; i++) {
            newIndex = Math.round(Math.random() * (length - 1));

            temp = this.getCardAt(newIndex);
            this.setCardAt(newIndex, this.cards[i]);
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
        return (this.cards || []).length;
    };

    return Deck;
})(fSpider.Deck || {});