#Cerebral Form

Usage:
`npm i -S cerebral-form`

```js
import InputWrapper from 'cerebral-form/InputWrapper';
var MyInput = InputWrapper(function MyInput (props) {
  return (
        <input {...props}>
        </input>
    );
},{
  path: ['path','you','choose'], //input state stored at this path
  form: 'form1', //or  ['form1','form2'] //if the input is part of a larger form
  validation: {
    'isEmail': "Please provide a valid email" //name and message of desired validation
    'userDefined': "This field must match another user defined field"
  },
  asyncValidation: 'isNonGmail', //can only register 1 async validation per form
  validateImmediately: false, //by setting this to false, validation will only occur after the element has been visited, instead of on every change
})
```

A list of available props available to the input are: 
- onChange: function onChange()
- onBlur: function onBlur()
- value: "gag"
- completed: false
- errors: {
 isEmail: "Please provide a valid email"
}
- hasError: true
- visited: true

Hooking up the module + setting up validation: 
```js
import CerebralForm, {formCompleted} from 'cerebral-form';
controller.modules({
	cerebralForm: CerebralForm({
		validation: { //define simple validations here (no built-in validation yet..)
			isEmail: function (value, state) {
				if (value.indexOf('@') > -1) {
					return true
				} else {
					return false
				}
			}, 
			userDefined: function (value, state) {
				if (value.indexOf(state.get('userDefinedString')) > -1) {
					return true
				} else {
					return false
				}
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