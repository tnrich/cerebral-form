import React from 'react';
import ReactDOM from 'react-dom';
import { Decorator as Cerebral } from 'cerebral-view-react';
import {Container} from 'cerebral-view-react';
import Controller from 'cerebral';
import Model from 'cerebral-model-baobab';
import ObjectInspector from 'react-object-inspector';
import validator from 'validator';
import InputWrapper from '../src/InputWrapper';
var controller = Controller(Model({
  activeForm: '1'
}));
import CerebralForm, {formCompleted} from '../src';
controller.modules({
  cerebralForm: CerebralForm({
    //example validation
    validation: {
      ...validator,
      divisibleBy5: function (value, state, options) {
        if (value % 5 === 0) {
          return true
        } else {
          return false
        }
      },
      matches: function (value, state, options) {
        if (value === state.get(options.path).value) {
          return true
        } else {
          return false
        }
      }
    },
    asyncValidation: {
      isNonGmail: [
        [function({
          input, output
        }) {
          //fake talking to backend
          setTimeout(function() {
            if (input.value && input.value.indexOf('gmail') > -1) {
              output({
                asyncError: 'The email ' + input.value + ' cannot have gmail in the name'
              })
            } else {
              output()
            }
          }, 300)
        }]
      ]
    }, addFormDataToTreeAsBaobabMonkey: {
      form1: ['all','form','data']
    }
  }),
});

var Email = InputWrapper(function Email (props) {
    var {errors={} } = props;
    return (
      <div>
        <br/>
        <h3>Email (no gmail allowed): </h3>
        <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
        <br/>
          <input style={{background: props.hasError?'red':'none'}} {...props}>
          </input>
          Email please
          {Object.keys(errors).map(function (key) {
            return errors[key];
          })}
      </div>
      );
  }, function (props) {
    return {
    path: [props.path9, 'email'],
    form: 'form1',
    validateImmediately: false,
    asyncValidation: 'isNonGmail',
    validations: {
      'isEmail': "Please provide a valid email",
    },
    linkTo: [props.path9, 'verifyEmail']
  }
  })

var VerifyEmail = InputWrapper(function VerifyEmail (props) {
  var {errors={} } = props;
  return (
    <div>
      <br/>
      <h3>Verify Email (no gmail allowed): </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
      <br/>
        <input style={{background: props.hasError?'red':'none'}} {...props}>
        </input>
        {
          Object.keys(errors).map(function(key) {
            return errors[key];
          })
        }
    </div>
    );
}, function (props) {
  return {
    path: [props.path9, 'verifyEmail'],
    form: 'form1',
    validateImmediately: false,
    validations: {
      'matches': {
        path: [props.path9,'email'],
        message: "Make sure the emails match"
      }
    },
  }
}

// {
//   path: ['verifyEmail'],
//   form: 'form1',
//   validateImmediately: false,
//   validations: {
//     'matches': {
//       path: ['email'],
//       message: "Make sure the emails match"
//     }
//   },
  // linkTo: ['email']
)

var ShowAnotherGroupOfInputs = InputWrapper(function ShowAnotherGroupOfInputs (props) {
  return (
    <div>
    <br/>
    <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
      <br/>
      <radiogroup onChange={props.onChange}>
        <input type="radio" name="showOthers" value="showMore" checked={props.value==="showMore"}/> Add additional form elements <br/>
        <input type="radio" name="showOthers" value="showLess" checked={props.value==="showLess"}/> Don't add them<br/>
      </radiogroup>
    </div>
    );
}, {path: ['showMore'], defaultValue: 'showLess', form: 'form1'})

var RadioGroup = InputWrapper(function RadioGroup (props) {
  return (
    <div>
    <br/>
    <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
      <br/>
      <radiogroup onChange={props.onChange}>
        <input type="radio" name="happy" value="happy" checked={props.value==="happy"}/> Happy <br/>
        <input type="radio" name="happy" value="unhappy" checked={props.value==="unhappy"}/> Unhappy<br/>
        <input type="radio" name="happy" value="other" checked={props.value==="other"}/> Other
      </radiogroup>
    </div>
    );
}, {path: ['radiogroup'], form: 'form1'})

var UnconventionalRadioGroup = InputWrapper(function UnconventionalRadioGroup (props) {
  return (
    <div>
    <br/>
    <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
      <br/>
        <button onClick={() => {
                 props.onChange("happy")
        }} style={{background: props.value==="happy" ? 'blue' : 'inherit'}}> Happy  </button>
        <button onClick={() => {
                 props.onChange("unhappy")
        }} style={{background: props.value==="unhappy" ? 'blue' : 'inherit'}}> Unhappy </button>
        <button onClick={() => {
                 props.onChange("other")
        }} style={{background: props.value==="other" ? 'blue' : 'inherit'}}> Other </button>
    </div>
    );
}, {path: ['unconventionalRadiogroup'], form: 'form1'})

var Checkbox = InputWrapper(function Checkbox (props) {
  return (
    <div className='productOptionBox'>
      <br/>
      <h3>
      Checkbox props: 
      </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
        <input {...props} type="checkbox"/> Yes <br/>
    </div>
    );
}, {
  path: ['genes','shipWithGlycerolStocks'],
  form: 'SelectProductPage',
  defaultValue: true,
})

var Input3 = InputWrapper(function Input3 (props) {
  return (
    <div>
      <br/>
      <h3>Input props: </h3>
      <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ {value: props.value, completed: props.completed, visited: props.visited, hasError: props.hasError, errors: props.errors} } />
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

@Cerebral({showMore: ['showMore'], form: ['activeForm'], formCompleted: ['cerebralForm','form1','completed']})
class FormExample extends React.Component {
  render() {
    
    var showMore = this.props.showMore && (this.props.showMore.value === 'showMore')
    return (
      <div>
        <Email path9='hahah'/> 
        <br/>
        <VerifyEmail path9='hahah'/> 
        <br/>
        <UnconventionalRadioGroup/>
        <Checkbox/>
        <div style={{background: 'grey'}}>
          <ShowAnotherGroupOfInputs/> 
          { showMore
             &&
            <div>
            <RadioGroup/>
            <br/>
            <Input3/>
            </div>
          }
        </div>
        <br/>
        <h3>Component props: </h3>
        <ObjectInspector initialExpandedPaths={['root', 'root.errors']} data={ this.props } />
        <br/>
        Completed? {this.props.formCompleted ? ' true' : ' false'}
        <br/>
        <button disabled={!this.props.formCompleted}>Submit</button>
      </div>
    );
  }
}

ReactDOM.render(<Container controller={controller}><FormExample /></Container>, document.getElementById('root'));
