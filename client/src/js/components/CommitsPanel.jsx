var React = require('react/addons');

var CommitsPanel = React.createClass({

  togglePanel: function() {
    var panel = React.findDOMNode(this.refs.commitsPanel);
    var button = React.findDOMNode(this.refs.commitsPanelButton);

    if (panel.style.transform === 'translateX(500px)' || panel.style.transform === '') {
      panel.style.transform = 'translateX(0)';
      button.style.transform = 'translateX(-416px)';
      button.innerHTML = 'Close';
    } else {
      panel.style.transform = 'translateX(500px)';
      button.style.transform = 'translateX(0)';
      button.innerHTML = 'Commits Progress';
    }
  },

  render: function() {
    return (
      <div>
        <a className="panel-button commits-panel-button" onClick={this.togglePanel} ref="commitsPanelButton">
          Commits Progress
        </a>
        <div className="panel commits-panel" ref="commitsPanel">
          <h2>{this.props.user.github.username}</h2>
        </div>
      </div>
    );
  }

});

module.exports = CommitsPanel;
