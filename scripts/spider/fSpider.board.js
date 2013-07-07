var fSpider = fSpider || {};

////dependencies\\\\
//fSpider
fSpider.Deck = fSpider.Deck || {};
fSpider.TableauPile = fSpider.TableauPile || {};
fSpider.StockPile = fSpider.StockPile || {};
fSpider.FoundationPile = fSpider.FoundationPile || {};
fSpider.Card = fSpider.Card || {};
fSpider.History = fSpider.History || {};
fSpider.ActionSet = fSpider.ActionSet || {};
fSpider.TransferCardsAction = fSpider.TransferCardsAction || {};
fSpider.FlipCardAction = fSpider.FlipCardAction || {};
fSpider.ScoreChangeAction = fSpider.ScoreChangeAction || {};
fSpider.Utils = fSpider.Utils || {};
//externals
////Kinetic
////jQuery

fSpider.SpiderBoard = (function (SpiderBoard, Kinetic, $, undefined) {
    'use strict';

    //dependencies
    var Deck = fSpider.Deck;
    var TableauPile = fSpider.TableauPile;
    var StockPile = fSpider.StockPile;
    var FoundationPile = fSpider.FoundationPile;
    var Card = fSpider.Card;
    var History = fSpider.History;
    var ActionSet = fSpider.ActionSet;
    var TransferCardsAction = fSpider.TransferCardsAction;
    var FlipCardAction = fSpider.FlipCardAction;
    var ScoreChangeAction = fSpider.ScoreChangeAction;
    var Utils = fSpider.Utils;

    //constructor
    function SpiderBoard(stage, resourcesDiv, cardIdFormat) {
        this.stage = stage;
        this.deck = new Deck();
        this.history = new History();
        this.gameInProgress = false;
        this.globalScale = 1;
        this.score = 0;
        this.moves = 0;
        this.timeEllapsed = 0;
        this._onScoreChanged = undefined;
        this._onMovesChanged = undefined;
        this._onTimeEllapsedChanged = undefined;
        this._selectedCard = null;
        this._resourcesDiv = resourcesDiv;
        this._cardIdFormat = cardIdFormat;
        this._timeEllapsedTimer = undefined;
        this._bgImages = [];
        this._tableauPlaceHolderImage = undefined;
        this._stockPile = undefined;
        this._tableauPiles = []; //[TableauPile]
        this._playerAction = SpiderBoard.playerActions.none;
        //add invisible background to layer so event handlers register
        this._layerBackground = new Kinetic.Rect({
            x: -9999,
            y: -9999,
            width: 999999,
            height: 999999
        });

        this.layer = new Kinetic.Layer();
        this.layer.add(this._layerBackground);
        this.stage.add(this.layer);
    }

    //getters/setters
    SpiderBoard.prototype.getDeck = function () {
        return this.deck;
    };

    SpiderBoard.prototype.getHistory = function () {
        return this.history;
    };

    SpiderBoard.prototype.getStage = function () {
        return this.stage;
    };

    SpiderBoard.prototype.getResourcesDiv = function () {
        return this._resourcesDiv;
    };

    SpiderBoard.prototype.getCardIdFormat = function () {
        return this._cardIdFormat;
    };

    SpiderBoard.prototype.getBgImages = function () {
        return this._bgImages;
    };
    SpiderBoard.prototype.setBgImages = function (bgImages) {
        this._bgImages = bgImages;
    };

    SpiderBoard.prototype.getTableauPlaceHolderImage = function () {
        return this._tableauPlaceHolderImage;
    };
    SpiderBoard.prototype.setTableauPlaceHolderImage = function (tableauPlaceHolderImage) {
        this._tableauPlaceHolderImage = tableauPlaceHolderImage;
    };

    SpiderBoard.prototype.getStockPile = function () {
        return this._stockPile;
    };
    SpiderBoard.prototype.setStockPile = function (stockPile) {
        this._stockPile = stockPile;
    };

    SpiderBoard.prototype.getTableauPiles = function () {
        return this._tableauPiles || [];
    };
    SpiderBoard.prototype.setTableauPiles = function (tableauPiles) {
        this._tableauPiles = tableauPiles;
    };

    SpiderBoard.prototype.getFoundationPiles = function () {
        return this._foundationPiles || [];
    };
    SpiderBoard.prototype.setFoundationPiles = function (foundationPiles) {
        this._foundationPiles = foundationPiles;
    };

    SpiderBoard.prototype.getPiles = function () {
        var piles = [];

        piles = piles.concat(this.getTableauPiles(), this.getFoundationPiles());

        if (this.getStockPile() !== undefined) {
            piles = piles.concat([this.getStockPile()]);
        }

        return piles;
    };

    SpiderBoard.prototype.getLayer = function () {
        return this.layer;
    };

    SpiderBoard.prototype.setGlobalScale = function (scale) {
        this.globalScale = scale;
    };
    SpiderBoard.prototype.getGlobalScale = function () {
        return this.globalScale;
    };

    //private methods
    //build
    SpiderBoard.prototype._buildDeck = function (numCards, suits) {
        var cardIdFormat = this.getCardIdFormat();
        var deck = this.getDeck();
        deck.setCards([]);
        for (var i = 0; i < numCards; i++) {
            //create new card
            var card = new Card(i % 13, suits[Math.floor(i / 13)]);
            //load face image
            var cardId = cardIdFormat.replace("{0}", card.getSuit()).replace("{1}", card.getType());
            var faceImg = $(this.getResourcesDiv()).find(cardId)[0];
            card.loadFaceImg(faceImg);
            //load back image
            card.loadBackImg(this.getBgImages().verticalFull);
            //add to deck
            deck.getCards().push(card);
        }
    };

    SpiderBoard.prototype._buildPiles = function () {
        var i, j, card, pile;

        var deck = this.getDeck();

        //TABLEAU PILES
        var tPiles = [];
        var k = 0;

        //4 piles with 6 cards
        for (i = 0; i < 4; i++) {
            pile = new TableauPile();
            pile.loadPlaceHolderImg(this.getTableauPlaceHolderImage());
            //5 facedown cards
            for (j = 0; j < 5; j++) {
                card = deck.getCardAt(k);
                k++;
                card.setFaceUp(false);
                pile.addCard(card);
            }
            //1 faceup card
            card = deck.getCardAt(k);
            k++;
            card.setFaceUp(true);
            pile.addCard(card);
            tPiles.push(pile);
        }

        //6 piles with 5 cards
        for (i = 4; i < 10; i++) {
            pile = new TableauPile();
            pile.loadPlaceHolderImg(this.getTableauPlaceHolderImage());
            //4 facedown cards
            for (j = 0; j < 4; j++) {
                card = deck.getCardAt(k);
                k++;
                card.setFaceUp(false);
                pile.addCard(card);
            }
            //1 faceup card
            card = deck.getCardAt(k);
            k++;
            card.setFaceUp(true);
            pile.addCard(card);
            tPiles.push(pile);
        }

        this.setTableauPiles(tPiles);

        //STOCK PILE
        //rest of cards go into stock pile (facedown)
        var sPile = new StockPile();
        while (k < deck.getCards().length) {
            card = deck.getCardAt(k);
            k++;
            card.setFaceUp(false);
            sPile.addCard(card);
        }

        this.setStockPile(sPile);

        //FOUNDATION PILES
        var fPiles = [];
        var nPiles = deck.getSize() / 13;
        for (i = 0; i < nPiles; i++) {
            var fPile = new FoundationPile();
            fPiles.push(fPile);
        }

        this.setFoundationPiles(fPiles);
    };

    SpiderBoard.prototype._buildBoard = function (difficulty) {
        if (difficulty === undefined) {
            difficulty = SpiderBoard.difficulties.OneSuit;
        }

        this._buildDeck(104, this._getSuitsForDifficulty(difficulty));
        this._attachLayerEventHanders();
        this._attachCardEventHanders();
    };

    SpiderBoard.prototype._resetCardFaces = function () {
        this.getPiles().forEach(function (pile) {
            pile.resetCardFaces();
        });
    };

    SpiderBoard.prototype._addPilesToLayer = function (layer) {
        this.getPiles().forEach(function (pile) {
            layer.add(pile.getGroup());
        });
    };

    SpiderBoard.prototype._attachStatisticsEventHandlers = function () {
        var self = this;

        this._timeEllapsedTimer = setInterval(function () {
            self._timeEllapsedTick(SpiderBoard.timeEllapsedInterval);
        }, SpiderBoard.timeEllapsedInterval);
    };

    SpiderBoard.prototype._attachLayerEventHanders = function () {
        var self = this;
        this.getLayer().on('touchend mouseup', function (evt) {
            self._layerTouch(evt);
        });
    };

    SpiderBoard.prototype._attachCardEventHanders = function () {
        var self = this;
        this.getDeck().getCards().forEach(function (card) {
            card.on('dragstart', function (evt) {
                self._cardDragStart(evt, card);
            });
            card.on('dragmove', function (evt) {
                self._cardDragMove(evt, card);
            });
            card.on('dragend', function (evt) {
                self._cardDragEnd(evt, card);
            });
            card.on('touchend mouseup', function (evt) {
                self._cardTouch(evt, card);
            });
            card.on('mouseover', function (evt) {
                self._cardMouseOver(evt, card);
            });
            card.on('mouseout', function (evt) {
                self._cardMouseOut(evt, card);
            });
        });
    };

    SpiderBoard.prototype._attachPileEventHandlers = function () {
        var self = this;
        this.getTableauPiles().forEach(function (tPile) {
            var ph = tPile.getPlaceHolderKineticImg();
            if (ph !== undefined) {
                ph.on('touchend mouseup', function (evt) {
                    self._tableauPlaceHolderTouch(evt, tPile);
                });
                ph.on('mouseover', function (evt) {
                    self._tableauPlaceHolderMouseOver(evt, tPile);
                });
                ph.on('mouseout', function (evt) {
                    self._tableauPlaceHolderMouseOut(evt, tPile);
                });
            }
        });
    };

    //destroy
    SpiderBoard.prototype._destroyPiles = function () {
        this._detachPileEventHandlers();
        this.getPiles().forEach(function (pile) {
            pile.destroy();
        });
        this.setTableauPiles([]);
        this.setStockPile(undefined);
    };

    SpiderBoard.prototype._destroyGame = function () {
        this._destroyPiles();
        this._destroyStatisticsEventHandlers();
    };

    SpiderBoard.prototype._destroyBoard = function () {
        this._destroyGame();
        this._detachLayerEventHandlers();
        this._detachCardEventHanders();
        this.getDeck().setCards([]);
    };

    SpiderBoard.prototype._destroyStatisticsEventHandlers = function () {
        if (this._timeEllapsedTimer !== undefined) {
            clearInterval(this._timeEllapsedTimer);
        }
    };

    SpiderBoard.prototype._detachLayerEventHandlers = function () {
        this.getLayer().off('touchend mouseup');
    };

    SpiderBoard.prototype._detachCardEventHanders = function () {
        this.getDeck().getCards().forEach(function (card) {
            card.off('dragstart');
            card.off('dragmove');
            card.off('dragend');
            card.off('touchend mouseup');
            card.off('mouseover');
            card.off('mouseout');
        });
    };

    SpiderBoard.prototype._detachPileEventHandlers = function () {
        this.getTableauPiles().forEach(function (tPile) {
            var ph = tPile.getPlaceHolderKineticImg();
            if (ph !== undefined) {
                ph.off('touchend mouseup');
                ph.off('mouseover');
                ph.off('mouseout');
            }
        });
    };

    //game logic
    SpiderBoard.prototype._checkForAndHandleCompleteSequenece = function (tPile) {
        var completeSequence = tPile.getCompleteSequence();
        if (completeSequence !== undefined && completeSequence.length > 0) { //found one!
            var originalPile = completeSequence[0].getPile();
            var fPiles = this.getFoundationPiles();
            for (var i = 0; i < fPiles.length; i++) {
                var fPile = fPiles[i];
                if (fPile.getSize() === 0) {
                    this.increaseScore(SpiderBoard.scoreIncrementByAfterCompleteSequence);
                    var scoreChangeAction = new ScoreChangeAction(this, SpiderBoard.scoreIncrementByAfterCompleteSequence);
                    this._transferCardsFromTableauPile(originalPile, fPile, completeSequence, [scoreChangeAction]);
                    fPile.reverseCards();
                    this.getHistory().mergeActionSets(this.getHistory().cursor - 2, 2);
                    this.arrangePiles(true, SpiderBoard.stockAnimTime, SpiderBoard.generalAnimTime);
                    return true;
                }
            }
        }

        return false; //either no sequence or no empty foundation piles
    };

    SpiderBoard.prototype._checkForWin = function () {
        var i;
        var win = true;

        //check tableau piles
        var tPiles = this.getTableauPiles();
        for (i = 0; i < tPiles.length; i++) {
            win = win && tPiles[i].getSize() === 0;
        }

        //check stock pile
        win = win && this.getStockPile().getSize() === 0;

        //check foundation piles
        var fPiles = this.getFoundationPiles();
        for (i = 0; i < fPiles.length; i++) {
            win = win && fPiles[i].getSize() > 0;
        }

        return win;
    };

    SpiderBoard.prototype._canTakeFromStockPile = function () {
        var tPiles = this.getTableauPiles();
        for (var i = 0; i < tPiles.length; i++) {
            var tPile = tPiles[i];
            if (tPile.getSize() === 0 || tPile.getCardAt(tPile.getSize() - 1).isFaceUp() !== true) { //empty or last card is face down
                return false;
            }
        }
        return true;
    };

    SpiderBoard.prototype._transferCardsFromTableauPile = function (fromPile, toPile, cards, otherActions) {
        //move cards to new pile
        toPile.transferCards(cards);

        //flip over last card of original pile and refresh
        var flipped = fromPile.setLastCardFaceUp(true);
        fromPile.resetListening();
        fromPile.resetDraggable();

        //refresh new pile
        toPile.resetListening();
        toPile.resetDraggable();

        this.reduceScore();
        this.increaseMoves();

        this._registerTransferInHistory(fromPile, toPile, cards, flipped, otherActions);
    };

    SpiderBoard.prototype._registerTransferInHistory = function (fromPile, toPile, cards, cardFlipped, otherActions) {
        var actionSet = new ActionSet();
        if (cardFlipped === true && fromPile.getSize() > 0) {
            var flipAction = new FlipCardAction(fromPile.cards[fromPile.getSize() - 1], true);
            actionSet.addAction(flipAction);
        }
        var transferAction = new TransferCardsAction(fromPile, toPile, cards);
        actionSet.addAction(transferAction);
        if (otherActions !== undefined) {
            otherActions.forEach(function (action) {
                actionSet.addAction(action);
            });
        }
        this.getHistory().registerActionSet(actionSet);
    };

    SpiderBoard.prototype._drawFromStockPile = function () {
        var actionSet = new ActionSet();

        var animTime = SpiderBoard.stockAnimTime;
        var delayFraction = SpiderBoard.stockDelayFraction;

        var sPile = this.getStockPile();
        var tPiles = this.getTableauPiles();
        var cards = sPile.getCards();
        var i = tPiles.length;
        while (i > 0 && cards.length > 0) {
            var cardToTransfer = cards[cards.length - 1];
            cardToTransfer.setFaceUp(true);
            var tPile = tPiles[tPiles.length - i];
            tPile.transferCards([cardToTransfer]);
            tPile.resetDraggable();
            tPile.resetListening();
            i--;

            var flipAction = new FlipCardAction(cardToTransfer, true);
            var transferAction = new TransferCardsAction(sPile, tPile, [cardToTransfer], animTime, delayFraction);
            actionSet.addAction(flipAction);
            actionSet.addAction(transferAction);
        }

        this.reduceScore();
        this.increaseMoves();
        this.arrangePiles(true, animTime, delayFraction); //arrange all piles

        if (actionSet.actions.length > 0) {
            this.getHistory().registerActionSet(actionSet);
        }
    };

    SpiderBoard.prototype._stopDraggingCards = function (card, pos) {
        //capture original pile for later
        var originalPile = card.getPile();

        //make sure we can add card to pile
        var tPile = this._findBoundingTableauPile(pos);
        if (tPile !== undefined && tPile !== originalPile && tPile.canAddCard(card) === true) {
            this._transferCardsFromTableauPile(originalPile, tPile, originalPile.getCardAndCardsAfter(card));
            if (this._checkForAndHandleCompleteSequenece(tPile) === true) {
                card.setSelected(false);
                card.setHovering(false);
                if (this._checkForWin() === true) {
                    this.win();
                }
            } else {
                this.arrangeTableauPile(tPile, true);
            }
        }
        this.arrangeTableauPile(originalPile, true);

        this._playerAction = SpiderBoard.playerActions.none;
        this.redraw();
    };

    //helpers
    SpiderBoard.prototype._getSuitsForDifficulty = function (difficulty) {
        var suits;

        var spades = Card.cardSuits.spades;
        var clubs = Card.cardSuits.clubs;
        var hearts = Card.cardSuits.hearts;
        var diamonds = Card.cardSuits.diamonds;

        switch (difficulty) {
            case SpiderBoard.difficulties.OneSuit:
                suits = [spades, spades, spades, spades, spades, spades, spades, spades];
                break;
            case SpiderBoard.difficulties.TwoSuit:
                suits = [spades, spades, spades, spades, hearts, hearts, hearts, hearts];
                break;
            case SpiderBoard.difficulties.FourSuit:
                suits = [spades, spades, clubs, clubs, hearts, hearts, diamonds, diamonds];
                break;
        }

        return suits;
    };

    SpiderBoard.prototype._findBoundingTableauPile = function (point) {
        var tPiles = this.getTableauPiles();
        for (var i = 0; i < tPiles.length; i++) {
            var tPile = tPiles[i];
            var bounds = {
                'x': tPile.getX(),
                'y': tPile.getY(),
                'width': tPile.getWidth(),
                'height': tPile.getHeight()
            };
            if (Utils.isPointInBounds(point, bounds) === true) {
                return tPile;
            }
        }

        return undefined;
    };

    SpiderBoard.prototype._fireScoreChanged = function () {
        if (this._onScoreChanged !== undefined) {
            this._onScoreChanged(this.score);
        }
    };

    SpiderBoard.prototype._fireMovesChanged = function () {
        if (this._onMovesChanged !== undefined) {
            this._onMovesChanged(this.moves);
        }
    };

    SpiderBoard.prototype._fireTimeEllapsedChanged = function () {
        if (this._onTimeEllapsedChanged !== undefined) {
            this._onTimeEllapsedChanged(this.timeEllapsed);
        }
    };

    //event handlers
    SpiderBoard.prototype._timeEllapsedTick = function (amount) {
        this.incrementTimeEllapsed(amount);
    };

    SpiderBoard.prototype._layerTouch = function (evt) {
        if (evt.handledByCardTouch === true) {
            return;
        }

        if (this._selectedCard !== null) {
            if (this._playerAction === SpiderBoard.playerActions.dragging) {
                this._stopDraggingCards(this._selectedCard, { 'x': evt.layerX, 'y': evt.layerY });
            } else {
                this._selectedCard.getPile();
                this._selectedCard.setSelected(false);
                this.arrangeTableauPile(this._selectedCard.getPile(), true);
                this._selectedCard = null;
                this.redraw();
            }
        }
    };

    SpiderBoard.prototype._cardDragStart = function (evt, card) {
        this._playerAction = SpiderBoard.playerActions.dragging;
        card.getPile().getGroup().moveToTop();
    };

    SpiderBoard.prototype._cardDragMove = function (evt, card) {
        var tMargin = 20;
        var pile = card.getPile();
        var cards = pile.getCards();
        var index = cards.indexOf(card);
        for (var i = index + 1; i < cards.length; i++) {
            cards[i].setX(card.getX());
            cards[i].setY(card.getY() + (i - index) * tMargin);
        }
    };

    SpiderBoard.prototype._cardDragEnd = function (evt, card) {
        this._stopDraggingCards(card, { 'x': evt.layerX, 'y': evt.layerY });
        evt.handledByCardTouch = true;
    };

    SpiderBoard.prototype._cardTouch = function (evt, card) {
        if (card.isFaceUp() === true) {
            if (this._selectedCard === card) {
                //just deselect it
                this._selectedCard.setSelected(false);
                this.arrangeTableauPile(this._selectedCard.getPile(), true); //arrange pile
                this._selectedCard = null;
            } else if (this._selectedCard !== null) {
                var cardIndex = card.getPile().getCards().indexOf(card);
                //if touched card is the last card in its pile and selected card is allowed to be added
                if (cardIndex === card.getPile().getSize() - 1 && card.getPile().canAddCard(this._selectedCard) === true) {
                    this._transferCardsFromTableauPile(this._selectedCard.getPile(), card.getPile(), this._selectedCard.getPile().getCardAndCardsAfter(this._selectedCard));
                    if (this._checkForAndHandleCompleteSequenece(card.getPile()) === true) {
                        card.setHovering(false);
                        this._selectedCard.setHovering(false);
                        this.arrangeTableauPile(card.getPile(), true); //arrange pile
                        if (this._checkForWin() === true) {
                            this.win();
                        }
                    }
                }
                this._selectedCard.setSelected(false);
                this.arrangeTableauPile(this._selectedCard.getPile(), true); //arrange pile
                this._selectedCard = null;
            } else if (card.getPile().canRemoveCard(card) === true) {
                card.setSelected(true);
                this._selectedCard = card;
                this.arrangeTableauPile(card.getPile(), true); //arrange pile
            }

            evt.handledByCardTouch = true; //prevent bubbled event to trigger "deselect card"
        } else {
            if (card.getPile() === this.getStockPile()) {
                if (this._canTakeFromStockPile() === true) {
                    this._drawFromStockPile();
                }
            } else {
                card.setFaceUp(true);
                var pile = card.getPile();
                if (pile !== undefined) {
                    pile.resetDraggable();
                    pile.resetListening();
                    this.arrangeTableauPile(pile, true); //arrange pile
                }
            }
        }

        this.redraw();
    };

    SpiderBoard.prototype._cardMouseOver = function (evt, card) {
        card.setHovering(true);
        this.redraw();
    };

    SpiderBoard.prototype._cardMouseOut = function (evt, card) {
        card.setHovering(false);
        this.redraw();
    };

    SpiderBoard.prototype._tableauPlaceHolderTouch = function (evt, tPile) {
        if (this._selectedCard !== null) {
            //if selected card is allowed to be added
            if (tPile.canAddCard(this._selectedCard) === true) {
                this._transferCardsFromTableauPile(this._selectedCard.getPile(), tPile, this._selectedCard.getPile().getCardAndCardsAfter(this._selectedCard));
                this.arrangeTableauPile(tPile, true);
                if (this._checkForAndHandleCompleteSequenece(tPile) === true) {
                    this._selectedCard.setHovering(false);
                    if (this._checkForWin() === true) {
                        this.win();
                    }
                }
            }

            this._selectedCard.setSelected(false);
            this.arrangeTableauPile(this._selectedCard.getPile(), true);
            this._selectedCard = null;

            this.redraw();
        }
    };

    SpiderBoard.prototype._tableauPlaceHolderMouseOver = function (evt, tPile) {
        tPile.setHovering(true);
        this.redraw();
    };

    SpiderBoard.prototype._tableauPlaceHolderMouseOut = function (evt, tPile) {
        tPile.setHovering(false);
        this.redraw();
    };

    //public methods
    SpiderBoard.prototype.redraw = function () {
        this.getLayer().draw();
    };

    SpiderBoard.prototype.canUndo = function () {
        return this.getHistory().canUndo() === true;
    };

    SpiderBoard.prototype.undo = function () {
        if (this.getHistory().canUndo() === true) {
            var actionSet = this.getHistory().undo();
            if (actionSet !== undefined) {
                var animTime, delayFraction;
                var tAction = actionSet.findFirstTransferCardsAction();
                if (tAction !== undefined) {
                    animTime = tAction.animTime;
                    delayFraction = tAction.delay;
                }
                this.arrangePiles(true, animTime, delayFraction);
                this.reduceScore();
                this.increaseMoves();
            }
        }
    };

    SpiderBoard.prototype.canRedo = function () {
        return this.getHistory().canRedo() === true;
    };

    SpiderBoard.prototype.redo = function () {
        if (this.getHistory().canRedo() === true) {
            var actionSet = this.getHistory().redo();
            if (actionSet !== undefined) {
                var delayFraction;
                var tAction = actionSet.findFirstTransferCardsAction();
                if (tAction !== undefined) {
                    delayFraction = tAction.delay;
                }
                this.arrangePiles(true, undefined, delayFraction);
                this.reduceScore();
                this.increaseMoves();
            }
        }
    };

    SpiderBoard.prototype.arrangeTableauPile = function (pile, animate, animTime, delayFraction) {
        if (animate === true && animTime === undefined) {
            animTime = SpiderBoard.generalAnimTime;
        }
        if (delayFraction === undefined) {
            delayFraction = SpiderBoard.generalDelayFraction;
        }

        var scale = this.getGlobalScale();

        var availHeight = this.getStage().getHeight() - (SpiderBoard.boardMargin.t + SpiderBoard.boardMargin.b) * scale;
        var availMargin = {
            l: SpiderBoard.tableauPileMargin.l * scale,
            r: SpiderBoard.tableauPileMargin.r * scale,
            t: SpiderBoard.tableauPileMargin.t,
            b: SpiderBoard.tableauPileMargin.b
        };

        var w = Card.cardDim.w;
        var h = availHeight - availMargin.t - Card.cardDim.h - availMargin.b - SpiderBoard.boardMargin.b;

        pile.arrangeCards(w, h, animTime, delayFraction);
    };

    SpiderBoard.prototype.arrangePiles = function (animate, animTime, delayFraction) {
        var i, x, y, w, h, availMargin;

        if (animate === true && animTime === undefined) {
            animTime = SpiderBoard.generalAnimTime;
        }
        if (delayFraction === undefined) {
            delayFraction = SpiderBoard.generalDelayFraction;
        }

        var scale = this.getGlobalScale();

        //find available height/width, given board margin
        var availWidth = this.getStage().getWidth() - (SpiderBoard.boardMargin.l + SpiderBoard.boardMargin.r) * scale;
        var availHeight = this.getStage().getHeight() - (SpiderBoard.boardMargin.t + SpiderBoard.boardMargin.b) * scale;

        ////**TABLEAU PILES**\\\\
        availMargin = {
            l: SpiderBoard.tableauPileMargin.l * scale,
            r: SpiderBoard.tableauPileMargin.r * scale,
            t: SpiderBoard.tableauPileMargin.t,
            b: SpiderBoard.tableauPileMargin.b
        };

        var tableauPiles = this.getTableauPiles();

        //find available width if all tableau piles added
        var emptyWidth = availWidth - (tableauPiles.length * Card.cardDim.w * scale);

        //find amount of extra room that can be alloted to each pile
        var emptyWidthEach = emptyWidth / tableauPiles.length;

        //divide this number by two to find value for left/right margin
        var emptyMarginEach = emptyWidthEach / 2;

        //we are going to assume margin is symmetrical (for now?)
        //if margin we calculated is > one provided, use it instead
        if (emptyMarginEach > Math.max(availMargin.l, availMargin.r)) {
            availMargin.l = emptyMarginEach;
            availMargin.r = emptyMarginEach;
        }

        y = (SpiderBoard.boardMargin.t + availMargin.t) * scale;
        w = Card.cardDim.w;
        h = availHeight - availMargin.t - Card.cardDim.h - availMargin.b - SpiderBoard.boardMargin.b;

        //arrange piles
        for (i = tableauPiles.length - 1; i >= 0; i--) {
            var tPile = tableauPiles[i];
            x = SpiderBoard.boardMargin.l * scale; //board margin
            x += availMargin.l * (i + 1); //all pile left margins
            x += ((Card.cardDim.w * scale) + availMargin.r) * i; //all pile right margins and card widths
            tPile.setX(x);
            tPile.setY(y);
            tPile.arrangeCards(w, h, animTime, delayFraction * i);
        }

        ////**STOCK PILE**\\\\
        availMargin = {
            l: SpiderBoard.stockPileMargin.l,
            r: SpiderBoard.stockPileMargin.r,
            t: SpiderBoard.stockPileMargin.t,
            b: SpiderBoard.stockPileMargin.b
        };

        var stockPile = this.getStockPile();
        var nCardsInOriginalPile = this.getDeck().getSize() - 24 - 30;

        var stockExtraW = nCardsInOriginalPile / 10 * 1.5; //for showing how many stacks left
        x = availWidth - (Card.cardDim.w + availMargin.r + stockExtraW) * scale;
        y = availHeight - (Card.cardDim.h + availMargin.b) * scale;
        w = Card.cardDim.w + stockExtraW;
        h = Card.cardDim.h;
        stockPile.setX(x);
        stockPile.setY(y);
        stockPile.arrangeCards(w, h, animTime, delayFraction, delayFraction);

        ////**FOUNDATION PILES**\\\\
        availMargin = {
            l: SpiderBoard.foundationPilesMargin.l,
            r: SpiderBoard.foundationPilesMargin.r,
            t: SpiderBoard.foundationPilesMargin.t,
            b: SpiderBoard.foundationPilesMargin.b
        };

        var foundationPiles = this.getFoundationPiles();

        var startX = SpiderBoard.boardMargin.l + availMargin.l * scale;
        y = availHeight - (availMargin.b + Card.cardDim.h) * scale;
        w = Card.cardDim.w;
        h = Card.cardDim.h;

        //arrange piles
        for (i = 0; i < foundationPiles.length; i++) {
            var fPile = foundationPiles[i];
            x = startX + (i * Card.cardDim.w / 3 * scale);
            fPile.setX(x);
            fPile.setY(y);
            fPile.arrangeCards(w, h, animTime, delayFraction * i);
        }
    };

    SpiderBoard.prototype.rescalePiles = function () {
        var scale = this.getGlobalScale();
        this.getPiles().forEach(function (pile) {
            pile.getGroup().setScale(scale);
        });
    };

    SpiderBoard.prototype.startNewGame = function (difficulty) {
        if (difficulty === undefined) {
            difficulty = SpiderBoard.difficulties.OneSuit;
        }

        this.gameInProgress = false;
        this.recalculateGlobalScale();

        this.getHistory().clear();
        this.setScore(SpiderBoard.startScore);
        this.setMoves(0);
        this.setTimeEllapsed(0);

        this._destroyBoard();
        this._buildBoard(difficulty);

        this.getDeck().shuffle();
        this._buildPiles();
        this._attachPileEventHandlers();
        this._addPilesToLayer(this.getLayer());

        this._resetCardFaces();
        this.rescalePiles();
        this.arrangePiles();
        this.getPiles().forEach(function (pile) {
            pile.resetListening();
            pile.resetDraggable();
        });

        this.redraw();
        this._attachStatisticsEventHandlers();
        this.gameInProgress = true;
    };

    SpiderBoard.prototype.isGameInProgress = function () {
        return this.gameInProgress;
    };

    SpiderBoard.prototype.recalculateGlobalScale = function () {
        var scaleX = this.getStage().getWidth() / SpiderBoard.originalDimensions.w;
        var scaleY = this.getStage().getHeight() / SpiderBoard.originalDimensions.h;
        var scale = scaleY < scaleX ? scaleY : scaleX;
        this.setGlobalScale(scale);
    };

    SpiderBoard.prototype.onMovesChanged = function (callback) {
        this._onMovesChanged = callback;
    };

    SpiderBoard.prototype.increaseMoves = function (amount) {
        if (amount === undefined) {
            amount = SpiderBoard.movesIncrementBy;
        }
        this.moves += amount;
        this._fireMovesChanged();
    };

    SpiderBoard.prototype.setMoves = function (moves) {
        this.moves = moves;
        this._fireMovesChanged();
    };

    SpiderBoard.prototype.onScoreChanged = function (callback) {
        this._onScoreChanged = callback;
    };

    SpiderBoard.prototype.reduceScore = function (amount) {
        if (amount === undefined) {
            amount = SpiderBoard.scoreDecrementBy;
        }
        this.score -= amount;
        this._fireScoreChanged();
    };

    SpiderBoard.prototype.increaseScore = function (amount) {
        this.score += amount;
        this._fireScoreChanged();
    };

    SpiderBoard.prototype.setScore = function (score) {
        this.score = score;
        this._fireScoreChanged();
    };

    SpiderBoard.prototype.onTimeEllapsedChanged = function (callback) {
        this._onTimeEllapsedChanged = callback;
    };

    SpiderBoard.prototype.setTimeEllapsed = function (time) {
        this.timeEllapsed = time;
        this._fireTimeEllapsedChanged();
    };

    SpiderBoard.prototype.incrementTimeEllapsed = function (amount) {
        this.timeEllapsed += amount;
        this._fireTimeEllapsedChanged();
    };

    SpiderBoard.prototype.win = function () {
        this.gameInProgress = false;
        alert('You won with a score of ' + this.score + '!');
    };

    //static fields
    SpiderBoard.boardMargin = { l: 10, r: 10, t: 10, b: 10 };
    SpiderBoard.tableauPileMargin = { l: 1, r: 1, t: 5, b: 0 };
    SpiderBoard.stockPileMargin = { l: 0, r: 100, t: 0, b: 10 };
    SpiderBoard.foundationPilesMargin = { l: 150, r: 0, t: 0, b: 10 };
    SpiderBoard.originalDimensions = { w: 940, h: 580 };
    SpiderBoard.playerActions = {
        'none': 0,
        'dragging': 1
    };
    SpiderBoard.generalAnimTime = 200;
    SpiderBoard.generalDelayFraction = 40;
    SpiderBoard.stockAnimTime = 300;
    SpiderBoard.stockDelayFraction = 50;
    SpiderBoard.difficulties = {
        'OneSuit': 0,
        'TwoSuit': 1,
        'FourSuit': 2
    };
    SpiderBoard.startScore = 500;
    SpiderBoard.movesIncrementBy = 1;
    SpiderBoard.scoreIncrementByAfterCompleteSequence = 100;
    SpiderBoard.scoreDecrementBy = 1;
    SpiderBoard.timeEllapsedInterval = 1000;

    return SpiderBoard;
})(fSpider.SpiderBoard || {}, window.Kinetic, window.jQuery);