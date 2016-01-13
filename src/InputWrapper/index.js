//HOC component
import {HOC} from 'cerebral-view-react';
import React, { Component } from "react";
//take in a user component
export default function InputWrapper (ComposedComponent, opts) {
  var finalOpts;
  if (typeof opts !== "function") {
    finalOpts = opts;
  }
  function getCerebralPaths (options) {
    options = {...options, cerebralFormId}
    return {
      cerebralInput: options.path
    }
  }
  var cerebralFormId = guid();
  //wrap a helper component in cerebral's HOC
  return HOC(class Connector extends Component {
      componentWillMount() {
        this.props.signals[this.props.modules.cerebralModuleForm.name].initializeInput(finalOpts)
        this.props.signals[this.props.modules.cerebralModuleForm.name].addToForm(finalOpts)
      }
      componentWillUnmount() {
        this.props.signals[this.props.modules.cerebralModuleForm.name].removeFromForm(finalOpts)
      }
      render() {
        var {cerebralInput = {}, ...other} = this.props;
        //prepare the various "bindings"
        var onChange = (event) => {
          this.props.signals[this.props.modules.cerebralModuleForm.name].change.sync({
            value: event.target ? (event.target.type === 'checkbox' ? event.target.checked : event.target.value) : event,
            ...finalOpts
          })
        }
        var onBlur = (event) => {
          this.props.signals[this.props.modules.cerebralModuleForm.name].blur({
            value: event.target ? (event.target.type === 'checkbox' ? event.target.checked : event.target.value) : event,
            ...finalOpts
          })
          return true
        }
        var {value} = cerebralInput
        var formProps = {
          ...cerebralInput,
          onChange,
          onBlur,
          checked: value
          // input: {
          //   onChange,
          //   onBlur,
          //   value
          // },
          // radio: {
          //   onChange,
          //   value
          // },
        }
        return <ComposedComponent {...other} {...formProps} />;
      }
    }, finalOpts ? 
    getCerebralPaths(finalOpts) 
    : 
    function (props) {
      finalOpts = opts(props)
      return getCerebralPaths(finalOpts);
    }
  )
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}