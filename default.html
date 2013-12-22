<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
    <title>Fuzzley - Spider Solitaire</title>
    <link href="content/font_awesome/css/font-awesome.css" rel="stylesheet"/>
    <link href="content/site.css" rel="stylesheet"/>
    <link href="content/spider.css" rel="stylesheet"/>
</head>
<body>
<div id="canvas-wrap">
</div>
<div id="ui-container">
    <div id="score-display" class="lite-green" style="display: none;" data-bind="text: board.score"></div>
    <div id="moves-display" class="lite-red" style="display: none;" data-bind="text: board.moves"></div>
    <div id="time-display" class="lite-yellow" style="display: none;" data-bind="timeShortText: board.timeElapsed"></div>
    <div id="options-wrap" style="display: none;">
        <div>
            <label for="animate-checkbox" style="float: left;">Animate</label>
            <input id="animate-checkbox" name="animate-checkbox" style="float: right;" type="checkbox" data-bind="checked: gameSettings.animate" />
        </div>
        <div class="clear"></div>
        <div>
            <label for="sound-checkbox" style="float: left;">Sound</label>
            <input id="sound-checkbox" name="sound-checkbox" style="float: right;" type="checkbox" data-bind="checked: gameSettings.volume" />
        </div>
        <div class="clear"></div>
    </div>
    <div id="game-ctrls-wrap" style="display: none;">
        <button id="new-game-btn">New Game</button>
        <label for="difficulty-select"></label>
        <select id="difficulty-select" name="difficulty-select"
                data-bind="options: gameSettings.difficultyOptions, optionsText: 'text', optionsValue: 'value', value: gameSettings.difficulty">
        </select>
        <button id="restart-btn" data-bind="enable: board.gameInProgress">Restart</button>
        <button id="undo-btn" data-bind="enable: gameHistory.canUndo">Undo (Ctrl+Z)</button>
        <button id="redo-btn" data-bind="enable: gameHistory.canRedo">Redo (Ctrl+Y)</button>
    </div>
    <div id="global-settings-open-wrap">
        <button id="global-settings-open-btn"><i class="icon-cogs"></i></button>
    </div>
    <div id="dim-overlay" style="display: none;"></div>
    <div id="global-options-dlg" style="display: none;">
        <div id="global-options-header">
            <div style="float: left;">Options</div>
            <i id="global-options-close-btn" class="icon-remove" style="float: right;"></i>
        </div>
        <div class="clear"></div>
        <fieldset class="global-options-section">
            <legend>Game</legend>
            <div style="text-align: center;">
                <button id="glbl-game-new-game-btn">New Game</button>
            </div>
            <div class="clear"></div>
            <div style="text-align: center;">
                <button id="glbl-game-restart-btn" data-bind="enable: board.gameInProgress">Restart Game</button>
            </div>
            <div class="clear"></div>
        </fieldset>
        <fieldset class="global-options-section">
            <legend>Settings</legend>
            <div>
                <label for="glbl-game-difficulty-select" style="float: left;">Difficulty</label>
                <select id="glbl-game-difficulty-select" name="glbl-game-difficulty-select" style="float: right;"
                        data-bind="options: gameSettings.difficultyOptions, optionsText: 'text',
                        optionsValue: 'value', value: gameSettings.difficulty">
                </select>
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-stng-animate-chk" style="float: left;">Animate</label>
                <input id="glbl-stng-animate-chk" name="glbl-stng-animate-chk" style="float: right;" type="checkbox"
                       data-bind="checked: gameSettings.animate" />
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-stng-sound-chk" style="float: left;">Sound</label>
                <input id="glbl-stng-sound-chk" name="glbl-stng-sound-chk" style="float: right;" type="checkbox"
                       data-bind="checked: gameSettings.volume" />
            </div>
            <div class="clear"></div>
        </fieldset>
        <fieldset class="global-options-section">
            <legend>Windows</legend>
            <div>
                <label for="glbl-wnd-score-chk" style="float: left;">Score</label>
                <input id="glbl-wnd-score-chk" name="glbl-wnd-score-chk" style="float: right;" type="checkbox" data-bind="checked: uiSettings.windows.score.vm.isOpen"/>
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-wnd-moves-chk" style="float: left;">Moves</label>
                <input id="glbl-wnd-moves-chk" name="glbl-wnd-moves-chk" style="float: right;" type="checkbox"  data-bind="checked: uiSettings.windows.moves.vm.isOpen"/>
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-wnd-time-chk" style="float: left;">Time</label>
                <input id="glbl-wnd-time-chk" name="glbl-wnd-time-chk" style="float: right;" type="checkbox"  data-bind="checked: uiSettings.windows.time.vm.isOpen"/>
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-wnd-options-chk" style="float: left;">Options</label>
                <input id="glbl-wnd-options-chk" name="glbl-wnd-options-chk" style="float: right;" type="checkbox"
                       data-bind="checked: uiSettings.windows.options.vm.isOpen"/>
            </div>
            <div class="clear"></div>
            <div>
                <label for="glbl-wnd-game-chk" style="float: left;">Game</label>
                <input id="glbl-wnd-game-chk" name="glbl-wnd-game-chk" style="float: right;" type="checkbox"  data-bind="checked: uiSettings.windows.game.vm.isOpen"/>
            </div>
            <div class="clear"></div>
        </fieldset>
    </div>
