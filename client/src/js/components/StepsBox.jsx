var React = require('react');
var Chart = require('./Chart.jsx');

var StepsBox = React.createClass({

  getInitialState: function() {
    this.loginUser.bind(null, 'fitbit');
    this.loginUser.bind(null, 'jawbone');

    return null;
  },

  loginUser: function(service) {
    this.props.auth.login(service);
  },

  logUser: function() {
    console.log(this.props.user);
  },

  render: function() {
    return (
      <div className="steps-box">
        <h2>Steps</h2>
        <Chart parentId="steps-chart" currentValue={4500} maxValue={10000} />
        <a className="button" onClick={this.loginUser.bind(null, 'fitbit')}>Login to FitBit</a>
        <a className="button" onClick={this.loginUser.bind(null, 'jawbone')}>Login to Jawbone</a>
        <a className="button" onClick={this.logUser}>Console log user info</a>
      </div>
    );
  }

});

module.exports = StepsBox;
