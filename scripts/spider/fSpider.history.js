var fSpider = fSpider || {};

fSpider.ActionSet = (function (ActionSet, undefined) {
    'use strict';

    //constructor
    ActionSet = function () {
        this.actions = [];
    };

    //fields
    ActionSet.prototype.actions = null;

    //public functions
    ActionSet.prototype.addAction = function (action) {
        this.actions.push(action);
    };

    ActionSet.prototype.addActions = function (actions) {
        var self = this;

        actions.forEach(function (action) {
            self.addAction(action);
        });
    };

    ActionSet.prototype.undo = function () {
        var revActions = this.actions.reverse();
        revActions.forEach(function (action) {
            if (action.undo != null) {
                action.undo();
            }
        });
    };

    ActionSet.prototype.redo = function () {
        var revActions = this.actions.reverse();
        revActions.forEach(function (action) {
            if (action.redo != null) {
                action.redo();
            }
        });
    };

    ActionSet.prototype.findFirstTransferCardsAction = function () {
        var length = this.actions.length;
        for (var i = 0; i < length; i++) {
            if (this.actions[i].actionType === "TransferCardsAction") {
                return this.actions[i];
            }
        }
        return null;
    };

    ActionSet.prototype.getSize = function () {
        return (this.actions || []).length;
    };

    //static functions
    ActionSet.mergeActionSets = function (actionSets) {
        var merged = new ActionSet();
        if (actionSets != null) {
            actionSets.forEach(function (actionSet) {
                merged.addActions(actionSet.actions.slice(0));
            });
        }
        return merged;
    };

    return ActionSet;
})(fSpider.ActionSet || {});

fSpider.History = (function (History, undefined) {
    'use strict';

    var ActionSet = fSpider.ActionSet;

    //constructor
    History = function () {
        this.actionSets = [];
    };

    //fields
    History.prototype.actionSets = null;
    History.prototype.cursor = 0;
    History.prototype._onHistoryChangedCallback = null;

    //public functions
    History.prototype.canUndo = function () {
        return this.cursor > 0;
    };

    History.prototype.undo = function () {
        var actionSet;
        if (this.canUndo() === true) {
            this.cursor--;
            actionSet = this.actionSets[this.cursor];
            actionSet.undo();
            this._fireOnHistoryChanged();
        }
        return actionSet;
    };

    History.prototype.canRedo = function () {
        return this.cursor < this.actionSets.length;
    };

    History.prototype.redo = function () {
        var actionSet;
        if (this.canRedo() === true) {
            actionSet = this.actionSets[this.cursor];
            actionSet.redo();
            this.cursor++;
            this._fireOnHistoryChanged();
        }
        return actionSet;
    };

    History.prototype.registerAction = function (action) {
        this.registerActionSet(new ActionSet(action));
    };

    History.prototype.registerActionSet = function (actionSet) {
        if (this.cursor < this.actionSets.length) {
            //cut off everything after cursor
            this.actionSets = this.actionSets.splice(0, this.cursor);
        }
        this.actionSets.push(actionSet);
        this.cursor++;
        this._fireOnHistoryChanged();
    };

    History.prototype.mergeActionSets = function (start, amount) {
        var length = this.actionSets.length;
        if (start < 0 || start > length - 2) {
            return;
        }
        if (amount == null) {
            amount = length - start;
        }
        if (start + amount < 0 || start + amount > length) {
            return;
        }
        var newActionSet = ActionSet.mergeActionSets(this.actionSets.slice(start, start + amount));
        this.actionSets.splice(start, amount, newActionSet);
        if (this.cursor > start) {
            this.cursor -= amount;
            this.cursor++;
        }
    };

    History.prototype.clear = function () {
        this.actionSets = [];
        this.cursor = 0;
        this._fireOnHistoryChanged();
    };

    History.prototype.onHistoryChanged = function (callback) {
        this._onHistoryChangedCallback = callback;
    };

    History.prototype._fireOnHistoryChanged = function () {
        if (this._onHistoryChangedCallback != null) {
            this._onHistoryChangedCallback(this);
        }
    };

    return History;
})(fSpider.History || {});

fSpider.TransferCardsAction = (function (TransferCardsAction, undefined) {
    'use strict';

    //constructor
    TransferCardsAction = function (fromPile, toPile, cards, animTime, delay) {
        this.fromPile = fromPile;
        this.toPile = toPile;
        this.cards = cards;
        this.animTime = animTime;
        this.delay = delay;
    };

    //fields
    TransferCardsAction.prototype.fromPile = null;
    TransferCardsAction.prototype.toPile = null;
    TransferCardsAction.prototype.cards = null;
    TransferCardsAction.prototype.animTime = 0;
    TransferCardsAction.prototype.delay = 0;
    TransferCardsAction.prototype.actionType = "TransferCardsAction";

    //public functions
    TransferCardsAction.prototype.undo = function () {
        this.fromPile.transferCards(this.cards);
        this._refreshPiles();
    };

    TransferCardsAction.prototype.redo = function () {
        this.toPile.transferCards(this.cards);
        this._refreshPiles();
    };

    TransferCardsAction.prototype._refreshPiles = function () {
        this.fromPile.resetListening();
        this.fromPile.resetDraggable();
        this.toPile.resetListening();
        this.toPile.resetDraggable();
    };

    return TransferCardsAction;
})(fSpider.TransferCardsAction || {});

fSpider.FlipCardAction = (function (FlipCardAction, undefined) {
    'use strict';

    //constructor
    FlipCardAction = function (card, isFaceUp) {
        this.card = card;
        this.isFaceUp = isFaceUp;
    };

    //fields
    FlipCardAction.prototype.card = null;
    FlipCardAction.prototype.isFaceUp = false;
    FlipCardAction.prototype.actionType = "FlipCardAction";

    //public functions
    FlipCardAction.prototype.undo = function () {
        this.card.setFaceUp(this.isFaceUp !== true);
    };

    FlipCardAction.prototype.redo = function () {
        this.card.setFaceUp(this.isFaceUp === true);
    };

    return FlipCardAction;
})(fSpider.FlipCardAction || {});

fSpider.ScoreChangeAction = (function (ScoreChangeAction, undefined) {
    'use strict';

    //constructor
    ScoreChangeAction = function (board, amount) {
        this.board = board;
        this.amount = amount;
    };

    //fields
    ScoreChangeAction.prototype.board = null;
    ScoreChangeAction.prototype.amount = 0;
    ScoreChangeAction.prototype.actionType = "ScoreChangeAction";

    //public functions
    ScoreChangeAction.prototype.undo = function () {
        this.board.setScore(this.board.score - this.amount);
    };

    ScoreChangeAction.prototype.redo = function () {
        this.board.setScore(this.board.score + this.amount);
    };

    return ScoreChangeAction;
})(fSpider.ScoreChangeAction || {});