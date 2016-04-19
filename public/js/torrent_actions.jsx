var TorrentActions = React.createClass({
  getInitialState: function () {
    return {
      actions: this.getPossibleActions(this.props.torrent)
    }
  },

  getPossibleActions: function (torrent) {
    var actions = ['remove'];

    if (torrent.status === 'paused')
      actions.push('start');
    
    if (torrent.status === 'running')
      actions.push('stop');

    return actions;
  },

  pauseTorrent: function (event) {
    event.preventDefault();
    event.stopPropagation();

    $.ajax({
      url: '/torrent/' + this.props.torrent.key + '/pause',
      dataType: 'json',
      type: 'POST',
      data: {},
      success: function (torrent) {
        this.props.updateTorrent(torrent);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('pauseTorrent', status, err.toString());
      }.bind(this)
    });
  },

  restartTorrent: function (event) {
    event.preventDefault();
    event.stopPropagation();

    $.ajax({
      url: '/torrent/' + this.props.torrent.key + '/restart',
      dataType: 'json',
      type: 'POST',
      data: {},
      success: function (torrent) {
        this.props.updateTorrent(torrent);
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('restartTorrent', status, err.toString());
      }.bind(this)
    });
  },

  removeTorrent: function (event) {
    event.preventDefault();
    event.stopPropagation();
  },

  render: function () {
    var actionNodes = [],
        actions = this.getPossibleActions(this.props.torrent);

    if (actions.indexOf('remove') !== -1)
      actionNodes.push((
        <TorrentActionTrigger actionType='remove' 
                              displayType={this.props.displayType} 
                              action={this.removeTorrent} />
      ));

    if (actions.indexOf('start') !== -1)
      actionNodes.push((
        <TorrentActionTrigger actionType='start' 
                              displayType={this.props.displayType} 
                              action={this.restartTorrent} />
      ));

    if (actions.indexOf('stop') !== -1)
      actionNodes.push((
        <TorrentActionTrigger actionType='stop' 
                              displayType={this.props.displayType} 
                              action={this.pauseTorrent} />
      ));

    return (
      <div className="torrentActions">
        {{actionNodes}}
      </div>
    );
  }
});

var TorrentActionTrigger = React.createClass({
  glyphType: function () {
    switch (this.props.actionType) {
      case 'start':
        return 'glyphicon-play';
      case 'stop':
        return 'glyphicon-pause';
      case 'remove':
        return 'glyphicon-remove';
    }
  },

  textType: function () {
    switch (this.props.actionType) {
      case 'start':
        return 'Resume';
      case 'stop':
        return 'Pause';
      case 'remove':
        return 'Remove';
    }
  },

  render: function () {
    switch (this.props.displayType) {
      case 'glyph': 
        return (
          <a className="torrentActionTrigger" href="#" onClick={this.props.action}>
            <span className={'glyphicon ' + this.glyphType()}></span>
          </a>
        );
      case 'button':
        return (
          <button className="btn btn-primary torrentActionTrigger" onClick={this.props.action}>
            {this.textType()}
          </button>
        );
    }
  }
});