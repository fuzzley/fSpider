var fSpider = fSpider || {};

fSpider.ActionSet = (function (ActionSet, undefined) {
    'use strict';

    //constructor
	function ActionSet() {
		this.actions = [];
	}

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
		this.actions.reverse().forEach(function (action) {
			if (action.undo !== undefined) {
				action.undo();
			}
		});
	};

	ActionSet.prototype.redo = function () {
		this.actions.reverse().forEach(function (action) {
			if (action.redo !== undefined) {
				action.redo();
			}
		});
	};

	ActionSet.prototype.findFirstTransferCardsAction = function () {
		for (var i = 0; i < this.actions.length; i++) {
			if (this.actions[i].actionType === "TransferCardsAction") {
				return this.actions[i];
			}
		}
        return undefined;
	};

	//static functions
	ActionSet.mergeActionSets = function (actionSets) {
		var merged = new ActionSet();
		if (actionSets !== undefined) {
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
    function History() {
        this._actionSets = [];
        this.cursor = 0;
        this._onHistoryChangedCallback = undefined;
    }

    History.prototype.canUndo = function () {
        return this.cursor > 0;
    };

    History.prototype.undo = function () {
        var actionSet;
        if (this.canUndo() === true) {
            this.cursor--;
            actionSet = this._actionSets[this.cursor];
            actionSet.undo();
            this._fireOnHistoryChanged();
        }
        return actionSet;
    };

    History.prototype.canRedo = function () {
        return this.cursor < this._actionSets.length;
    };

    History.prototype.redo = function () {
        var actionSet;
        if (this.canRedo() === true) {
            actionSet = this._actionSets[this.cursor];
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
        if (this.cursor < this._actionSets.length) {
            //cut off everything after cursor
            this._actionSets = this._actionSets.splice(0, this.cursor);
        }
        this._actionSets.push(actionSet);
        this.cursor++;
        this._fireOnHistoryChanged();
    };

    History.prototype.mergeActionSets = function (start, amount) {
        if (start < 0 || start > this._actionSets.length - 2) {
            return;
        }
        if (amount === undefined) {
            amount = this._actionSets.length - start;
        }
        if (start + amount < 0 || start + amount > this._actionSets.length) {
            return;
        }
        var newActionSet = ActionSet.mergeActionSets(this._actionSets.slice(start, start + amount));
        this._actionSets.splice(start, amount, newActionSet);
        if (this.cursor > start) {
            this.cursor -= amount;
            this.cursor++;
        }
    };

    History.prototype.clear = function () {
        this._actionSets = [];
        this.cursor = 0;
        this._fireOnHistoryChanged();
    };

    History.prototype.onHistoryChanged = function (callback) {
        this._onHistoryChangedCallback = callback;
    };

    History.prototype._fireOnHistoryChanged = function () {
        if (this._onHistoryChangedCallback !== undefined) {
            this._onHistoryChangedCallback(this);
        }
    };

    return History;
})(fSpider.History || {});

fSpider.TransferCardsAction = (function (TransferCardsAction, undefined) {
    'use strict';

    //constructor
	function TransferCardsAction(fromPile, toPile, cards, animTime, delay) {
		this.fromPile = fromPile;
		this.toPile = toPile;
		this.cards = cards;
		this.animTime = animTime;
		this.delay = delay;
		this.actionType = "TransferCardsAction";
	}

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
	function FlipCardAction(card, isFaceUp) {
		this.card = card;
		this.isFaceUp = isFaceUp;
		this.actionType = "FlipCardAction";
	}

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
	function ScoreChangeAction(board, amount) {
		this.board = board;
		this.amount = amount;
	}

	ScoreChangeAction.prototype.undo = function () {
		this.board.setScore(this.board.score - this.amount);
	};

	ScoreChangeAction.prototype.redo = function () {
		this.board.setScore(this.board.score + this.amount);
	};

	return ScoreChangeAction;
})(fSpider.ScoreChangeAction || {});