var fSpider = fSpider || {};

fSpider.ViewModel = (function (ViewModel, $, ko, undefined) {
    'use strict';

    //public functions
    ViewModel = function (board, settings) {
        this.board = board;
        this.settings = settings;

        var options = {
            gameDifficulties: [
                { value: 0, text: '1 Suit' },
                { value: 1, text: '2 Suits' },
                { value: 2, text: '3 Suits' }
            ]
        };
        this.build(options);
        this.reset();
    };

    ViewModel.prototype.bind = function (element) {
        ko.applyBindings(this, element);
    };

    ViewModel.prototype.build = function (options) {
        this.score = ko.observable();
        this.scoreModalVisible = ko.observable();

        this.moves = ko.observable();
        this.movesModalVisible = ko.observable();

        this.time = ko.observable();
        this.timeModalVisible = ko.observable();

        this.animate = ko.observable();
        this.sound = ko.observable();
        this.volume = ko.computed(function () {
            return this.sound() === true ? 1 : 0;
        }, this);
        this.gameOptionsModalVisible = ko.observable();

        this.newGameEnabled = ko.observable();
        this.difficulty = ko.observable();
        this.difficultyOptions = ko.observableCollection(options.gameDifficulties);
        this.restartGameEnabled = ko.observable();
        this.undoButtonEnabled = ko.observable();
        this.redoButtonEnabled = ko.observable();
        this.gameControlsModalVisible = ko.observable();

        this.globalOptionsDialogVisible = ko.observable(false);

        //misc stuff
        this.ctrlDown = ko.observable(false);
    };

    ViewModel.prototype.reset = function () {
        var msClosed = fSpider.Modal.prototype.STATES.CLOSED;
        var b = this.board;
        var s = this.settings;

        this.score(b.score);
        this.scoreModalVisible(s.windows.score.modalState !== msClosed);

        this.moves(b.moves);
        this.movesModalVisible(s.windows.moves.modalState !== msClosed);

        this.time(b.time);
        this.timeModalVisible(s.windows.time.modalState !== msClosed);

        this.animate(s.animate);
        this.sound(s.volume === 0);
        this.gameOptionsModalVisible(s.windows.game.modalState !== msClosed);

        this.newGameEnabled(true);
        this.difficulty(s.difficulty);
        this.restartGameEnabled(b.isGameInProgress() === true);
        this.undoButtonEnabled(b.canUndo() === true);
        this.redoButtonEnabled(b.canRedo() === true);
        this.gameControlsModalVisible(s.windows.options.modalState !== msClosed);
    };

    return ViewModel;
})(fSpider.ViewModel || {}, window.jQuery, window.ko);