// Application entry point (bundled by Vite).
//
// The vendored libraries (jQuery, Knockout, KineticJS, Howler) are loaded as
// classic <script> tags in index.html and expose window globals ($, ko, Kinetic,
// Howl). Because this module is deferred, those globals are available by the time
// the imports below evaluate.
//
// The game modules are imported in the same order the old <script> tags used so
// that each namespace member is defined before a later module consumes it.
import { fSpider } from "./fSpider.namespace.js";

import "./spider/fSpider.ui.draggable.js";
import "./spider/fSpider.ui.modal.js";
import "./spider/fSpider.utils.js";
import "./spider/fSpider.vmHub.js";
import "./spider/fSpider.history.js";
import "./spider/fSpider.settings.js";
import "./spider/fSpider.card.js";
import "./spider/fSpider.card.deck.js";
import "./spider/fSpider.card.groups.js";
import "./spider/fSpider.board.js";
import "./spider/fSpider.debug.js";
// Note: fSpider.state.js is intentionally not imported — it was not referenced by
// the original page. Left in src/spider for review.

fSpider.board = null;
fSpider.deck = null;
fSpider.stage = null;
fSpider.ctrlKeyCode = 17;
fSpider.ctrlDown = false;
fSpider.undoKey = "Z";
fSpider.redoKey = "Y";

fSpider.init = function () {
  var stage = fSpider.initStage();
  var board = fSpider.initBoard(stage);
  fSpider.initUI(stage, board);
};

fSpider.initStage = function () {
  var canvasWrap = $("#canvas-wrap");
  fSpider.stage = new Kinetic.Stage({
    container: "canvas-wrap",
    width: canvasWrap.width(),
    height: canvasWrap.height(),
  });
  return fSpider.stage;
};

fSpider.initBoard = function (stage) {
  //load assets
  var cardAssetsImg = $("#playing-card-assets-large").get(0);
  var cardDim = {
    width: cardAssetsImg.naturalWidth / 13, // number of types
    height: cardAssetsImg.naturalHeight / 5, // number of suits + back images row
  };

  var soundFolder = "content/sound_assets/card_sounds/";
  var sounds = {};
  sounds.cardFlip = new Howl({
    urls: [
      soundFolder + "cardflip.ogg",
      soundFolder + "cardflip.mp3",
      soundFolder + "cardflip.wav",
    ],
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
    height: cardDim.height,
  });
  board.setTableauPlaceHolderImage($("#tableau-ph").get(0));
  ////set sound assets
  board.setSounds(sounds);

  return board;
};

fSpider.initUI = function (stage, board) {
  fSpider.uiSettings = new fSpider.UISettings();

  //setup external ui
  fSpider.initGameControls(fSpider.uiSettings);
  fSpider.initOptionsPane();

  fSpider.vmHub.registerVM("board", board.vm);
  fSpider.vmHub.registerVM("gameSettings", board.settings.vm);
  fSpider.vmHub.registerVM("gameHistory", board.history.vm);
  fSpider.vmHub.registerVM("uiSettings", fSpider.uiSettings);
  fSpider.vmHub.bind($("#ui-container").get(0));

  //in case of resize, notify board
  $(window).resize(function () {
    var canvasWrap = $("#canvas-wrap");
    stage.setWidth(canvasWrap.width());
    stage.setHeight(canvasWrap.height());
    board.recalculateGlobalScale();
    board.redraw();
  });

  $(document).on("keydown", function (evt) {
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

  $(document).on("keyup", function (evt) {
    if (evt.keyCode === fSpider.ctrlKeyCode) {
      fSpider.ctrlDown = false;
    }
  });
};

fSpider.initGameControls = function (settings) {
  fSpider.windows = settings.loadWindows();

  $(".modal-content").show();
  $("#new-game-btn").on("click", function () {
    fSpider.startNewGame();
  });
  $("#restart-btn").on("click", function () {
    fSpider.restartGame();
  });
  $("#undo-btn").on("click", function () {
    fSpider.board.undo();
  });
  $("#redo-btn").on("click", function () {
    fSpider.board.redo();
  });
};

fSpider.initOptionsPane = function (settings) {
  $("#global-settings-open-btn").on("click", function () {
    fSpider.openOptionsPane(settings);
  });

  $("#global-options-close-btn").on("click", function () {
    fSpider.closeOptionsPane();
  });

  $("#glbl-game-new-game-btn").on("click", function () {
    if (fSpider.startNewGame() === true) {
      fSpider.closeOptionsPane();
    }
  });
  $("#glbl-game-restart-btn").on("click", function () {
    if (fSpider.restartGame() === true) {
      fSpider.closeOptionsPane();
    }
  });

  $("#dim-overlay").on("click", function () {
    fSpider.closeOptionsPane();
  });

  var dlg = $("#global-options-dlg");
  var container = $("#ui-container");
  dlg.css({
    top: (container.outerHeight() - dlg.outerHeight()) / 2,
    left: (container.outerWidth() - dlg.outerWidth()) / 2,
  });
  dlg.draggable();
};

fSpider.openOptionsPane = function () {
  $("#dim-overlay").show();
  $("#global-options-dlg").show();
};

fSpider.closeOptionsPane = function () {
  $("#dim-overlay").hide();
  $("#global-options-dlg").hide();
};

fSpider.startNewGame = function () {
  if (
    fSpider.board.gameInProgress !== true ||
    confirm(
      "Are you sure you want to start a new game? Your current game will be replaced.",
    ) === true
  ) {
    fSpider.board.startNewGame();
    return true;
  }
  return false;
};

fSpider.restartGame = function () {
  if (
    fSpider.board.gameInProgress === true &&
    confirm(
      "Are you sure you want to restart this game? Your progress will be lost.",
    ) === true
  ) {
    fSpider.board.restartGame();
    return true;
  }
  return false;
};

$(window).load(function () {
  fSpider.init();
});
