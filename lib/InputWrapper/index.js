'use strict';

var _reactTransformHmr2 = require('react-transform-hmr');

var _reactTransformHmr3 = _interopRequireDefault(_reactTransformHmr2);

var _react = require('react');

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = InputWrapper;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//HOC component

var _cerebralViewReact = require('cerebral-view-react');

var _react2 = _interopRequireDefault(_react);

//take in a user component
var _components = {
  _$Connector: {
    displayName: 'Connector',
    isInFunction: true
  }
};

var _reactComponentWrapper = (0, _reactTransformHmr3['default'])({
  filename: 'src/InputWrapper/index.js',
  components: _components,
  locals: [module],
  imports: [_react]
});

function _wrapComponent(uniqueId) {
  return function (ReactClass) {
    return _reactComponentWrapper(ReactClass, uniqueId);
  };
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function InputWrapper(ComposedComponent, options) {
  var cerebralFormId = guid();
  options = _extends({}, options, { cerebralFormId: cerebralFormId });
  //wrap a helper component in cerebral's HOC
  return (0, _cerebralViewReact.HOC)((function (_Component) {
    _inherits(Connector, _Component);

    function Connector() {
      _classCallCheck(this, _Connector);

      _get(Object.getPrototypeOf(_Connector.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Connector, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        this.props.signals[this.props.modules.cerebralModuleForm.name].init(options);
        this.props.signals[this.props.modules.cerebralModuleForm.name].addToForm(options);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.props.signals[this.props.modules.cerebralModuleForm.name].removeFromForm(options);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this = this;

        var _props = this.props;
        var _props$cerebralInput = _props.cerebralInput;
        var cerebralInput = _props$cerebralInput === undefined ? {} : _props$cerebralInput;

        var other = _objectWithoutProperties(_props, ['cerebralInput']);

        //prepare the various "bindings"
        var onChange = function onChange(event) {
          _this.props.signals[_this.props.modules.cerebralModuleForm.name].change.sync(_extends({
            value: event.target ? event.target.value : event
          }, options));
        };
        var onBlur = function onBlur(event) {
          _this.props.signals[_this.props.modules.cerebralModuleForm.name].blur(_extends({
            value: event.target ? event.target.value : event
          }, options));
          return true;
        };
        var value = cerebralInput.value;

        var formProps = _extends({}, cerebralInput, {
          onChange: onChange,
          onBlur: onBlur
        });
        // input: {
        //   onChange,
        //   onBlur,
        //   value
        // },
        // radio: {
        //   onChange,
        //   value
        // },
        return _react2['default'].createElement(ComposedComponent, _extends({}, other, formProps));
      }
    }]);

    var _Connector = Connector;
    Connector = _wrapComponent('_$Connector')(Connector) || Connector;
    return Connector;
  })(_react.Component), {
    cerebralInput: options.path
  });
}

//we could also take in other user-defined cerebral bindings here, but it seems like they can just wrap with cerebral like normal if they need to

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
module.exports = exports['default'];