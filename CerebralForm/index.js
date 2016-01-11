export default (options = {}) => {
	var {simpleValidation = {}, asyncValidation={} } = options; 
	var validationNames = [];
	Object.keys(asyncValidation).forEach(function(key) {
		validationNames.push(key)
		asyncValidation[key] = [[asyncValidation[key]]]
		asyncValidation['noValidationGiven%%'] = []
		validationNames.push('noValidationGiven%%')
	})
	function doSimpleValidation ({input: {value, errors={}, validations={}},state,output}) {
		Object.keys(validations).forEach(function (key) {
			var valid = simpleValidation[key](value, state)
			if (valid) {
				delete errors[key]
			} else {
				errors[key] = validations[key] //todo check this is okay
			}
		})
		output({errors})
	}

	function setValue({input, state, output}) {
		state.set([...input.path, 'value'], input.value)
		var {validateImmediately = true, visited} = state.get(input.path)
		if (validateImmediately || visited) {
			output.shouldValidate()
		} else {
			output.doNotValidate()
		}
	}
	setValue.outputs = ['shouldValidate', 'doNotValidate']

	function chooseAsyncValidationPath({input: {path, asyncValidation='noValidationGiven%%'}, state, output}) {
		//call the user provided validation chain, and add the value to its input
		output[asyncValidation]({
			value: state.get([...path, 'value'])
		})
	}
	chooseAsyncValidationPath.outputs = validationNames;
	return (module) => {
		// Add signals
		module.alias('cerebralModuleForm');
		module.signals({
		init: [function({input, state}) {
			if (!state.get(input.path)) {
				state.set([...input.path], {
					value: input.defaultValue,
					completed: input.defaultValue ? true : false
				})
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
				state.unset(['cerebralForm', form, 'paths', input.path.join('%.%')],true)
			});
		}],
		change: [
			setValue, {
				shouldValidate: [
					doSimpleValidation,
					//tnr: we should probably only do async validation on blur events..
					// chooseAsyncValidationPath,
					// asyncValidation,
					chooseAsyncValidationPath,
					asyncValidation,
					setErrors
				],
				doNotValidate: []
			},
		],
		focus: [],
		blur: [
			makeSurePathIsPresent,
			function({input, state}) {
				state.set([...input.path, 'visited'], true)
			},
			doSimpleValidation,
			chooseAsyncValidationPath,
			asyncValidation,
			setErrors
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

function setErrors({input: {path, asyncError={}, errors={}, asyncValidation=''}, state}) {
	if (Object.keys(asyncError).length > 0) {
		errors[asyncValidation] = asyncError;
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

export function formCompleted (formName) {
	return function (get) {
	  var inputPaths = get(['cerebralForm',formName,'paths']) || {};
	  var completed = true;
	  Object.keys(inputPaths).some(function(path){
	    var input = get(path.split('%.%'))
	    if (!input.completed) {
	      completed = false;
	      return true;
	    }
	  });
	  return completed;
	}
}

