var fSpider = fSpider || {};

////dependencies\\\\
//fSpider
fSpider.Deck = fSpider.Deck || {};

fSpider.Card = fSpider.Card || {};
fSpider.PlayingCard = fSpider.PlayingCard || {};

fSpider.Pile = fSpider.Pile || {};
fSpider.TableauPile = fSpider.TableauPile || {};
fSpider.StockPile = fSpider.StockPile || {};
fSpider.FoundationPile = fSpider.FoundationPile || {};

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
    var PlayingCard = fSpider.PlayingCard;
    var History = fSpider.History;
    var ActionSet = fSpider.ActionSet;
    var TransferCardsAction = fSpider.TransferCardsAction;
    var FlipCardAction = fSpider.FlipCardAction;
    var ScoreChangeAction = fSpider.ScoreChangeAction;
    var Utils = fSpider.Utils;

    //constructor
    SpiderBoard = function (stage, resourcesDiv, cardIdFormat) {
        this.stage = stage;
        this.deck = new Deck();
        this.history = new History();
        this.gameInProgress = false;
        this.globalScale = 1;
        this.score = 0;
        this.moves = 0;
        this.timeElapsed = 0;
        this._onScoreChanged = undefined;
        this._onMovesChanged = undefined;
        this._onTimeElapsedChanged = undefined;
        this._selectedCard = null;
        this._resourcesDiv = resourcesDiv;
        this._cardIdFormat = cardIdFormat;
        this._timeElapsedTimer = undefined;
        this._bgImages = [];
        this._tableauPlaceHolderImage = undefined;
        this._stockPile = undefined;
        this._tableauPiles = []; //[TableauPile]
        this._playerAction = SpiderBoard.PLAYER_ACTIONS.none;
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
    };

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
            var card = new PlayingCard(suits[Math.floor(i / 13)], i % 13);
            //load face image
            var cardId = cardIdFormat.replace("{0}", card.getSuit()).replace("{1}", card.getType());
            var faceImg = $(this.getResourcesDiv()).find(cardId)[0];
            card.loadFaceImg(faceImg, PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h);
            //load back image
            card.loadBackImg(this.getBgImages().verticalFull, PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h);
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
            difficulty = SpiderBoard.DIFFICULTIES.OneSuit;
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

        this._timeElapsedTimer = setInterval(function () {
            self._timeElapsedTick(SpiderBoard.TIME_ELAPSED_INTERVAL);
        }, SpiderBoard.TIME_ELAPSED_INTERVAL);
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
        if (this._timeElapsedTimer !== undefined) {
            clearInterval(this._timeElapsedTimer);
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
        if (completeSequence != null && completeSequence.length > 0) { //found one!
            var originalPile = completeSequence[0].getPile();
            var fPiles = this.getFoundationPiles();
            for (var i = 0; i < fPiles.length; i++) {
                var fPile = fPiles[i];
                if (fPile.getSize() === 0) {
                    this.increaseScore(SpiderBoard.SCORE_INCREMENT_BY_AFTER_COMPLETE_SEQUENCE);
                    var scoreChangeAction = new ScoreChangeAction(this, SpiderBoard.SCORE_INCREMENT_BY_AFTER_COMPLETE_SEQUENCE);
                    this._transferCardsFromTableauPile(originalPile, fPile, completeSequence, false, [scoreChangeAction]);
                    fPile.reverseCards();
                    this.getHistory().mergeActionSets(this.getHistory().cursor - 2, 2);
                    this.arrangePiles(true, SpiderBoard.STOCK_ANIM_TIME, SpiderBoard.GENERAL_ANIM_TIME);
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

    SpiderBoard.prototype._transferCardsFromTableauPile = function (fromPile, toPile, cards, checkSequence, otherActions) {
        if (cards == null || cards.length <= 0) {
            return;
        }

        //move cards to new pile
        toPile.transferCards(cards);

        //flip over last card of original pile and refresh
        var flipped = fromPile.setLastCardFaceUp(true);
        fromPile.resetListening();
        fromPile.resetDraggable();

        //refresh new pile
        toPile.resetListening();
        toPile.resetDraggable();

        //modify statistics
        this.reduceScore();
        this.increaseMoves();

        //record transfer in history
        this._registerTransferInHistory(fromPile, toPile, cards, flipped, otherActions);
        if (checkSequence === true) {
            //check for a complete sequence
            if (this._checkForAndHandleCompleteSequenece(toPile) === true) {
                if (this._checkForWin() === true) {
                    this.win();
                }
            } else {
                this.arrangeTableauPile(toPile, true);
            }
        }

        //deselect card
        if (this._selectedCard != null) {
            this._deselectCard(this._selectedCard, true);
        }
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

        var animTime = SpiderBoard.STOCK_ANIM_TIME;
        var delayFraction = SpiderBoard.STOCK_DELAY_FRACTION;

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

        this.arrangePiles(true, animTime, delayFraction); //arrange all piles

        if (actionSet.actions.length > 0) {
            this.getHistory().registerActionSet(actionSet);
        }
    };

    SpiderBoard.prototype._stopDraggingCards = function (card, pos) {
        //capture original pile for later
        var originalPile = card.getPile();

        //make sure we can add card to pile
        var tPile = this._findOverlappingTableauPile(card, pos);
        if (tPile != null) {
            this._transferCardsFromTableauPile(originalPile, tPile, originalPile.getCardAndCardsAfter(card), true);
        }
        this.arrangeTableauPile(originalPile, true);

        this._playerAction = SpiderBoard.PLAYER_ACTIONS.none;
        this.redraw();
    };

    //helpers
    SpiderBoard.prototype._getSuitsForDifficulty = function (difficulty) {
        var suits;

        var spades = PlayingCard.CARD_SUITS.spades;
        var clubs = PlayingCard.CARD_SUITS.clubs;
        var hearts = PlayingCard.CARD_SUITS.hearts;
        var diamonds = PlayingCard.CARD_SUITS.diamonds;

        switch (difficulty) {
            case SpiderBoard.DIFFICULTIES.OneSuit:
                suits = [spades, spades, spades, spades, spades, spades, spades, spades];
                break;
            case SpiderBoard.DIFFICULTIES.TwoSuit:
                suits = [spades, spades, spades, spades, hearts, hearts, hearts, hearts];
                break;
            case SpiderBoard.DIFFICULTIES.FourSuit:
                suits = [spades, spades, clubs, clubs, hearts, hearts, diamonds, diamonds];
                break;
        }

        return suits;
    };

    SpiderBoard.prototype._findOverlappingTableauPile = function (card, touchPoint) {
        var overlapPile = null;
        var scale = this.getGlobalScale();

        //get the card boundaries
        var cardRect = {
            'x': card.getAbsolutePosition().x,
            'y': card.getAbsolutePosition().y,
            'width': card.getWidth(scale),
            'height': card.getHeight(scale)
        };

        var tPiles = this.getTableauPiles();
        var bounds, lastCard, otherCenter, placeHolder, dist, tDist;
        for (var i = 0; i < tPiles.length; i++) { //pick best overlapping pile
            //some simple conditions to see if we even care about this pile
            if (tPiles[i] === card.getPile() || tPiles[i].canAddCard(card) !== true) { //is owner or can't add card
                continue; //just skip to the next pile
            } //else
            //calculate this pile's dimensions
            bounds = {
                'x': tPiles[i].getX(),
                'y': tPiles[i].getY(),
                'width': tPiles[i].getWidth(),
                'height': tPiles[i].getHeight()
            };
            //check if card/pile intersect
            if (Utils.doRectsIntersect(cardRect, bounds) === true) {
                //try to get the center point of the last card in pile
                lastCard = tPiles[i].getLastCard();
                if (lastCard !== null) {
                    otherCenter = lastCard.getAbsoluteCenter(scale);
                } else { //otherwise get center point of place holder image
                    placeHolder = tPiles[i].getPlaceHolderKineticImg();
                    otherCenter = {
                        'x': placeHolder.getAbsolutePosition().x + (placeHolder.getWidth() / 2 * scale),
                        'y': placeHolder.getAbsolutePosition().y + (placeHolder.getHeight() / 2 * scale)
                    };
                }
                //find distance between touch point and center
                tDist = Utils.distance(touchPoint, otherCenter);
                if (dist === undefined || dist > tDist) { //if it's the minimum so far
                    dist = tDist;
                    overlapPile = tPiles[i]; //accept this pile (for now)
                } //keep looking for a more fitting pile
            }
        }

        return overlapPile;
    };

    SpiderBoard.prototype._deselectCard = function (card, arrangePile) {
        if (card === undefined) {
            card = this._selectedCard;
        }
        if (card != null) {
            card.setSelected(false);
            if (arrangePile === true) {
                this.arrangeTableauPile(card.getPile(), true);
            }
            if (this._selectedCard === card) {
                this._selectedCard = null;
            }
        }
    };

    SpiderBoard.prototype._selectCard = function (card, arrangePile) {
        card.setSelected(true);
        this._selectedCard = card;
        if (arrangePile === true) {
            this.arrangeTableauPile(card.getPile(), true);
        }
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

    SpiderBoard.prototype._fireTimeElapsedChanged = function () {
        if (this._onTimeElapsedChanged !== undefined) {
            this._onTimeElapsedChanged(this.timeElapsed);
        }
    };

    //event handlers
    SpiderBoard.prototype._timeElapsedTick = function (amount) {
        this.incrementTimeElapsed(amount);
    };

    SpiderBoard.prototype._layerTouch = function (evt) {
        if (evt.handledByCardTouch === true) {
            return;
        }

        if (this._selectedCard != null) {
            if (this._playerAction === SpiderBoard.PLAYER_ACTIONS.dragging) {
                this._stopDraggingCards(this._selectedCard, { 'x': evt.layerX, 'y': evt.layerY });
            } else {
                this._deselectCard(this._selectedCard, true);
                this.redraw();
            }
        }
    };

    SpiderBoard.prototype._cardDragStart = function (evt, card) {
        this._playerAction = SpiderBoard.PLAYER_ACTIONS.dragging;
        if (this._selectedCard != null) {
            this._deselectCard(this._selectedCard, this._selectedCard.getPile() !== card.getPile());
        }
        this._selectCard(card, false);
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
        var sCard = this._selectedCard;
        if (card.isFaceUp() === true) {
            if (sCard === card) {
                //just deselect it
                if (this._playerAction !== SpiderBoard.PLAYER_ACTIONS.dragging) {
                    this._deselectCard(sCard, true);
                }
            } else if (sCard != null) {
                var cardIndex = card.getPile().getCards().indexOf(card);
                //if touched card is the last card in its pile and selected card is allowed to be added
                if (cardIndex === card.getPile().getSize() - 1 && card.getPile().canAddCard(sCard) === true) {
                    this._transferCardsFromTableauPile(sCard.getPile(), card.getPile(),
                        sCard.getPile().getCardAndCardsAfter(sCard), true);
                } else {
                    this._deselectCard(sCard, true);
                }
            } else if (card.getPile().canRemoveCard(card) === true) {
                this._selectCard(card, true);
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
                if (pile != null) {
                    pile.resetDraggable();
                    pile.resetListening();
                    this.arrangeTableauPile(pile, true);
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
        var card = this._selectedCard;
        if (card !== null) {
            //if selected card is allowed to be added
            if (tPile.canAddCard(card) === true) {
                this._transferCardsFromTableauPile(card.getPile(), tPile, card.getPile().getCardAndCardsAfter(card), true);
            } else {
                this._deselectCard(card, true);
            }
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
            if (actionSet != null) {
                var animTime, delayFraction;
                var tAction = actionSet.findFirstTransferCardsAction();
                if (tAction != null) {
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
            if (actionSet != null) {
                var delayFraction;
                var tAction = actionSet.findFirstTransferCardsAction();
                if (tAction != null) {
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
            animTime = SpiderBoard.GENERAL_ANIM_TIME;
        }
        if (delayFraction === undefined) {
            delayFraction = SpiderBoard.GENERAL_DELAY_FRACTION;
        }

        var scale = this.getGlobalScale();

        var availHeight = this.getStage().getHeight() - (SpiderBoard.BOARD_MARGIN.t + SpiderBoard.BOARD_MARGIN.b) * scale;
        var availMargin = {
            l: SpiderBoard.TABLEAU_PILE_MARGIN.l * scale,
            r: SpiderBoard.TABLEAU_PILE_MARGIN.r * scale,
            t: SpiderBoard.TABLEAU_PILE_MARGIN.t,
            b: SpiderBoard.TABLEAU_PILE_MARGIN.b
        };

        var w = PlayingCard.CARD_DIM.w;
        var h = availHeight - availMargin.t - PlayingCard.CARD_DIM.h - availMargin.b - SpiderBoard.BOARD_MARGIN.b;

        pile.arrangeCards(w, h, animTime, delayFraction);
    };

    SpiderBoard.prototype.arrangePiles = function (animate, animTime, delayFraction) {
        var i, x, y, w, h, availMargin;

        if (animate === true && animTime === undefined) {
            animTime = SpiderBoard.GENERAL_ANIM_TIME;
        }
        if (delayFraction === undefined) {
            delayFraction = SpiderBoard.GENERAL_DELAY_FRACTION;
        }

        var scale = this.getGlobalScale();

        //find available height/width, given board margin
        var availWidth = this.getStage().getWidth() - (SpiderBoard.BOARD_MARGIN.l + SpiderBoard.BOARD_MARGIN.r) * scale;
        var availHeight = this.getStage().getHeight() - (SpiderBoard.BOARD_MARGIN.t + SpiderBoard.BOARD_MARGIN.b) * scale;

        ////**TABLEAU PILES**\\\\
        availMargin = {
            l: SpiderBoard.TABLEAU_PILE_MARGIN.l * scale,
            r: SpiderBoard.TABLEAU_PILE_MARGIN.r * scale,
            t: SpiderBoard.TABLEAU_PILE_MARGIN.t,
            b: SpiderBoard.TABLEAU_PILE_MARGIN.b
        };

        var tableauPiles = this.getTableauPiles();

        //find available width if all tableau piles added
        var emptyWidth = availWidth - (tableauPiles.length * PlayingCard.CARD_DIM.w * scale);

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

        y = (SpiderBoard.BOARD_MARGIN.t + availMargin.t) * scale;
        w = PlayingCard.CARD_DIM.w;
        h = availHeight - availMargin.t - PlayingCard.CARD_DIM.h - availMargin.b - SpiderBoard.BOARD_MARGIN.b;

        //arrange piles
        for (i = tableauPiles.length - 1; i >= 0; i--) {
            var tPile = tableauPiles[i];
            x = SpiderBoard.BOARD_MARGIN.l * scale; //board margin
            x += availMargin.l * (i + 1); //all pile left margins
            x += ((PlayingCard.CARD_DIM.w * scale) + availMargin.r) * i; //all pile right margins and card widths
            tPile.setX(x);
            tPile.setY(y);
            tPile.arrangeCards(w, h, animTime, delayFraction * i);
        }

        ////**STOCK PILE**\\\\
        availMargin = {
            l: SpiderBoard.STOCK_PILE_MARGIN.l,
            r: SpiderBoard.STOCK_PILE_MARGIN.r,
            t: SpiderBoard.STOCK_PILE_MARGIN.t,
            b: SpiderBoard.STOCK_PILE_MARGIN.b
        };

        var stockPile = this.getStockPile();
        var nCardsInOriginalPile = this.getDeck().getSize() - 24 - 30;

        var stockExtraW = nCardsInOriginalPile / 10 * 1.5; //for showing how many stacks left
        x = availWidth - (PlayingCard.CARD_DIM.w + availMargin.r + stockExtraW) * scale;
        y = availHeight - (PlayingCard.CARD_DIM.h + availMargin.b) * scale;
        w = PlayingCard.CARD_DIM.w + stockExtraW;
        h = PlayingCard.CARD_DIM.h;
        stockPile.setX(x);
        stockPile.setY(y);
        stockPile.arrangeCards(w, h, animTime, delayFraction, delayFraction);

        ////**FOUNDATION PILES**\\\\
        availMargin = {
            l: SpiderBoard.FOUNDATION_PILES_MARGIN.l,
            r: SpiderBoard.FOUNDATION_PILES_MARGIN.r,
            t: SpiderBoard.FOUNDATION_PILES_MARGIN.t,
            b: SpiderBoard.FOUNDATION_PILES_MARGIN.b
        };

        var foundationPiles = this.getFoundationPiles();

        var startX = SpiderBoard.BOARD_MARGIN.l + availMargin.l * scale;
        y = availHeight - (availMargin.b + PlayingCard.CARD_DIM.h) * scale;
        w = PlayingCard.CARD_DIM.w;
        h = PlayingCard.CARD_DIM.h;

        //arrange piles
        for (i = 0; i < foundationPiles.length; i++) {
            var fPile = foundationPiles[i];
            x = startX + (i * PlayingCard.CARD_DIM.w / 3 * scale);
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
            difficulty = SpiderBoard.DIFFICULTIES.OneSuit;
        }

        this.gameInProgress = false;
        this.recalculateGlobalScale();

        this.getHistory().clear();
        this.setScore(SpiderBoard.START_SCORE);
        this.setMoves(0);
        this.setTimeElapsed(0);

        this._destroyBoard();
        this._buildBoard(difficulty);

        this.getDeck().shuffle();
        this._buildPiles();
        this._attachPileEventHandlers();
        this._addPilesToLayer(this.getLayer());

        this._resetCardFaces();
        this.rescalePiles();
        this.arrangePiles(false);
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
        var scaleX = this.getStage().getWidth() / SpiderBoard.ORIGINAL_DIMENSIONS.w;
        var scaleY = this.getStage().getHeight() / SpiderBoard.ORIGINAL_DIMENSIONS.h;
        var scale = scaleY < scaleX ? scaleY : scaleX;
        this.setGlobalScale(scale);
    };

    SpiderBoard.prototype.onMovesChanged = function (callback) {
        this._onMovesChanged = callback;
    };

    SpiderBoard.prototype.increaseMoves = function (amount) {
        if (amount === undefined) {
            amount = SpiderBoard.MOVES_INCREMENT_BY;
        }
        if (amount !== 0) {
            this.moves += amount;
            this._fireMovesChanged();
        }
    };

    SpiderBoard.prototype.setMoves = function (moves) {
        if (this.moves !== moves) {
            this.moves = moves;
            this._fireMovesChanged();
        }
    };

    SpiderBoard.prototype.onScoreChanged = function (callback) {
        this._onScoreChanged = callback;
    };

    SpiderBoard.prototype.reduceScore = function (amount) {
        if (amount === undefined) {
            amount = SpiderBoard.SCORE_DECREMENT_BY;
        }
        if (amount !== 0) {
            this.score -= amount;
            this._fireScoreChanged();
        }
    };

    SpiderBoard.prototype.increaseScore = function (amount) {
        if (amount !== undefined && amount !== 0) {
            this.score += amount;
            this._fireScoreChanged();
        }
    };

    SpiderBoard.prototype.setScore = function (score) {
        if (this.score !== score) {
            this.score = score;
            this._fireScoreChanged();
        }
    };

    SpiderBoard.prototype.onTimeElapsedChanged = function (callback) {
        this._onTimeElapsedChanged = callback;
    };

    SpiderBoard.prototype.setTimeElapsed = function (time) {
        if (this.timeElapsed !== time) {
            this.timeElapsed = time;
            this._fireTimeElapsedChanged();
        }
    };

    SpiderBoard.prototype.incrementTimeElapsed = function (amount) {
        if (amount === undefined) {
            amount = SpiderBoard.TIME_ELAPSED_INTERVAL;
        }
        if (amount !== 0) {
            this.timeElapsed += amount;
            this._fireTimeElapsedChanged();
        }
    };

    SpiderBoard.prototype.win = function () {
        this.gameInProgress = false;
        alert('You won with a score of ' + this.score + '!');
    };

    //static fields
    SpiderBoard.BOARD_MARGIN = { l: 10, r: 10, t: 10, b: 10 };
    SpiderBoard.TABLEAU_PILE_MARGIN = { l: 2, r: 2, t: 5, b: 0 };
    SpiderBoard.STOCK_PILE_MARGIN = { l: 0, r: 100, t: 0, b: 10 };
    SpiderBoard.FOUNDATION_PILES_MARGIN = { l: 150, r: 0, t: 0, b: 10 };
    SpiderBoard.ORIGINAL_DIMENSIONS = { w: 956, h: 580 };
    SpiderBoard.PLAYER_ACTIONS = {
        'none': 0,
        'dragging': 1
    };
    SpiderBoard.GENERAL_ANIM_TIME = 200;
    SpiderBoard.GENERAL_DELAY_FRACTION = 40;
    SpiderBoard.STOCK_ANIM_TIME = 300;
    SpiderBoard.STOCK_DELAY_FRACTION = 50;
    SpiderBoard.DIFFICULTIES = {
        'OneSuit': 0,
        'TwoSuit': 1,
        'FourSuit': 2
    };
    SpiderBoard.START_SCORE = 500;
    SpiderBoard.MOVES_INCREMENT_BY = 1;
    SpiderBoard.SCORE_INCREMENT_BY_AFTER_COMPLETE_SEQUENCE = 100;
    SpiderBoard.SCORE_DECREMENT_BY = 1;
    SpiderBoard.TIME_ELAPSED_INTERVAL = 1000;

    return SpiderBoard;
})(fSpider.SpiderBoard || {}, window.Kinetic, window.jQuery);