#Cerebral Form

##Philosophy:
The inputs are first class citizens, not the "form". You determine where their state lives, and what forms, if any, they connect to. 

##Known Issue:
If one input needs to be re-validated after another input changes, that can work via the "linkTo" option. The linkTo option currently only supports just **1** linked input per input. 

##Usage:
`npm i -S cerebral-form`

```js
import InputWrapper from 'cerebral-form/InputWrapper'; //The wrapper is for react only, but could easily be ported to another UI lib
var MyInput = InputWrapper(function MyInput (props) {
  return (
        <input {...props}>
        </input>
    );
},{
  path: ['path','you','choose'], //the **only** required property. Input state is stored at this path
  form: 'form1', //or  ['form1','form2'] register the input with one or more forms
  validation: {
    'isEmail': "Please provide a valid email", //name and message of desired validation
    'userDefined': "This field must match another user defined field"
    'validationWithOptions': {
    	anything: 'canGoHere'
    	message: "This field must match another user defined field"
    }
  },
  asyncValidation: 'isNonGmail', //can only register 1 async validation per form
  validateImmediately: false, //by setting this to false, validation will only occur after the element has been visited, instead of on every change
  linkTo: ['anotherInput'] //re-run the validation for the input at path ['anotherInput'] whenever this element is modified
})
```

A list of available props available to the input are: 
- onChange: function onChange()
- onBlur: function onBlur()
- value: "hahah"
- completed: false //false unless default value provided
- errors: {
 isEmail: "Please provide a valid email"
}
- hasError: false
- visited: false
- checked: false

##Checking if a form has been completed: 
```js
import {formCompleted} from 'cerebral-form'; //this is a cerebral computed function
@Cerebral(formCompleted: formCompleted('form1')}) //use it like a normal computed function, passing the name of the form
```

##Hooking up the module + setting up validation: 
```js
import CerebralForm from 'cerebral-form';
import validator from 'validator'; 
controller.modules({
	cerebralForm: CerebralForm({
		validation: { //define simple validations here
			...validator, //use an external library like "validator" for many built in validations
			isEmail: function (value, state, options) { //define your own validations as well
				if (value.indexOf('@') > -1) {
					return true //no error
				} else {
					return false //error
				}
			}, 
			userDefined: function (value, state, options) {
				if (value === state.get('userDefinedString')) { //access any other values withing the state tree
					return true
				} else {
					return false
				}
			}
			validationWithOptions: function (value, state, options) {
				console.log(options.anything)
				// "canGoHere"
				return true;
			}
		},
		asyncValidation: { //define async validations here as cerebral action chains
			isNonGmail: [
		        [function({
		          input, output
		        }) {
		          //fake talking to backend
		          setTimeout(function() {
		            if (input.value.indexOf('gmail') > -1) {
		              output({
		                asyncError: {
		                  message: 'The email ' + input.value + ' cannot have gmail in the name'
		                }
		              })
		            } else {
		              output()
		            }
		          }, 300)
		        }]
		      ]
		}
	}),
});
```