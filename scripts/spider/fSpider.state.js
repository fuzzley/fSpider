var fSpider = fSpider || {};

fSpider.SpiderState = (function (SpiderState, undefined) {
    'use strict';

    //constructor
    SpiderState = function (board) {
        this.board = board;
    };

    //fields
    SpiderState.prototype.board = null;
    SpiderState.prototype.hintCursor = {
        card: null,
        toPile: null
    };

    //functions
    SpiderState.prototype.boardStateChanged = function () {
        this.hintCursor.card = null;
        this.hintCursor.toPile = null;
    };

    SpiderState.prototype.nextHint = function () {
        var hint = {
            card: this.hintCursor.card,
            toPile: this.hintCursor.toPile
        };

        var tPile = this.hintCursor.toPile;
        if (this.hintCursor.card != null) {
            tPile = this.findNextPileThatCanBeMovedTo(this.hintCursor.card, tPile);
        }

        this.moveHintCursorForward();

        return hint;
    };

    SpiderState.prototype.moveHintCursorForward = function () {
        this.hintCursor.card = this.findNextCardThatCanBeMoved(this.hintCursor.card);
    };

    SpiderState.prototype.findNextCardThatCanBeMoved = function (previousCard) {
        if (this.board.tableauPiles == null || this.board.tableauPiles.length <= 0) {
            return null;
        }

        var tPile = null;
        //if cursor was reset, check first pile
        var card = null;
        if (previousCard == null) {
            tPile = this.board.tableauPiles[0];
            card = tPile.getFirstCardThatCanRemove();
            if (card != null) {  //if something found in first pile, just exit
                return card;
            }
        } else { //otherwise find the current pile
            tPile = this.board.tableauPiles.indexOf(previousCard.getPile());
        }
        var oIndex = this.board.tableauPiles.indexOf(tPile) + 1;
        var rIndex;
        //look for candidate in each pile
        for (var i = oIndex; i < oIndex + this.board.tableauPiles.length; i++) {
            rIndex = i % this.board.tableauPiles.length;
            card = this.board.tableauPiles[rIndex].getFirstCardThatCanRemove();
            if (card != null) {
                break;
            }
        }

        return card;
    };

    SpiderState.prototype.findNextPileThatCanBeMovedTo = function (cardToMove, previousPile) {
        if (previousPile == null) {
            previousPile = cardToMove.getPile();
        }

        var tPile = previousPile;
        var oIndex = this.board.tableauPiles.indexOf(tPile) + 1;
        var rIndex;
        //look for candidate in each pile
        for (var i = oIndex; i < oIndex + this.board.tableauPiles.length; i++) {
            rIndex = i % this.board.tableauPiles.length;
            tPile = this.board.tableauPiles[rIndex];
            if (tPile.canAddCard(cardToMove) === true) {
                return tPile;
            }
        }
        return null;
    };


    return SpiderState;
})(fSpider.SpiderState || {});