import React from 'react';
import ReactDOM from 'react-dom';
import { Decorator as Cerebral } from 'cerebral-react';
import {Container} from 'cerebral-react';
import Controller from 'cerebral';
import Model from 'cerebral-baobab';

import ObjectInspector from 'react-object-inspector';
import validator from 'validator';
import {InputWrapper, formCompleted} from '../CerebralForm';
import CerebralForm from '../CerebralForm';
var controller = Controller(Model({}));


//example validation
var simpleValidation = {
	...validator
}
var asyncValidation = {
	// myAsyncEmailValidation: [function checkEmail({input, output, services}) {
	// 	services.superagent
	// 	.post('/validateEmail')
	// 	.send(input.value)
	// 	.then(function(argument) {
	// 		output.success()
	// 	}).catch(function(err) {
	// 		output.error()
	// 	})
	// }],
	isNonGmail: function({
		input, output
	}) {
		//fake talking to backend
		setTimeout(function(argument) {
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
	}
}
CerebralForm(controller, simpleValidation, asyncValidation)



var Input1 = InputWrapper(function Input1 (props) {
  return (
    <div>
      <br/>
      <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ props } />
      <br/>
        <input style={{background: props.hasError?'red':'none'}} {...props}>
        </input>

    </div>
    );
}, {path: ['path'], form: 'form1',  validateImmediately: false, asyncValidation: 'isNonGmail', validations:{'isEmail': "Please provide a valid email"}})

var ShowAnotherGroupOfInputs = InputWrapper(function ShowAnotherGroupOfInputs (props) {
  return (
    <div>
    <br/>
      <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ props } />
      <br/>
      <radiogroup onChange={props.onChange}>
        <input type="radio" name="showOthers" value="showMore" checked={props.value==="showMore"}/> Show More <br/>
        <input type="radio" name="showOthers" value="showLess" checked={props.value==="showLess"}/> Show Less<br/>
      </radiogroup>
    </div>
    );
}, {path: ['showMore'], defaultValue: 'showLess', form: 'form1'})

var Input2 = InputWrapper(function Input2 (props) {
  return (
    <div>
    <br/>
      <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ props } />
      <br/>
      <radiogroup onChange={props.onChange}>
        <input type="radio" name="happy" value="happy" checked={props.value==="happy"}/> Happy <br/>
        <input type="radio" name="happy" value="unhappy" checked={props.value==="unhappy"}/> Unhappy<br/>
        <input type="radio" name="happy" value="other" checked={props.value==="other"}/> Other
      </radiogroup>
    </div>
    );
}, {path: ['path4'], form: 'form1'})

var Input3 = InputWrapper(function Input3 (props) {
  return (
    <div>
      <br/>
      <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ props } />
      <br/>
    <select {...props}>
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="opel">Opel</option>
      <option value="audi">Audi</option>
    </select>
  
    </div>
    );
}, {path: ['path3'], form: 'form1', defaultValue: 'audi', validationName: 'email'})

import each from 'lodash/collection/each';

@Cerebral({showMore: ['showMore'], formCompleted: formCompleted('form1')})
class FormExample extends React.Component {
  render() {
    var showMore = this.props.showMore && (this.props.showMore.value === 'showMore')
    console.log('rendering!');
    return (
      <div>
        <Input1/> 
        <br/>
        <ShowAnotherGroupOfInputs/> 
        { showMore
           &&
          <div>
          <Input2/>
          <br/>
          <Input3/>
          </div>
        }
        <br/>
        <h3>Component props:</h3>
        <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ this.props } />
        <button disabled={!this.props.formCompleted}>Submit</button>
      </div>
    );
  }
}

ReactDOM.render(<Container controller={controller}><FormExample /></Container>, document.getElementById('root'));
