var fSpider = fSpider || {};

fSpider.Debug = (function (Debug, undefined) {
    'use strict';

    //constructor
    Debug = function (board) {
        this.board = board;
    };

    //fields
    Debug.prototype.board = null;

    //functions
    Debug.prototype.prepareDrawCompleteSequenceTest = function () {
        Debug.prepareDrawCompleteSequenceTest.call(this.board);
    };

    Debug.prepareDrawCompleteSequenceTest = function (b) {
        b.tableauPiles.forEach(function (tPile) {
            b.stockPile.transferCards(tPile.cards);
        });
        var cards = [];
        for (var i = fSpider.PlayingCard.CARD_TYPES.king; i >= fSpider.PlayingCard.CARD_TYPES.ace; i--)
        {
            for (var j = 0; j < b.deck.getSize(); j++)
            {
                if (b.deck.cards[j].getType() === i) {
                    cards.push(b.deck.cards[j]);
                    b.deck.cards[j].setFaceUp(true);
                    break;
                }
            }
        }
        b.tableauPiles[0].transferCards(cards.slice(0, 12));
        b.tableauPiles[0].arrangeCards(fSpider.board.settings.extendAnimate(false));
        b.tableauPiles[0].resetListening();
        b.tableauPiles[0].resetDraggable();
        b.stockPile.cards.splice(b.stockPile.cards.indexOf(cards[12]), 1);
        b.stockPile.cards.push(cards[12]);
        b.stockPile.resetCardFaces();
        b.stockPile.resetListening();
        b.stockPile.resetDraggable();
        b.stockPile.arrangeCards();
        b.stockPile.moveAllCardsToGroup();
        b.tableauPiles.forEach(function (tPile, index) {
            if (index != 0) {
                tPile.transferCards([b.stockPile.cards[0]]);
                tPile.resetCardFaces();
                tPile.resetListening();
                tPile.resetDraggable();
            }
        });
        b.redraw();
    };

    return Debug;
})(fSpider.Debug || {});