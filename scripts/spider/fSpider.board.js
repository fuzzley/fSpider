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

fSpider.SpiderSettings = fSpider.SpiderSettings || {};

fSpider.Utils = fSpider.Utils || {};
//externals
////Kinetic

fSpider.SpiderBoard = (function (SpiderBoard, Kinetic, undefined) {
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
    var SpiderSettings = fSpider.SpiderSettings;
    var Utils = fSpider.Utils;

    //constructor
    SpiderBoard = function (stage, cardAssetsImage, cardImgDim) {
        this.stage = stage;
        this.deck = new Deck();
        this.history = new History();
        this.settings = new SpiderSettings();
        this.cardAssetsImage = cardAssetsImage;
        this.cardImgDim = cardImgDim;
        this.draggingCards = [];

        //build layer
        this._layerBackground = new Kinetic.Rect({ //add invisible background to layer so event handlers register
            x: -9999,
            y: -9999,
            width: 999999,
            height: 999999
        });
        this.winText = new Kinetic.Text({
            text: 'You won! Congratulations.',
            fill: 'white',
            fontSize: 20,
            visible: false
        });
        this.pilesLayer = new Kinetic.Layer();
        this.pilesLayer.add(this._layerBackground);
        this.pilesLayer.add(this.winText);
        this.stage.add(this.pilesLayer);
        this.animLayer = new Kinetic.Layer();
        this.stage.add(this.animLayer);
        this.attachLayerEventHandlers();

        //build cards
        var cards = [];
        var card;
        for (var i = 0; i < 104; i++) {
            card = new PlayingCard(0, 0);
            card.setAnimationLayer(this.animLayer);
            cards.push(card);
        }
        this.deck.setCards(cards);
        this.attachCardEventHandlers();

        //build piles
        var pile;
        this.tableauPiles = [];
        for (i = 0; i < 10; i++) {
            pile = new TableauPile();
            pile.setVisible(false);
            this.tableauPiles.push(pile);
            this.pilesLayer.add(pile.getGroup());
        }
        this.foundationPiles = [];
        for (i = 0; i < 8; i++) {
            pile = new FoundationPile();
            pile.setVisible(false);
            this.foundationPiles.push(pile);
            this.pilesLayer.add(pile.getGroup());
        }
        this.stockPile = new StockPile();
        this.stockPile.setVisible(false);
        this.pilesLayer.add(this.stockPile.getGroup());
        this.attachPileEventHandlers();
    };

    //static fields
    SpiderBoard.BOARD_MARGIN = { l: 5, r: 5, t: 5, b: 5 };
    SpiderBoard.TABLEAU_PILE_MARGIN = { l: 3, r: 3, t: 0, b: 0 };
    SpiderBoard.STOCK_PILE_MARGIN = { l: 0, r: 100, t: 0, b: 0 };
    SpiderBoard.FOUNDATION_PILES_MARGIN = { l: 150, r: 0, t: 0, b: 0 };
    SpiderBoard.ORIGINAL_DIMENSIONS = { w: 960, h: 580 };
    SpiderBoard.PLAYER_ACTIONS = {
        'none': 0,
        'dragging': 1
    };
    SpiderBoard.GENERAL_ANIM_TIME = 200;
    SpiderBoard.GENERAL_DELAY_FRACTION = 40;
    SpiderBoard.STOCK_ANIM_TIME = 400;
    SpiderBoard.STOCK_DELAY_FRACTION = 100;
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

    //fields
    SpiderBoard.prototype.stage = null;
    SpiderBoard.prototype.deck = null;
    SpiderBoard.prototype.settings = null;
    SpiderBoard.prototype.history = null;
    SpiderBoard.prototype.gameInProgress = false;
    SpiderBoard.prototype.scale = 1;
    SpiderBoard.prototype.score = 0;
    SpiderBoard.prototype.moves = 0;
    SpiderBoard.prototype.timeElapsed = 0;
    SpiderBoard.prototype.winText = null;
    SpiderBoard.prototype.playerAction = SpiderBoard.PLAYER_ACTIONS.none;
    SpiderBoard.prototype.selectedCard = null;
    SpiderBoard.prototype.draggingCards = null;
    SpiderBoard.prototype.tableauPiles = null;
    SpiderBoard.prototype.foundationPiles = null;
    SpiderBoard.prototype.stockPile = null;
    SpiderBoard.prototype.cardAssetsImage = null;
    SpiderBoard.prototype.cardImgDim = null;
    SpiderBoard.prototype._onScoreChanged = null;
    SpiderBoard.prototype._onMovesChanged = null;
    SpiderBoard.prototype._onTimeElapsedChanged = null;
    SpiderBoard.prototype._timeElapsedTimer = null;

    //getters/setters
    SpiderBoard.prototype.getDeck = function () {
        return this.deck;
    };

    SpiderBoard.prototype.getSettings = function () {
        return this.settings;
    };

    SpiderBoard.prototype.getHistory = function () {
        return this.history;
    };

    SpiderBoard.prototype.getStage = function () {
        return this.stage;
    };

    SpiderBoard.prototype.setTableauPlaceHolderImage = function (img, cropSqr) {
        var tPile;
        if (this.tableauPiles != null) {
            for (var i = 0; i < this.tableauPiles.length; i++) {
                tPile = this.tableauPiles[i];
                tPile.loadPlaceHolderImg(img, cropSqr, PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h);
            }
        }
    };

    SpiderBoard.prototype.setCardBackImage = function (img, cropSqr) {
        var cards = this.deck.getCards();
        var length = cards.length;
        for (var i = 0; i < length; i++) {
            cards[i].loadBackImg(img, cropSqr, PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h);
        }
    };

    SpiderBoard.prototype.setSounds = function (sounds) {
        this.sounds = sounds;
        var cards = this.deck.getCards();
        var length = cards.length;
        for (var i = 0; i < length; i++) {
            cards[i].setCardFlipSound(sounds.cardFlip);
        }
    };

    SpiderBoard.prototype.getPiles = function () {
        var piles = [];

        piles = piles.concat(this.tableauPiles || [], this.foundationPiles || []);

        if (this.stockPile != null) {
            piles = piles.concat([this.stockPile]);
        }

        return piles;
    };

    SpiderBoard.prototype.getLayer = function () {
        return this.pilesLayer;
    };

    SpiderBoard.prototype.getGlobalScale = function () {
        return this.scale;
    };

    SpiderBoard.prototype.getStockPile = function () {
        return this.stockPile;
    };

    SpiderBoard.prototype.getTableauPiles = function () {
        return this.tableauPiles || [];
    };

    SpiderBoard.prototype.getFoundationPiles = function () {
        return this.foundationPiles || [];
    };

    //"private" methods
    //build
    SpiderBoard.prototype.resetStatistics = function () {
        var self = this;

        this.setScore(SpiderBoard.START_SCORE);
        this.setMoves(0);
        this.setTimeElapsed(0);
        clearInterval(this._timeElapsedTimer);
        this._timeElapsedTimer = setInterval(function () {
            self._timeElapsedTick(SpiderBoard.TIME_ELAPSED_INTERVAL);
        }, SpiderBoard.TIME_ELAPSED_INTERVAL);
    };

    SpiderBoard.prototype.setupDeck = function (suits) {
        var assetsImg = this.cardAssetsImage;
        var cards = this.deck.getCards();
        var length = cards.length;
        for (var i = 0; i < length; i++) {
            var card = cards[i];
            //setup metadata
            card.setSuit(suits[Math.floor(i / 13)]);
            card.setType(i % 13);
            //load face image
            var crop = {
                x: card.getType() * this.cardImgDim.width,
                y: card.getSuit() * this.cardImgDim.height,
                width: Math.floor(this.cardImgDim.width),
                height: Math.floor(this.cardImgDim.height)
            };
            card.loadFaceImg(assetsImg, crop, PlayingCard.CARD_DIM.w, PlayingCard.CARD_DIM.h);
        }
    };

    SpiderBoard.prototype.setupPiles = function () {
        var i, j, pile;

        var cards = this.deck.getCards();

        //remove all cards from piles first
        var piles = this.getPiles();
        for (i = 0; i < piles.length; i++) {
            piles[i].removeAllCards();
        }

        //TABLEAU PILES
        var k = 0;

//        //4 piles with 6 cards
//        for (i = 0; i < 4; i++) {
//            pile = this.tableauPiles[i];
//            //6 cards
//            for (j = 0; j < 6; j++) {
//                pile.addCard(cards[k]);
//                k++;
//            }
//        }
//
//        //6 piles with 5 cards
//        for (i = 4; i < 10; i++) {
//            pile = this.tableauPiles[i];
//            //5 cards
//            for (j = 0; j < 5; j++) {
//                pile.addCard(cards[k]);
//                k++;
//            }
//        }

        //STOCK PILE
        //rest of cards go into stock pile
        while (k < cards.length) {
            this.stockPile.addCard(cards[k]);
            k++;
        }
    };

    SpiderBoard.prototype.attachLayerEventHandlers = function () {
        var self = this;
        this.pilesLayer.on('touchend mouseup', function (evt) {
            self._layerTouch(evt);
        });
    };

    SpiderBoard.prototype.attachCardEventHandlers = function () {
        var self = this;
        var cards = this.deck.getCards();
        cards.forEach(function (card) {
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

    SpiderBoard.prototype.attachPileEventHandlers = function () {
        var self = this;
        this.tableauPiles.forEach(function (tPile) {
            var ph = tPile.getPlaceHolderImg();
            if (ph != null) {
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
    SpiderBoard.prototype.detachLayerEventHandlers = function () {
        this.pilesLayer.off('touchend mouseup');
    };

    SpiderBoard.prototype.detachCardEventHandlers = function () {
        var cards = this.deck.getCards();
        cards.forEach(function (card) {
            card.off('dragstart');
            card.off('dragmove');
            card.off('dragend');
            card.off('touchend mouseup');
            card.off('mouseover');
            card.off('mouseout');
        });
    };

    SpiderBoard.prototype.detachPileEventHandlers = function () {
        this.tableauPiles.forEach(function (tPile) {
            var ph = tPile.getPlaceHolderImg();
            if (ph !== undefined) {
                ph.off('touchend mouseup');
                ph.off('mouseover');
                ph.off('mouseout');
            }
        });
    };

    //game logic
    SpiderBoard.prototype.tryHandleCompleteSequence = function (tPile, callback) {
        var completeSequence = tPile.getCompleteSequence();
        if (completeSequence != null && completeSequence.length > 0) {
            var fPiles = this.foundationPiles;
            var fLen = fPiles.length;
            var fPile;
            for (var i = 0; i < fLen; i++) {
                fPile = fPiles[i];
                if (fPile.getSize() === 0) {
                    //increase score
                    this.increaseScore(SpiderBoard.SCORE_INCREMENT_BY_AFTER_COMPLETE_SEQUENCE);
                    var scoreChangeAction = new ScoreChangeAction(this, SpiderBoard.SCORE_INCREMENT_BY_AFTER_COMPLETE_SEQUENCE);
                    this.history.registerAction(scoreChangeAction);

                    var self = this;
                    //transfer cards
                    this.transferCardsFromTableauToFoundation(completeSequence, tPile, fPile, function () {
                        fPile.reverseCards();
                        self.redraw();
                        if (callback != null) {
                            callback(true);
                        }
                    });

                    //merge last 3 actionsets in history (move to tableau, score increase, move to foundation)
                    this.history.mergeActionSets(this.history.cursor - 3, 3);

                    return true;
                }
            }
        }

        if (callback != null) {
            callback(false);
        }

        return false; //either no sequence or no empty foundation piles
    };

    SpiderBoard.prototype.canTakeFromStockPile = function () {
        var tPiles = this.tableauPiles;
        var tSize;
        for (var i = 0; i < tPiles.length; i++) {
            var tPile = tPiles[i];
            tSize = tPile.getSize();
            if (tSize === 0 || tPile.getCardAt(tSize - 1).isFaceUp() !== true) { //empty or last card is face down
                return false;
            }
        }
        return true;
    };

    SpiderBoard.prototype.transferCardsFromTableau = function (cards, fromPile, toPile, updateStats, callback) {
        if (cards == null || cards.length <= 0) {
            if (callback != null) {
                callback();
            }
            return;
        }

        var self = this;

        var flipped = cards.length > 0
            && fromPile.getSize() - cards.length > 0
            && fromPile.getCardAt(fromPile.getCards().indexOf(cards[0]) - 1).isFaceUp() !== true;
        //move cards to new pile
        toPile.transferCards(cards, this.settings, function () {
            //flip over last card of original pile and refresh
            fromPile.resetListening();
            fromPile.resetDraggable();

            //refresh new pile
            toPile.resetListening();
            toPile.resetDraggable();

            if (updateStats === true) {
                //modify statistics
                self.reduceScore();
                self.increaseMoves();
            }

            self.registerTransferInHistory(cards, fromPile, toPile, flipped);

            if (callback != null) {
                callback();
            }
        });
        fromPile.setLastCardFaceUp(true, this.settings);
    };

    SpiderBoard.prototype.transferCardsFromTableauToTableau = function (cards, fromPile, toPile, callback) {
        if (cards == null || cards.length <= 0) {
            if (callback != null) {
                callback();
            }
            return;
        }

        var self = this;

        //transfer cards
        this.transferCardsFromTableau(cards, fromPile, toPile, true, function () {

            //check for a complete sequence
            self.tryHandleCompleteSequence(toPile, function (result) {
                if (result === true && self.checkForWin() === true) {
                    self.win();
                }
                if (callback != null) {
                    callback();
                }
            });

        });
    };

    SpiderBoard.prototype.transferCardsFromTableauToFoundation = function (cards, fromPile, toPile, callback) {
        if (cards == null || cards.length <= 0) {
            if (callback != null) {
                callback();
            }
            return;
        }

        //transfer cards
        this.transferCardsFromTableau(cards, fromPile, toPile, true, callback);
    };

    SpiderBoard.prototype.registerTransferInHistory = function (cards, fromPile, toPile, cardFlipped) {
        var actionSet = new ActionSet();
        var transferAction = new TransferCardsAction(cards, fromPile, toPile);
        actionSet.addAction(transferAction);
        var fromLen = fromPile.getSize();
        if (cardFlipped === true && fromLen > 0) {
            var flipAction = new FlipCardAction(fromPile.getCardAt(fromLen - 1), true);
            actionSet.addAction(flipAction);
        }
        this.history.registerActionSet(actionSet);
    };

    SpiderBoard.prototype.drawFromStockPile = function (flipAlso, firstPileN, amount, registerHistory, callback) {
        if (amount <= 0) {
            return;
        }

        var actionSet = new ActionSet();

        var delayFraction = SpiderBoard.STOCK_DELAY_FRACTION;

        var nCards = this.stockPile.getSize();
        var tPiles = this.tableauPiles;
        var transferTo = [];
        var card, pile, flipAction, transferAction;

        for (var i = 0; i < amount; i++) {
            pile = tPiles[(firstPileN + i) % tPiles.length];
            card = this.stockPile.getCardAt(nCards - i - 1);

            if (registerHistory === true) {
                flipAction = new FlipCardAction(card, true);
                transferAction = new TransferCardsAction([card], this.stockPile, pile);
                actionSet.addAction(flipAction);
                actionSet.addAction(transferAction);
            }

            transferTo.push(pile);
        }

        var settings = Utils.extendProps({
                animDelay: delayFraction,
                animTime: SpiderBoard.STOCK_ANIM_TIME },
            this.settings);
        this.stockPile.drawCards(transferTo, flipAlso === true, settings, callback);

        if (actionSet.actions.length > 0) {
            this.history.registerActionSet(actionSet);
        }
    };

    SpiderBoard.prototype.prepareCardForDrag = function (card) {
        this.draggingCards.length = 0;
        var pile = card.getPile();

        this.selectCard(card, false);
        var canMoveToAnimationLayer = card.tryMoveToAnimationLayer();
        if (canMoveToAnimationLayer !== true && pile != null) {
            pile.moveToTop();
        }
        this.draggingCards.push(card);

        var i, length;
        if (pile != null) {
            var cards = pile.getCards();
            var index = cards.indexOf(card);
            length = cards.length;
            for (i = index + 1; i < length; i++) {
                if (canMoveToAnimationLayer === true) {
                    cards[i].tryMoveToAnimationLayer();
                }
                this.draggingCards.push(cards[i]);
            }
        }
    };

    SpiderBoard.prototype.stopDraggingCard = function (card, pos) {
        var length = this.draggingCards.length;
        for (var i = 0; i < length; i++) {
            this.draggingCards[i].tryMoveToPileGroup();
        }
        this.draggingCards.length = 0;

        //capture original pile for later
        var originalPile = card.getPile();

        //make sure we can add card to pile
        var tPile = this.findOverlappingTableauPile(card, pos);
        if (tPile != null) {
            this.deselectCard(this.selectedCard, false, Utils.extendProps({ animate: false }, this.settings));
            this.transferCardsFromTableauToTableau(originalPile.getCardAndCardsAfter(card), originalPile, tPile);
        } else {
            this.arrangeTableauPile(card.getPile());
        }

        if (this.settings.animate !== true) {
            this.redraw();
        }

        this.playerAction = SpiderBoard.PLAYER_ACTIONS.none;
    };

    SpiderBoard.prototype.checkForWin = function () {
        var i;
        var win = true;

        //check tableau piles
        var tPiles = this.tableauPiles;
        var tLen = tPiles.length;
        for (i = 0; i < tLen; i++) {
            win = win && tPiles[i].getSize() === 0;
        }

        //check stock pile
        win = win && this.stockPile.getSize() === 0;

        //check foundation piles
        var fPiles = this.foundationPiles;
        var fLen = fPiles.length;
        for (i = 0; i < fLen; i++) {
            win = win && fPiles[i].getSize() > 0;
        }

        return win;
    };

    SpiderBoard.prototype.win = function () {
        this.gameInProgress = false;
        clearInterval(this._timeElapsedTimer);
        this.winText.setVisible(true);
        this.redraw();
    };

    //helpers
    SpiderBoard.prototype.getSuitsForDifficulty = function (difficulty) {
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

    SpiderBoard.prototype.findOverlappingTableauPile = function (card, touchPoint) {
        var overlapPile = null;

        //get the card boundaries
        var cardRect = {
            x: card.getAbsolutePosition().x,
            y: card.getAbsolutePosition().y,
            width: card.getWidth(this.scale),
            height: card.getHeight(this.scale)
        };

        var tPiles = this.tableauPiles;
        var bounds, lastCard, otherCenter, placeHolder, tDist, tPile;
        var dist = null;
        for (var i = 0; i < tPiles.length; i++) { //pick best overlapping pile
            tPile = tPiles[i];
            //some simple conditions to see if we even care about this pile
            if (tPile === card.getPile() || tPile.canAddCard(card) !== true) { //is owner or can't add card
                continue; //just skip to the next pile
            } //else
            //calculate this pile's dimensions
            bounds = {
                x: tPile.getX(),
                y: tPile.getY(),
                width: tPile.getWidth(this.scale),
                height: tPile.getHeight(this.scale)
            };
            //check if card/pile intersect
            if (Utils.doRectsIntersect(cardRect, bounds) === true) {
                //try to get the center point of the last card in pile
                lastCard = tPile.getLastCard();
                if (lastCard !== null) {
                    otherCenter = lastCard.getAbsoluteCenter(this.scale);
                } else { //otherwise get center point of place holder image
                    placeHolder = tPile.getPlaceHolderImg();
                    otherCenter = {
                        x: placeHolder.getAbsolutePosition().x + (placeHolder.getWidth() / 2 * this.scale),
                        y: placeHolder.getAbsolutePosition().y + (placeHolder.getHeight() / 2 * this.scale)
                    };
                }
                //find distance between touch point and center
                tDist = Utils.distance(touchPoint, otherCenter);
                if (dist == null || dist > tDist) { //if it's the minimum so far
                    dist = tDist;
                    overlapPile = tPile; //accept this pile (for now)
                } //keep looking for a more fitting pile
            }
        }

        return overlapPile;
    };

    SpiderBoard.prototype.deselectCard = function (card, tellParent, settings) {
        if (settings == null) {
            settings = this.settings;
        }

        if (card == null) {
            card = this.selectedCard;
        }
        if (card != null) {
            card.setSelected(false, tellParent, settings);
            if (this.selectedCard === card) {
                this.selectedCard = null;
            }
        }
    };

    SpiderBoard.prototype.selectCard = function (card, tellParent, settings) {
        if (settings == null) {
            settings = this.settings;
        }

        card.setSelected(true, tellParent, settings);
        this.selectedCard = card;
    };

    SpiderBoard.prototype._fireScoreChanged = function () {
        if (this._onScoreChanged != null) {
            this._onScoreChanged(this.score);
        }
    };

    SpiderBoard.prototype._fireMovesChanged = function () {
        if (this._onMovesChanged != null) {
            this._onMovesChanged(this.moves);
        }
    };

    SpiderBoard.prototype._fireTimeElapsedChanged = function () {
        if (this._onTimeElapsedChanged != null) {
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

        if (this.selectedCard != null) {
            if (this.playerAction === SpiderBoard.PLAYER_ACTIONS.dragging) {
                this.stopDraggingCard(this.selectedCard, { x: evt.layerX, y: evt.layerY });
            } else {
                this.deselectCard(this.selectedCard, true);
                this.redraw();
            }
        } else {
            this.stopAllAnimations();
        }
    };

    SpiderBoard.prototype._cardDragStart = function (evt, card) {
        this.playerAction = SpiderBoard.PLAYER_ACTIONS.dragging;
        if (this.selectedCard != null) {
            var tellParent = this.settings.animate === true && this.selectedCard.getPile() !== card.getPile();
            this.deselectCard(this.selectedCard, tellParent);
        }
        this.prepareCardForDrag(card);
    };

    SpiderBoard.prototype._cardDragMove = function (evt, card) {
        var tMargin = 20;
        var length = this.draggingCards.length;
        if (length > 2) {
            tMargin = this.draggingCards[2].getY() - this.draggingCards[1].getY();
        }
        for (var i = 0; i < length; i++) {
            this.draggingCards[i].setPosition(card.getX(), card.getY() + (i * tMargin));
        }
        this.redraw(this.animLayer);
    };

    SpiderBoard.prototype._cardDragEnd = function (evt, card) {
        this.stopDraggingCard(card, { x: evt.layerX, y: evt.layerY });
        evt.handledByCardTouch = true;
    };

    SpiderBoard.prototype._cardTouch = function (evt, card) {
        var pile = card.getPile();
        var sCard = this.selectedCard;
        var sPile;
        if (card.isFaceUp() === true) {
            if (sCard === card) {
                //just deselect it
                if (this.playerAction !== SpiderBoard.PLAYER_ACTIONS.dragging) {
                    this.deselectCard(sCard, true);
                }
            } else if (sCard != null) {
                sPile = sCard.getPile();
                var cardIndex = pile.getCards().indexOf(card);
                //if touched card is the last card in its pile and selected card is allowed to be added
                if (cardIndex === pile.getSize() - 1 && pile.canAddCard(sCard) === true) {
                    this.deselectCard(this.selectedCard, false);
                    this.transferCardsFromTableauToTableau(sPile.getCardAndCardsAfter(sCard), sPile, pile);
                } else {
                    this.deselectCard(sCard, true);
                }
            } else if (pile.canRemoveCard(card) === true) {
                this.selectCard(card, true);
            }
            if (this.settings.animate !== true) {
                this.redraw();
            }

            evt.handledByCardTouch = true; //prevent bubbled event to trigger "deselect card"
        } else {
            if (pile === this.stockPile) {
                if (this.canTakeFromStockPile() === true) {
                    this.drawFromStockPile(true, 0, this.tableauPiles.length, true);
                    evt.handledByCardTouch = true; //prevent bubbled event to trigger "deselect card"
                }
            } else {
                card.setFaceUp(true, this.settings);
                if (pile != null) {
                    pile.resetDraggable();
                    pile.resetListening();
                }
                if (this.settings.animate !== true) {
                    this.redraw();
                }
            }
        }
    };

    SpiderBoard.prototype._cardMouseOver = function (evt, card) {
        card.setHovering(true);
        this.redraw(this.pilesLayer);
    };

    SpiderBoard.prototype._cardMouseOut = function (evt, card) {
        card.setHovering(false);
        this.redraw(this.pilesLayer);
    };

    SpiderBoard.prototype._tableauPlaceHolderTouch = function (evt, tPile) {
        var card = this.selectedCard;
        if (card != null) {
            //if selected card is allowed to be added
            if (tPile.canAddCard(card) === true) {
                this.deselectCard(this.selectedCard, false);
                var pile = card.getPile();
                this.transferCardsFromTableauToTableau(pile.getCardAndCardsAfter(card), pile, tPile);
            } else {
                this.deselectCard(card, true);
            }
        }
    };

    SpiderBoard.prototype._tableauPlaceHolderMouseOver = function (evt, tPile) {
        tPile.setHovering(true);
        this.redraw(this.pilesLayer);
    };

    SpiderBoard.prototype._tableauPlaceHolderMouseOut = function (evt, tPile) {
        tPile.setHovering(false);
        this.redraw(this.pilesLayer);
    };

    //public methods
    SpiderBoard.prototype.stopAllAnimations = function () {
        var cards = this.deck.getCards();
        var length = cards.length;
        for (var i = 0; i < length; i++) {
            cards[i].stopAllAnimations();
        }
    };

    SpiderBoard.prototype.redraw = function (layer) {
        if (layer == null) {
            this.pilesLayer.draw();
            this.animLayer.draw();
        } else {
            layer.draw();
        }
    };

    SpiderBoard.prototype.startNewGame = function (difficulty) {
        this.startGame(true, difficulty);
    };

    SpiderBoard.prototype.restartGame = function (difficulty) {
        this.startGame(false, difficulty);
    };

    SpiderBoard.prototype.startGame = function (shuffle, difficulty) {
        if (difficulty === undefined) {
            difficulty = SpiderBoard.DIFFICULTIES.OneSuit;
        }

        var piles = this.getPiles();

        this.gameInProgress = false;

        this.resetStatistics();
        this.winText.setVisible(false);
        this.history.clear();

        if (shuffle === true) {
            this.setupDeck(this.getSuitsForDifficulty(difficulty));
            this.deck.shuffle();
        }

        this.setupPiles();
        piles.forEach(function (pile) {
            pile.setVisible(true);
            pile.resetCardFaces();
        });
        this.arrangePiles(Utils.extendProps({ animate: false }, this.settings));
        var self = this;
        this.drawFromStockPile(false, 0, 44, false, function () {
            self.drawFromStockPile(true, 0, 10, false);
            self.redraw();
        });

        this.gameInProgress = true;
    };

    SpiderBoard.prototype.canUndo = function () {
        return this.history.canUndo() === true;
    };

    SpiderBoard.prototype.undo = function () {
        if (this.history.canUndo() === true) {
            var actionSet = this.history.undo(this.settings);
            if (actionSet != null) {
                this.reduceScore();
                this.increaseMoves();
            }
            this.redraw();
        }
    };

    SpiderBoard.prototype.canRedo = function () {
        return this.history.canRedo() === true;
    };

    SpiderBoard.prototype.redo = function () {
        if (this.history.canRedo() === true) {
            var actionSet = this.history.redo(this.settings);
            if (actionSet != null) {
                this.reduceScore();
                this.increaseMoves();
            }
            this.redraw();
        }
    };

    SpiderBoard.prototype.arrangeTableauPile = function (pile, settings) {
        if (settings == null) {
            settings = this.settings;
        }

        var boardMargin = {
            l: SpiderBoard.BOARD_MARGIN.l * this.scale,
            r: SpiderBoard.BOARD_MARGIN.r * this.scale,
            t: SpiderBoard.BOARD_MARGIN.t * this.scale,
            b: SpiderBoard.BOARD_MARGIN.b * this.scale
        };

        var cardDim = {
            w: PlayingCard.CARD_DIM.w * this.scale,
            h: PlayingCard.CARD_DIM.h * this.scale
        };

        var availHeight = this.stage.getHeight() - (boardMargin.t + boardMargin.b);
        var availMargin = {
            l: SpiderBoard.TABLEAU_PILE_MARGIN.l * this.scale,
            r: SpiderBoard.TABLEAU_PILE_MARGIN.r * this.scale,
            t: SpiderBoard.TABLEAU_PILE_MARGIN.t * this.scale,
            b: SpiderBoard.TABLEAU_PILE_MARGIN.b * this.scale
        };

        var w = PlayingCard.CARD_DIM.w;
        var h = availHeight - (availMargin.t - cardDim.h - availMargin.b - boardMargin.b) / this.scale;

        pile.setAvailableDimensions(w, h);
        pile.arrangeCards(settings);
    };

    SpiderBoard.prototype.arrangePiles = function (settings) {
        if (settings == null) {
            settings = this.settings;
        }

        var i, x, y, w, h, availMargin, pile;

        var boardMargin = {
            l: SpiderBoard.BOARD_MARGIN.l * this.scale,
            r: SpiderBoard.BOARD_MARGIN.r * this.scale,
            t: SpiderBoard.BOARD_MARGIN.t * this.scale,
            b: SpiderBoard.BOARD_MARGIN.b * this.scale
        };

        var cardDim = {
            w: PlayingCard.CARD_DIM.w * this.scale,
            h: PlayingCard.CARD_DIM.h * this.scale
        };

        //find available height/width, given board margin
        var availWidth = this.stage.getWidth() - (boardMargin.l + boardMargin.r);
        var availHeight = this.stage.getHeight() - (boardMargin.t + boardMargin.b);

        ////**TABLEAU PILES**\\\\
        availMargin = {
            l: SpiderBoard.TABLEAU_PILE_MARGIN.l * this.scale,
            r: SpiderBoard.TABLEAU_PILE_MARGIN.r * this.scale,
            t: SpiderBoard.TABLEAU_PILE_MARGIN.t * this.scale,
            b: SpiderBoard.TABLEAU_PILE_MARGIN.b * this.scale
        };

        var tSize = this.tableauPiles.length;

        //find available width if all tableau piles added
        var emptyWidth = availWidth - (tSize * (cardDim.w + availMargin.l + availMargin.r));

        //find amount of extra room that can be allotted to each pile
        var emptyMargin = emptyWidth / 2;

        y = (boardMargin.t + availMargin.t);
        w = cardDim.w / this.scale;
        h = availHeight - (availMargin.t - cardDim.h - availMargin.b - boardMargin.b) / this.scale;

        var stillLooping = true;
        var expectedCallbacks = 0;
        var onCallback = function () {
            expectedCallbacks--;
            if (stillLooping !== true && expectedCallbacks <= 0 && callback != null) {
                callback();
            }
        };

        //arrange piles
        for (i = tSize - 1; i >= 0; i--) {
            pile = this.tableauPiles[i];
            x = boardMargin.l + emptyMargin;
            x += (cardDim.w + availMargin.r) * i;
            x += availMargin.l * (i + 1);
            pile.setX(x);
            pile.setY(y);
            pile.setAvailableDimensions(w, h);
            pile.arrangeCards(settings, onCallback);
        }

        ////**STOCK PILE**\\\\
        availMargin = {
            l: SpiderBoard.STOCK_PILE_MARGIN.l * this.scale,
            r: SpiderBoard.STOCK_PILE_MARGIN.r * this.scale,
            t: SpiderBoard.STOCK_PILE_MARGIN.t * this.scale,
            b: SpiderBoard.STOCK_PILE_MARGIN.b * this.scale
        };

        var stacks = this.stockPile.getSize() / this.tableauPiles.length;
        var stockExtraW = stacks; //for showing how many stacks left
        if (stockExtraW < stacks * 6) {
            stockExtraW = stacks * 6;
        }
        x = availWidth - (cardDim.w + availMargin.r + stockExtraW);
        y = availHeight - (cardDim.h + availMargin.b);
        w = PlayingCard.CARD_DIM.w + stockExtraW;
        h = PlayingCard.CARD_DIM.h;
        this.stockPile.setX(x);
        this.stockPile.setY(y);
        this.stockPile.setAvailableDimensions(w, h);
        this.stockPile.arrangeCards(settings);

        ////**FOUNDATION PILES**\\\\
        availMargin = {
            l: SpiderBoard.FOUNDATION_PILES_MARGIN.l * this.scale,
            r: SpiderBoard.FOUNDATION_PILES_MARGIN.r * this.scale,
            t: SpiderBoard.FOUNDATION_PILES_MARGIN.t * this.scale,
            b: SpiderBoard.FOUNDATION_PILES_MARGIN.b * this.scale
        };

        var startX = boardMargin.l + availMargin.l;
        y = availHeight - (availMargin.b + cardDim.h);
        w = PlayingCard.CARD_DIM.w;
        h = PlayingCard.CARD_DIM.h;

        //arrange piles
        var fSize = this.foundationPiles.length;
        for (i = 0; i < fSize; i++) {
            pile = this.foundationPiles[i];
            x = startX + (i * cardDim.w / 3);
            pile.setX(x);
            pile.setY(y);
            pile.setAvailableDimensions(w, h);
            pile.arrangeCards(settings);
        }
    };

    SpiderBoard.prototype.rescalePiles = function () {
        var scale = this.scale;
        var piles = this.getPiles();
        piles.forEach(function (pile) {
            pile.setScale(scale);
        });
    };

    SpiderBoard.prototype.isGameInProgress = function () {
        return this.gameInProgress;
    };

    SpiderBoard.prototype.recalculateGlobalScale = function () {
        var origScale = this.scale;
        var scaleX = this.stage.getWidth() / SpiderBoard.ORIGINAL_DIMENSIONS.w;
        var scaleY = this.stage.getHeight() / SpiderBoard.ORIGINAL_DIMENSIONS.h;
        var scale = scaleY < scaleX ? scaleY : scaleX;
        if (origScale !== scale) {
            this.scale = scale;
            this.animLayer.setScale(this.scale);
            this.rescalePiles();
            this.arrangePiles(Utils.extendProps({ animate: false }, this.settings));
            this.winText.setScale(this.scale);
            this.winText.setPosition(
                this.stage.getWidth() / 2 - this.winText.getWidth() / 2 * this.scale,
                this.stage.getHeight() / 2 - this.winText.getHeight() / 2 * this.scale
            );
        }
    };

    SpiderBoard.prototype.onMovesChanged = function (callback) {
        this._onMovesChanged = callback;
    };

    SpiderBoard.prototype.increaseMoves = function (amount) {
        if (amount == null) {
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
        if (amount == null) {
            amount = SpiderBoard.SCORE_DECREMENT_BY;
        }
        if (amount !== 0) {
            this.score -= amount;
            this._fireScoreChanged();
        }
    };

    SpiderBoard.prototype.increaseScore = function (amount) {
        if (amount != null && amount !== 0) {
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
        if (amount == null) {
            amount = SpiderBoard.TIME_ELAPSED_INTERVAL;
        }
        if (amount !== 0) {
            this.timeElapsed += amount;
            this._fireTimeElapsedChanged();
        }
    };

    return SpiderBoard;
})(fSpider.SpiderBoard || {}, window.Kinetic);