</div>
<div id="canvas-resources">
    <!-- cards -->
    <img id="playing-card-assets-large" src="content/art_assets/cards/playing_card_assets_large.png"/>

    <!-- miscellaneous -->
    <img id="tableau-ph" src="content/art_assets/cards/tableau_ph.png"/>
</div>

<script src="scripts/jquery/jquery-2.0.3.min.js"></script>
<script src="scripts/knockout/knockout-3.0.0.js"></script>
<script src="scripts/kinetic/kinetic-v4.7.4.min.js"></script>
<script src="scripts/howler/howler.js"></script>

<script src="scripts/spider/fSpider.ui.draggable.js"></script>
<script src="scripts/spider/fSpider.ui.modal.js"></script>

<script src="scripts/spider/fSpider.utils.js"></script>
<script src="scripts/spider/fSpider.vmHub.js"></script>
<script src="scripts/spider/fSpider.history.js"></script>
<script src="scripts/spider/fSpider.settings.js"></script>
<script src="scripts/spider/fSpider.card.js"></script>
<script src="scripts/spider/fSpider.card.deck.js"></script>
<script src="scripts/spider/fSpider.card.groups.js"></script>
<script src="scripts/spider/fSpider.board.js"></script>
<script src="scripts/spider/fSpider.debug.js"></script>

<script type="text/javascript">
var fSpider = fSpider || {};
fSpider.board = null;
fSpider.deck = null;
fSpider.stage = null;
fSpider.ctrlKeyCode = 17;
fSpider.ctrlDown = false;
fSpider.undoKey = 'Z';
fSpider.redoKey = 'Y';

fSpider.init = function () {
    var stage = fSpider.initStage();
    var board = fSpider.initBoard(stage);
    fSpider.initUI(stage, board);
};

fSpider.initStage = function () {
    var canvasWrap = $('#canvas-wrap');
    fSpider.stage = new Kinetic.Stage({
        container: 'canvas-wrap',
        width: canvasWrap.width(),
        height: canvasWrap.height()
    });
    return fSpider.stage;
};

fSpider.initBoard = function (stage) {
    //load assets
    var cardAssetsImg = $('#playing-card-assets-large').get(0);
    var cardDim = {
        width: cardAssetsImg.naturalWidth / 13, // number of types
        height: cardAssetsImg.naturalHeight / 5 // number of suits + back images row
    };

    var soundFolder = 'content/sound_assets/card_sounds/';
    var sounds = {};
    sounds.cardFlip = new Howl({
        urls: [soundFolder + 'cardflip.ogg', soundFolder + 'cardflip.mp3', soundFolder + 'cardflip.wav']
    });

    //build new board
    fSpider.board = new fSpider.SpiderBoard(stage, cardAssetsImg, cardDim);
    var board = fSpider.board;
    board.recalculateGlobalScale();

    ////set image assets
    board.setCardBackImage(cardAssetsImg, {
        x: 0,
        y: cardDim.height * 4, // the back image is on the last row of the image (after the 4 rows of different suits)
        width: cardDim.width,
        height: cardDim.height
    });
    board.setTableauPlaceHolderImage($('#tableau-ph').get(0));
    ////set sound assets
    board.setSounds(sounds);

    return board;
};

