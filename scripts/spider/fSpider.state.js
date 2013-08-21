var fSpider = fSpider || {};

fSpider.SpiderState = (function (SpiderState, undefined) {
    'use strict';

    //constructor
    SpiderState = function (board) {
        this.board = board;
    };

    //fields
    SpiderState.prototype.board = null;

    //functions


    return SpiderState;
})(fSpider.SpiderState || {});