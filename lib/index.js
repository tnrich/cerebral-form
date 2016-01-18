'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
		var path = _ref.input.path;
		var state = _ref.state;
		var output = _ref.output;

		var _state$get = state.get(path);

		var value = _state$get.value;
		var _state$get$validations = _state$get.validations;
		var validations = _state$get$validations === undefined ? {} : _state$get$validations;

		var errors = {};
		Object.keys(validations).forEach(function (key) {
			var message;
			var options;
			if (typeof validations[key] === 'string') {
				message = validations[key];
				options = { message: message };
			} else {
				options = validations[key] || {};
				message = options.message;
			}
			var valid = validation[key](value, state, options);
			if (valid) {
				delete errors[key];
			} else {
				errors[key] = message; //todo check this is okay
			}
		});
		output({ errors: errors });
	}

	function checkIfFormsAreCompleted(_ref2) {
		var input = _ref2.input;
		var state = _ref2.state;

		input.associatedForms.forEach(function (formName) {
			state.set(['cerebralForm', formName, 'completed'], state.get(formCompleted(formName)));
			if (options.formCompletedPaths) {
				if (options.formCompletedPaths[formName]) {
					state.set(options.formCompletedPaths[formName], state.get(formCompleted(formName)));
				}
			}
		});
	}

	// function validateOthers({input: {linkTo}, state, output}) {
	// 	if (linkTo) {
	// 		var input = state.get(linkTo);
	// 		checkIfValidationNeeded({input: {path: linkTo}, state, output: {
	// 				shouldValidate: function () {
	// 					doSimpleValidation({input, state, output: function ({errors}) {
	// 						setErrors({input: {errors, path: linkTo}, state})
	// 					}})
	// 				},
	// 				doNotValidate: function () {
	// 					//no-op!
	// 				}
	// 			}})
	// 	}

	// 	// var forms = input.form || []
	// 	// if (!Array.isArray(input.form)) {
	// 	// 	forms = [input.form]
	// 	// }
	// 	// forms.forEach(function(form) {
	// 	// 	var inputs = state.get(getInputs(form))
	// 	// 	inputs.forEach(function (input) {

	// 	// 	})
	// 	// })
	// }
	var runValidationChain = [checkIfValidationNeeded, {
		shouldValidate: [doSimpleValidation, chooseAsyncValidationPath, asyncValidation, setErrors],
		doNotValidate: []
	}];
	var validateLinked = [linkedInputs, {
		validate: runValidationChain,
		doNotValidate: []
	}];

	function linkedInputs(_ref3) {
		var input = _ref3.input;
		var state = _ref3.state;
		var output = _ref3.output;

		if (input.linkTo) {
			output.validate(_extends({ originalInputPath: input.path, path: input.linkTo }, state.get(input.linkTo)));
		} else {
			output.doNotValidate({ originalInputPath: input.path });
		}
	}
	linkedInputs.outputs = ['validate', 'doNotValidate'];

	function setErrors(_ref4) {
		var _ref4$input = _ref4.input;
		var path = _ref4$input.path;
		var asyncError = _ref4$input.asyncError;
		var _ref4$input$errors = _ref4$input.errors;
		var errors = _ref4$input$errors === undefined ? {} : _ref4$input$errors;
		var _ref4$input$asyncValidation = _ref4$input.asyncValidation;
		var asyncValidation = _ref4$input$asyncValidation === undefined ? '' : _ref4$input$asyncValidation;
		var state = _ref4.state;

		if (asyncError) {
			if (typeof asyncError === 'string') {
				errors[asyncValidation] = asyncError;
			} else {
				console.warn('Make sure you pass a string in output({asyncError: "string goes here"}) in your ' + asyncValidation + ' validation');
			}
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
	function setValue(_ref5) {
		var input = _ref5.input;
		var state = _ref5.state;

		state.set([].concat(_toConsumableArray(input.path), ['value']), input.value);
		state.set([].concat(_toConsumableArray(input.path), ['validateImmediately']), input.validateImmediately);
	}
	function checkIfValidationNeeded(_ref6) {
		var path = _ref6.input.path;
		var state = _ref6.state;
		var output = _ref6.output;

		var _state$get2 = state.get(path);

		var visited = _state$get2.visited;
		var _state$get2$validateImmediately = _state$get2.validateImmediately;
		var validateImmediately = _state$get2$validateImmediately === undefined ? true : _state$get2$validateImmediately;

		if (validateImmediately || visited) {
			output.shouldValidate();
		} else {
			output.doNotValidate();
		}
	}
	checkIfValidationNeeded.outputs = ['shouldValidate', 'doNotValidate'];

	function chooseAsyncValidationPath(_ref7) {
		var path = _ref7.input.path;
		var state = _ref7.state;
		var output = _ref7.output;

		//call the user provided validation chain, and add the value to its input

		var _state$get3 = state.get(path);

		var value = _state$get3.value;
		var _state$get3$asyncValidation = _state$get3.asyncValidation;
		var asyncValidation = _state$get3$asyncValidation === undefined ? 'noValidationGiven%%' : _state$get3$asyncValidation;

		output[asyncValidation]({
			value: value
		});
	}
	chooseAsyncValidationPath.outputs = validationNames;

	return function (module) {
		// Add signals
		module.alias('cerebralModuleForm');
		module.signals({
			initializeInput: [function (_ref8) {
				var input = _ref8.input;
				var state = _ref8.state;

				var inputState = state.get(input.path);
				if (!inputState) {
					state.set([].concat(_toConsumableArray(input.path)), _extends({
						value: input.defaultValue,
						completed: input.defaultValue ? true : false
					}, input));
				} else {
					if (inputState.cerebralFormId !== input.cerebralFormId) {
						console.warn('Careful! A new input is being initialized with the same path as a previous input');
					}
				}
			}],
			addToForm: [getAssociatedForms, function (_ref9) {
				var input = _ref9.input;
				var state = _ref9.state;

				input.associatedForms.forEach(function (form) {
					state.set(['cerebralForm', form, 'paths', input.path.join('%.%')], true);
				});
			}, checkIfFormsAreCompleted],
			removeFromForm: [getAssociatedForms, function (_ref10) {
				var input = _ref10.input;
				var state = _ref10.state;

				input.associatedForms.forEach(function (form) {
					state.unset(['cerebralForm', form, 'paths', input.path.join('%.%')]);
				});
			}, checkIfFormsAreCompleted],
			change: [getAssociatedForms, setValue].concat(runValidationChain, validateLinked, [checkIfFormsAreCompleted]),
			focus: [],
			blur: [getAssociatedForms, makeSurePathIsPresent, function (_ref11) {
				var input = _ref11.input;
				var state = _ref11.state;

				state.set([].concat(_toConsumableArray(input.path), ['visited']), true);
			}].concat(runValidationChain, validateLinked, [checkIfFormsAreCompleted]) });
		return {};
	};
};

function getAssociatedForms(_ref12) {
	var input = _ref12.input;
	var output = _ref12.output;

	var associatedForms = Array.isArray(input.form) ? input.form : [input.form];
	output({ associatedForms: associatedForms });
}

function makeSurePathIsPresent(_ref13) {
	var input = _ref13.input;
	var state = _ref13.state;
	var output = _ref13.output;

	if (!state.get([].concat(_toConsumableArray(input.path)))) {
		state.set([].concat(_toConsumableArray(input.path)), {});
	}
	output({ value: state.get([].concat(_toConsumableArray(input.path), ['value'])) });
}

function formCompleted(formName) {
	return function (get) {
		var inputs = getInputs(formName)(get);
		var completed = true;
		inputs.some(function (input) {
			if (!input.completed) {
				completed = false;
				return true;
			}
		});
		return completed;
	};
}

function getInputs(formName) {
	return function (get) {
		var inputPaths = get(['cerebralForm', formName, 'paths']) || {};
		var data = Object.keys(inputPaths).map(function (path) {
			return get(path.split('%.%'));
		});
		return data;
	};
}

exports.formCompleted = formCompleted;

// function formCompleted(formName) {
// 	return function(get) {
// 		var inputPaths = get(['cerebralForm', formName, 'paths']) || {};
// 		var completed = true;
// 		Object.keys(inputPaths).some(function(path) {
// 			var input = get(path.split('%.%'))
// 			if (!input.completed) {
// 				completed = false
// 				return true
// 			}
// 		});
// 		return data
// 	}
// }