fSpider.initUI = function (stage, board) {
    fSpider.uiSettings = new fSpider.UISettings();

    //setup external ui
    fSpider.initGameControls(fSpider.uiSettings);
    fSpider.initOptionsPane();

    fSpider.vmHub.registerVM('board', board.vm);
    fSpider.vmHub.registerVM('gameSettings', board.settings.vm);
    fSpider.vmHub.registerVM('gameHistory', board.history.vm);
    fSpider.vmHub.registerVM('uiSettings', fSpider.uiSettings);
    fSpider.vmHub.bind($('#ui-container').get(0));

    //in case of resize, notify board
    $(window).resize(function () {
        var canvasWrap = $('#canvas-wrap');
        stage.setWidth(canvasWrap.width());
        stage.setHeight(canvasWrap.height());
        board.recalculateGlobalScale();
        board.redraw();
    });

    $(document).on('keydown', function (evt) {
        if (evt.keyCode === fSpider.ctrlKeyCode) {
            fSpider.ctrlDown = true;
        } else if (String.fromCharCode(evt.keyCode) === fSpider.undoKey) {
            if (fSpider.ctrlDown === true) {
                fSpider.board.undo();
            }
        } else if (String.fromCharCode(evt.keyCode) === fSpider.redoKey) {
            if (fSpider.ctrlDown === true) {
                fSpider.board.redo();
            }
        }
    });

    $(document).on('keyup', function (evt) {
        if (evt.keyCode === fSpider.ctrlKeyCode) {
            fSpider.ctrlDown = false;
        }
    });
};

fSpider.initGameControls = function (settings) {
    fSpider.windows = settings.loadWindows();

    $('.modal-content').show();
    $('#new-game-btn').on('click', function () {
        fSpider.startNewGame();
    });
    $('#restart-btn').on('click', function () {
        fSpider.restartGame();
    });
    $('#undo-btn').on('click', function () {
        fSpider.board.undo();
    });
    $('#redo-btn').on('click', function () {
        fSpider.board.redo();
    });
};

fSpider.initOptionsPane = function (settings) {
    $('#global-settings-open-btn').on('click', function () {
        fSpider.openOptionsPane(settings);
    });

    $('#global-options-close-btn').on('click', function () {
        fSpider.closeOptionsPane();
    });

    $('#glbl-game-new-game-btn').on('click', function () {
        if (fSpider.startNewGame() === true) {
            fSpider.closeOptionsPane();
        }
    });
    $('#glbl-game-restart-btn').on('click', function () {
        if (fSpider.restartGame() === true) {
            fSpider.closeOptionsPane();
        }
    });

    $('#dim-overlay').on('click', function () {
        fSpider.closeOptionsPane();
    });

    var dlg = $('#global-options-dlg');
    var container = $('#ui-container');
    dlg.css({
        top: (container.outerHeight() - dlg.outerHeight()) / 2,
        left: (container.outerWidth() - dlg.outerWidth()) / 2
    });
    dlg.draggable();
};

fSpider.openOptionsPane = function () {
    $('#dim-overlay').show();
    $('#global-options-dlg').show();
};

fSpider.closeOptionsPane = function () {
    $('#dim-overlay').hide();
    $('#global-options-dlg').hide();
};

fSpider.startNewGame = function () {
    if (fSpider.board.gameInProgress !== true || confirm("Are you sure you want to start a new game? Your current game will be replaced.") === true) {
        fSpider.board.startNewGame();
        return true;
    }
    return false;
};

fSpider.restartGame = function () {
    if (fSpider.board.gameInProgress === true && confirm("Are you sure you want to restart this game? Your progress will be lost.") === true) {
        fSpider.board.restartGame();
        return true;
    }
    return false;
};

$(window).load(function () {
    fSpider.init();
});
</script>
</body>
</html>
