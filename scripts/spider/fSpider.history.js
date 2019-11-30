var fSpider = fSpider || {};

fSpider.ActionSet = (function (ActionSet, undefined) {
    'use strict';

    //constructor
    ActionSet = function (actions) {
        this.actions = actions || [];
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

    ActionSet.prototype.undo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        var revActions = this.actions.reverse();
        revActions.forEach(function (action) {
            if (action.undo != null) {
                action.undo(settings);
            }
        });
    };

    ActionSet.prototype.redo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        var revActions = this.actions.reverse();
        revActions.forEach(function (action) {
            if (action.redo != null) {
                action.redo(settings);
            }
        });
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

fSpider.History = (function (History, ko, undefined) {
    'use strict';

    var ActionSet = fSpider.ActionSet;

    //constructor
    History = function () {
        this.actionSets = [];

        this.vm = new History.VM();
        Object.defineProperty(this, 'cursor', {
            get: function () {
                return this.vm.cursor();
            },
            set: function (value) {
                this.vm.cursor(value);
            }
        });
    };

    //view model
    History.VM = function () {
        this.build();
        this.reset();
    };

    History.VM.prototype.build = function () {
        this.actionSets = ko.observable();
        this.cursor = ko.observable();
        this.canUndo = ko.computed(function () {
            return this.cursor() > 0;
        }, this);
        this.canRedo = ko.computed(function () {
            return this.cursor() < this.actionSets();
        }, this);
    };

    History.VM.prototype.reset = function () {
        this.actionSets(0);
        this.cursor(0);
    };

    History.VM.prototype.bind = function (element) {
        ko.applyBindings(this, element);
    };

    //fields
    History.prototype.actionSets = null;

    //public functions
    History.prototype.canUndo = function () {
        return this.vm.canUndo();
    };

    History.prototype.undo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        var actionSet;
        if (this.canUndo() === true) {
            this.cursor--;
            actionSet = this.actionSets[this.cursor];
            actionSet.undo(settings);
        }
        return actionSet;
    };

    History.prototype.canRedo = function () {
        return this.vm.canRedo();
    };

    History.prototype.redo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        var actionSet;
        if (this.canRedo() === true) {
            actionSet = this.actionSets[this.cursor];
            actionSet.redo(settings);
            this.cursor++;
        }
        return actionSet;
    };

    History.prototype.registerAction = function (action) {
        this.registerActionSet(new ActionSet([action]));
    };

    History.prototype.registerActionSet = function (actionSet) {
        if (this.cursor < this.actionSets.length) {
            //cut off everything after cursor
            this.actionSets = this.actionSets.splice(0, this.cursor);
        }
        this.actionSets.push(actionSet);
        this.vm.actionSets(this.actionSets.length);
        this.cursor++;
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
        this.vm.actionSets(this.actionSets.length);
        if (this.cursor > start) {
            this.cursor -= amount;
            this.cursor++;
        }
    };

    History.prototype.clear = function () {
        this.actionSets = [];
        this.vm.actionSets(this.actionSets.length);
        this.cursor = 0;
    };

    return History;
})(fSpider.History || {}, window.ko);

fSpider.TransferCardsAction = (function (TransferCardsAction, undefined) {
    'use strict';

    //constructor
    TransferCardsAction = function (cards, fromPile, toPile) {
        this.cards = cards;
        this.fromPile = fromPile;
        this.toPile = toPile;
    };

    //fields
    TransferCardsAction.prototype.cards = null;
    TransferCardsAction.prototype.fromPile = null;
    TransferCardsAction.prototype.toPile = null;

    //public functions
    TransferCardsAction.prototype.undo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        this.fromPile.transferCards(this.cards, settings);
        this._refreshPiles();
    };

    TransferCardsAction.prototype.redo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        this.toPile.transferCards(this.cards, settings);
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

    //public functions
    FlipCardAction.prototype.undo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        this.card.setFaceUp(this.isFaceUp !== true, settings);
    };

    FlipCardAction.prototype.redo = function (settings) {
        if (settings == null) {
            settings = {};
        }

        this.card.setFaceUp(this.isFaceUp === true, settings);
    };

    return FlipCardAction;
})(fSpider.FlipCardAction || {});

fSpider.ReverseCardsAction = (function (ReverseCardsAction, undefined) {
    'use strict';

    //constructor
    ReverseCardsAction = function (pile) {
        this.pile = pile;
    };

    //fields
    ReverseCardsAction.prototype.board = null;
    ReverseCardsAction.prototype.amount = 0;

    //public functions
    ReverseCardsAction.prototype.undo = function () {
        this.pile.reverseCards();
    };

    ReverseCardsAction.prototype.redo = function () {
        this.pile.reverseCards();
    };

    return ReverseCardsAction;
})(fSpider.ReverseCardsAction || {});

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

    //public functions
    ScoreChangeAction.prototype.undo = function () {
        this.board.setScore(this.board.score - this.amount);
    };

    ScoreChangeAction.prototype.redo = function () {
        this.board.setScore(this.board.score + this.amount);
    };

    return ScoreChangeAction;
})(fSpider.ScoreChangeAction || {});