'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.formCompleted = formCompleted;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

exports['default'] = function () {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	var _options$validation = options.validation;
	var validation = _options$validation === undefined ? {} : _options$validation;
	var _options$asyncValidation = options.asyncValidation;
	var asyncValidation = _options$asyncValidation === undefined ? {} : _options$asyncValidation;

	var validationNames = [];
	Object.keys(asyncValidation).forEach(function (key) {
		validationNames.push(key);
		// asyncValidation[key] = asyncValidation[key]
		asyncValidation['noValidationGiven%%'] = [];
		validationNames.push('noValidationGiven%%');
	});
	function doSimpleValidation(_ref) {
		var _ref$input = _ref.input;
		var value = _ref$input.value;
		var _ref$input$errors = _ref$input.errors;
		var errors = _ref$input$errors === undefined ? {} : _ref$input$errors;
		var _ref$input$validations = _ref$input.validations;
		var validations = _ref$input$validations === undefined ? {} : _ref$input$validations;
		var state = _ref.state;
		var output = _ref.output;

		Object.keys(validations).forEach(function (key) {
			var valid = validation[key](value, state);
			if (valid) {
				delete errors[key];
			} else {
				errors[key] = validations[key]; //todo check this is okay
			}
		});
		output({ errors: errors });
	}

	function setValue(_ref2) {
		var input = _ref2.input;
		var state = _ref2.state;
		var output = _ref2.output;

		state.set([].concat(_toConsumableArray(input.path), ['value']), input.value);

		var _state$get = state.get(input.path);

		var _state$get$validateImmediately = _state$get.validateImmediately;
		var validateImmediately = _state$get$validateImmediately === undefined ? true : _state$get$validateImmediately;
		var visited = _state$get.visited;

		if (validateImmediately || visited) {
			output.shouldValidate();
		} else {
			output.doNotValidate();
		}
	}
	setValue.outputs = ['shouldValidate', 'doNotValidate'];

	function chooseAsyncValidationPath(_ref3) {
		var _ref3$input = _ref3.input;
		var path = _ref3$input.path;
		var _ref3$input$asyncValidation = _ref3$input.asyncValidation;
		var asyncValidation = _ref3$input$asyncValidation === undefined ? 'noValidationGiven%%' : _ref3$input$asyncValidation;
		var state = _ref3.state;
		var output = _ref3.output;

		//call the user provided validation chain, and add the value to its input
		output[asyncValidation]({
			value: state.get([].concat(_toConsumableArray(path), ['value']))
		});
	}
	chooseAsyncValidationPath.outputs = validationNames;
	return function (module) {
		// Add signals
		module.alias('cerebralModuleForm');
		module.signals({
			init: [function (_ref4) {
				var input = _ref4.input;
				var state = _ref4.state;

				var inputState = state.get(input.path);
				if (!inputState) {
					state.set([].concat(_toConsumableArray(input.path)), {
						value: input.defaultValue,
						completed: input.defaultValue ? true : false,
						cerebralFormId: input.cerebralFormId
					});
				} else {
					if (inputState.cerebralFormId !== input.cerebralFormId) {
						console.warn('Careful! A new input is being initialized with the same path as a previous input');
					}
				}
			}],
			addToForm: [function (_ref5) {
				var input = _ref5.input;
				var state = _ref5.state;

				var forms = input.form;
				if (!Array.isArray(input.form)) {
					forms = [input.form];
				}
				forms.forEach(function (form) {
					state.set(['cerebralForm', form, 'paths', input.path.join('%.%')], true);
				});
			}],
			removeFromForm: [function (_ref6) {
				var input = _ref6.input;
				var state = _ref6.state;

				var forms = input.form;
				if (!Array.isArray(input.form)) {
					forms = [input.form];
				}
				forms.forEach(function (form) {
					state.unset(['cerebralForm', form, 'paths', input.path.join('%.%')]);
				});
			}],
			change: [setValue, {
				shouldValidate: [doSimpleValidation, chooseAsyncValidationPath, asyncValidation, setErrors],
				doNotValidate: []
			}],
			focus: [],
			blur: [makeSurePathIsPresent, function (_ref7) {
				var input = _ref7.input;
				var state = _ref7.state;

				state.set([].concat(_toConsumableArray(input.path), ['visited']), true);
			}, doSimpleValidation, chooseAsyncValidationPath, asyncValidation, setErrors] });
		return {};
	};
};

function makeSurePathIsPresent(_ref8) {
	var input = _ref8.input;
	var state = _ref8.state;
	var output = _ref8.output;

	if (!state.get([].concat(_toConsumableArray(input.path)))) {
		state.set([].concat(_toConsumableArray(input.path)), {});
	}
	output({ value: state.get([].concat(_toConsumableArray(input.path), ['value'])) });
}

function setErrors(_ref9) {
	var _ref9$input = _ref9.input;
	var path = _ref9$input.path;
	var _ref9$input$asyncError = _ref9$input.asyncError;
	var asyncError = _ref9$input$asyncError === undefined ? {} : _ref9$input$asyncError;
	var _ref9$input$errors = _ref9$input.errors;
	var errors = _ref9$input$errors === undefined ? {} : _ref9$input$errors;
	var _ref9$input$asyncValidation = _ref9$input.asyncValidation;
	var asyncValidation = _ref9$input$asyncValidation === undefined ? '' : _ref9$input$asyncValidation;
	var state = _ref9.state;

	if (Object.keys(asyncError).length > 0) {
		errors[asyncValidation] = asyncError;
	}
	state.set([].concat(_toConsumableArray(path), ['errors']), errors);
	if (Object.keys(errors).length > 0) {
		state.set([].concat(_toConsumableArray(path), ['completed']), false);
		state.set([].concat(_toConsumableArray(path), ['hasError']), true);
	} else {
		state.set([].concat(_toConsumableArray(path), ['completed']), true);
		state.set([].concat(_toConsumableArray(path), ['hasError']), false);
	}
}

function formCompleted(formName) {
	return function (get) {
		var inputPaths = get(['cerebralForm', formName, 'paths']) || {};
		var completed = true;
		Object.keys(inputPaths).some(function (path) {
			var input = get(path.split('%.%'));
			if (!input.completed) {
				completed = false;
				return true;
			}
		});
		return completed;
	};
}