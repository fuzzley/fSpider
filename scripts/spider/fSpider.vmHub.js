var fSpider = fSpider || {};

fSpider.vmHub = (function (vmHub, $, ko, undefined) {
    'use strict';

    ko.bindingHandlers.timeShortText = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value == null || isNaN(value) === true) {
                value = 0;
            }
            var valueF = fSpider.Utils.formatTime(value);
            $(element).text(valueF);
        }
    };

    ko.bindingHandlers.timeShortValue = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value == null || isNaN(value) === true) {
                value = 0;
            }
            var valueF = fSpider.Utils.formatTime(value);
            $(element).val(valueF);
        }
    };

    vmHub.hubs = {};

    vmHub.registerVM = function (vmName, vm) {
        vmHub.hubs[vmName] = vm;
    };

    vmHub.bind = function (element) {
        ko.applyBindings(vmHub.hubs, element);
    };

    return vmHub;
})(fSpider.vmHub || {}, window.jQuery, window.ko);