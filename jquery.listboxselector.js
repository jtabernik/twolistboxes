(function ($) {

    $.fn.listboxselector = function (method) {

        // public methods
        // to keep the $.fn namespace uncluttered, collect all of the plugin's methods in an object literal and call
        // them by passing the string name of the method to the plugin
        //
        // public methods can be called as
        // element.listboxselector('methodName', arg1, arg2, ... argn)
        // where "element" is the element the plugin is attached to, "listboxselector" is the name of your plugin and
        // "methodName" is the name of a function available in the "methods" object below; arg1 ... argn are arguments
        // to be passed to the method
        //
        // or, from inside the plugin:
        // methods.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "methods" object below
        var methods = {

            // this the constructor method that gets called when the object is created
            init: function (options) {

                // the plugin's final properties are the merged default and user-provided properties (if any)
                // this has the advantage of not polluting the defaults, making them re-usable 
                this.listboxselector.settings = $.extend({}, this.listboxselector.defaults, options);

                // iterate through all the DOM elements we are attaching the plugin to
                return this.each(function () {

                    var $element = $(this), // reference to the jQuery version of the current DOM element
                        element = this;     // reference to the actual DOM element

                    helpers.render($element);

                });

            },

            getSelectedOptions: function () {
                helpers.getSelectedOptions();
            }

        };

        // private methods
        // these methods can be called only from inside the plugin
        //
        // private methods can be called as
        // helpers.methodName(arg1, arg2, ... argn)
        // where "methodName" is the name of a function available in the "helpers" object below; arg1 ... argn are
        // arguments to be passed to the method
        var helpers = {

            render: function (el) {

                var mainDiv = this._addDiv(el, {}, ["lb-selector-container"]);

                var availableDiv = this._addDiv(mainDiv, {}, ["lb-selector-block"]);
                var buttonDiv = this._addDiv(mainDiv, {}, ["lb-selector-block", "lb-selector-block-buttons"]);
                var selectedDiv = this._addDiv(mainDiv, {}, ["lb-selector-block"]);

                this._controls().availableList = this._addSelectList(availableDiv, "available-options");
                this._controls().selectedList = this._addSelectList(selectedDiv, "selected-options");

                var ulButtons = $("<ul>").addClass("lb-button-block").appendTo(buttonDiv);

                this._controls().rightAllButton = this._addMoveButtonLi(ulButtons, "lb-rightAll", this._settings().buttonTextAllRight);
                this._controls().rightSelectedButton = this._addMoveButtonLi(ulButtons, "lb-rightSelected", this._settings().buttonTextSelectedRight);
                this._controls().leftSelectedButton = this._addMoveButtonLi(ulButtons, "lb-leftSelected", this._settings().buttonTextSelectedLeft);
                this._controls().leftAllButton = this._addMoveButtonLi(ulButtons, "lb-leftAll", this._settings().buttonTextAllLeft);

                this._getAvailableOptions(this._controls().availableList);

                this._bindButtonClick(this._controls().rightAllButton, this._rightAll);
                this._bindButtonClick(this._controls().rightSelectedButton, this._rightSelected);
                this._bindButtonClick(this._controls().leftSelectedButton, this._leftSelected);
                this._bindButtonClick(this._controls().leftAllButton, this._leftAll);

                // need to get selected options first....but for now...

                this._showAvailableOptions();

            },

            getSelectedOptions: function () {

            },            

            _getAvailableOptions: function (availableList) {
                if (this._settings().availableOptionsUrl == null) {
                    this._populateAvailableOptionList(this._settings().availableOptions);
                }
                else {
                    obj = $(this)[0];
                    $.ajax({
                        url: this._settings().availableOptionsUrl,
                        type: "GET",
                        success: function (data) {
                            obj._populateAvailableOptionList(data);
                        },
                        error: function (req, status, error) {
                            alert("R: " + req + " S: " + status + " E: " + error);
                        }
                    });
                }
            },

            _controls: function() {
                return $.fn.listboxselector.vars;
            },

            _vars: function () {
                return $.fn.listboxselector.vars;
            },

            _rightAll: function (_this) {
                var options = $(_this._controls().availableList).find("option");
                for (var i = 0; i < options.length; i++) {
                    _this._settings().selectedOptions.push(_this._makeObject(options[i]));
                }
                _this._redraw(true);
            },

            _rightSelected: function (_this) {
                var options = $(_this._controls().availableList).find("option:selected");
                for (var i = 0; i < options.length; i++) {
                    _this._settings().selectedOptions.push(_this._makeObject(options[i]));
                }
                _this._redraw(true);
            },

            _leftSelected: function (_this) {
                var options = $(_this._controls().selectedList).find("option:selected");
                for (var i = 0; i < options.length; i++) {
                    _this._removeFromSelected(options[i]);
                }
                _this._redraw(false);
            },

            _leftAll: function (_this) {
                var options = $(_this._controls().selectedList).find("option");
                for (var i = 0; i < options.length; i++) {
                    _this._removeFromSelected(options[i]);
                }
                _this._redraw(false);
            },

            _redraw: function (shouldSort) {
                if (shouldSort) {
                    this._sortSelected();
                }
                this._showAvailableOptions();
                this._showSelectedOptions();
            },

            _settings: function () {
                return $.fn.listboxselector.settings;
            },

            _populateAvailableOptionList: function (options) {
                this._settings().availableOptions = [];
                if (options != null && this._isArray(options)) {
                    for (var i = 0; i < options.length; i++) {
                        var value = "";
                        var text = "";
                        var item = options[i];
                        if (this._isString(item)) {
                            // probably some other options for inputs
                            value = item;
                            text = item;
                        } else {
                            // need to test here to see if these attributes exist first
                            value = item.value;
                            text = item.text;
                        }
                        this._settings().availableOptions.push({ value: value, text: text });
                    }
                }
                this._showAvailableOptions();
            },

            _isArray: function (variable) {
                return variable instanceof Array;
            },

            _isString: function (variable) {
                return typeof (variable) == "string";
            },

            _makeOption: function (option) {
                return $("<option>", { value: option.value, text: option.text });
            },

            _makeObject: function(option) {
                return { text: option.text, value: option.value };
            },

            _addSelectList: function (parent, id) {
                var newOptions = {
                    id: id,
                    "multiple": "multiple"
                };
                return $('<select>', newOptions).attr("size", 14).addClass("lb-options-list").appendTo(parent);
            },

            _removeFromSelected: function (option) {
                for (var i = 0; i < this._settings().selectedOptions.length; i++) {
                    if (option.value == this._settings().selectedOptions[i].value) {
                        this._settings().selectedOptions.splice(i, 1);
                        return;
                    }
                }
            },

            _addMoveButtonLi: function (ul, id, text) {
                var li = this._addLi(ul);
                this._addMoveButton(li, { id: id, text: text });
                return li;
            },

            _addMoveButton: function (parent, options) {
                return $('<button>', options).addClass("lb-move-buttons").appendTo(parent);
            },

            _addLi: function (ul) {
                return $('<li>').appendTo(ul);
            },

            _addDiv: function (parent, options, classList) {
                var classes = classList.join(" ");
                return $('<div>', options).addClass(classes).appendTo(parent);
            },

            _bindButtonClick: function (el, _method) {
                var obj = $(this)[0];
                $(el).bind("click", function (button) {
                    //$.proxy(_method, obj);
                    _method(obj);
                });
            },


            _showAvailableOptions: function () {
                //var text = $("#filter-available").val().toUpperCase();
                var control = $(this._controls().availableList);
                control.children().remove();
                var options = this._settings().availableOptions;
                for (var i = 0; i < options.length; i++) {
                    if (//options[i].text.indexOf(text) >= 0 &&
                        !this._isOptionInSelectedList(options[i])) {
                        control.append(this._makeOption(options[i]));
                    }
                }
                control.scrollTop(0);
            },

            _showSelectedOptions: function () {
                //var text = $("#filter-selected").val().toUpperCase();
                var control = $(this._controls().selectedList);
                control.children().remove();
                var options = this._settings().selectedOptions;
                for (var i = 0; i < options.length; i++) {
                    //if (options[i].text.indexOf(text) >= 0) {
                    control.append(this._makeOption(options[i]));
                    //}
                }
                control.scrollTop(0);
            },


            _isOptionInSelectedList: function (option) {
                var list = this._settings().selectedOptions;
                for (var i = 0; i < list.length; i++) {
                    if (option.value == list[i].value) {
                        return true;
                    }
                }
                return false;
            },


            _sortSelected: function () {
                this._vars().selectedList.sort(this._comparator);
            },

            _comparator: function (a,b) {
                if (a.text < b.text) return -1;
                if (a.text > b.text) return 1;
                return 0;
            }

        }

        // if a method as the given argument exists
        if (methods[method]) {

            // call the respective method
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

            // if an object is given as method OR nothing is given as argument
        } else if (typeof method === 'object' || !method) {

            // call the initialization method
            return methods.init.apply(this, arguments);

            // otherwise
        } else {

            // trigger an error
            $.error('Method "' + method + '" does not exist in listboxselector plugin!');

        }

    };


    $.fn.listboxselector.vars = {
        availableList: null,
        selectedList: null,
        rightAllButton: null,
        rightSelectedButton: null,
        leftSelectedButton: null,
        leftAllButton: null
    };


    // plugin's default options
    $.fn.listboxselector.defaults = {

        availableOptions: ["Test option 1", "Test option 2", "Test option 3"],
        availableOptionsUrl: null,
        buttonTextAllRight: ">>",
        buttonTextSelectedRight: ">",
        buttonTextSelectedLeft: "<",
        buttonTextAllLeft: "<<",
        selectedOptions: [],
        selectedOptionsUrl: null

    };

    // this will hold the merged default and user-provided options
    // you will have access to these options like:
    // this.listboxselector.settings.propertyName from inside the plugin or
    // element.listboxselector.settings.propertyName from outside the plugin, where "element" is the element the
    // plugin is attached to;
    $.fn.listboxselector.settings = {};

})(jQuery);
