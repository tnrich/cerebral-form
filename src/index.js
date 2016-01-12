export default (options = {}) => {
	var {validation = {}, asyncValidation={} } = options; 
	var validationNames = [];
	Object.keys(asyncValidation).forEach(function(key) {
		validationNames.push(key)
		// asyncValidation[key] = asyncValidation[key]
		asyncValidation['noValidationGiven%%'] = []
		validationNames.push('noValidationGiven%%')
	})
	function doSimpleValidation ({input: {path}, state,output}) {
		var {value, validations={}} = state.get(path)
		var errors={}
		Object.keys(validations).forEach(function (key) {
			var message;
			var options;
			if (typeof validations[key] === 'string') {
				message = validations[key]
				options = {message}
			} else {
				options = validations[key] || {}
				message = options.message
			}
			var valid = validation[key](value, state, options)
			if (valid) {
				delete errors[key]
			} else {
				errors[key] = message //todo check this is okay
			}
		})
		output({errors})
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
		shouldValidate: [
			doSimpleValidation,
			chooseAsyncValidationPath,
			asyncValidation,
			setErrors
		],
		doNotValidate: []
	}]
	var validateLinked = [
	linkedInputs, {
		validate: runValidationChain,
		doNotValidate: []
		}
	]

	function linkedInputs ({input, state, output}) {
		if (input.linkTo) {
			output.validate({path: input.linkTo, ...state.get(input.linkTo)})
		} else {
			output.doNotValidate()
		}
	}
	linkedInputs.outputs = ['validate', 'doNotValidate']

	function setErrors({
		input: {
			path, asyncError, errors = {}, asyncValidation = ''
		},
		state
	}) {
		if (asyncError) {
			if (typeof asyncError === 'string') {
				errors[asyncValidation] = asyncError;
			} else {
				console.warn('Make sure you pass a string in output({asyncError: "string goes here"}) in your ' + asyncValidation + ' validation');
			}
		}
		state.set([...path, 'errors'], errors);
		if (Object.keys(errors).length > 0) {
			state.set([...path, 'completed'], false);
			state.set([...path, 'hasError'], true);
		} else {
			state.set([...path, 'completed'], true);
			state.set([...path, 'hasError'], false);
		}
	}
	function setValue({input, state}) {
		state.set([...input.path, 'value'], input.value)
		state.set([...input.path, 'validateImmediately'], input.validateImmediately)
	}
	function checkIfValidationNeeded({input: {path}, state, output}) {
		var {visited, validateImmediately = true} = state.get(path)
		if (validateImmediately || visited) {
			output.shouldValidate()
		} else {
			output.doNotValidate()
		}
	}
	checkIfValidationNeeded.outputs = ['shouldValidate', 'doNotValidate']

	function chooseAsyncValidationPath({input: {path}, state, output}) {
		//call the user provided validation chain, and add the value to its input
		var {value, asyncValidation='noValidationGiven%%' }= state.get(path)
		output[asyncValidation]({
			value
		})
	}
	chooseAsyncValidationPath.outputs = validationNames;
	
	return (module) => {
		// Add signals
		module.alias('cerebralModuleForm');
		module.signals({
		init: [function({input, state}) {
			var inputState = state.get(input.path);
			if (!inputState) {
				state.set([...input.path], {
					value: input.defaultValue,
					completed: input.defaultValue ? true : false,
					...input
				})
			} else {
				if (inputState.cerebralFormId !== input.cerebralFormId) {
					console.warn('Careful! A new input is being initialized with the same path as a previous input');
				}
			}
		}],
		addToForm: [function({input, state}) {
			var forms = input.form
			if (!Array.isArray(input.form)) {
				forms = [input.form]
			}
			forms.forEach(function(form){
				state.set(['cerebralForm', form, 'paths', input.path.join('%.%')],true)
			});
		}],
		removeFromForm: [function({input, state}) {
			var forms = input.form
			if (!Array.isArray(input.form)) {
				forms = [input.form]
			}
			forms.forEach(function(form){
				state.unset(['cerebralForm', form, 'paths', input.path.join('%.%')])
			});
		}],
		change: [
			setValue,
			...runValidationChain,
			...validateLinked,
		],
		focus: [],
		blur: [
			makeSurePathIsPresent,
			function({input, state}) {
				state.set([...input.path, 'visited'], true)
			},
			...runValidationChain,
			...validateLinked,
		]});
		return {};
	};
}



function makeSurePathIsPresent({input, state, output}) {
	if (!state.get([...input.path])) {
		state.set([...input.path], {});
	}
	output({value: state.get([...input.path, 'value'])})
}



export function formCompleted(formName) {
	return function(get) {
		var inputs = getInputs(formName)(get)
		var completed = true;
		inputs.some(function(input) {
			if (!input.completed) {
				completed = false;
				return true;
			}
		})
		return completed;
	}
}

function getInputs(formName) {
	return function(get) {
		var inputPaths = get(['cerebralForm', formName, 'paths']) || {};
		var data = Object.keys(inputPaths).map(function(path) {
			return get(path.split('%.%'))
		});
		return data
	}
}

