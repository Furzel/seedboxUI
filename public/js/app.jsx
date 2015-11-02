var Page = React.createClass({
  handleAddTorrent: function (url) {
    $.ajax({
      url: '/torrent/add',
      dataType: 'json',
      type: 'POST',
      data: {torrent_url: url},
      success: function (torrent) {
        var newTorrentList = this.state.torrents.push(torrent);
        this.setState({torrents: newTorrentList});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  loadTorrentList: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function (data) {
        this.setState({torrents: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function () {
    return {torrents: []};
  },

  componentDidMount: function () {
    this.loadTorrentList();
    setInterval(this.loadTorrentList, 200000000);
  },

  render: function () {
    return (
      <div className="container">
        <Header onAddTorrent={this.handleAddTorrent}/>
        <TorrentList data={this.state.torrents} />
      </div>
    );
  }
});

var Header = React.createClass({
  render: function () {
    return (
      <div className="header">
        <div className="centerWrapper">

          <div className="headerControls">
            <div className="title"><h1>Seedbox UI</h1></div>
            <AddTorrentForm onAddTorrent={this.props.onAddTorrent}/>
          </div>

          <TorrentToolbar />

          <div className="listHeader">
            <div className="col1">Name</div>
            <div className="col2">Status</div>
            <div className="col3">Progress</div>
            <div className="col4">Actions</div>
          </div>
        </div>
      </div>
    );
  }
});

var AddTorrentForm = React.createClass({
  handleSubmit: function (event) {
    event.preventDefault();
    var url = this.refs.torrent_url.getDOMNode().value.trim();

    if (!url)
      return;

    this.props.onAddTorrent(url);

    this.refs.torrent_urlgetDOMNode().value = '';
  },

  render: function () {
    return (
      <form className="addTorrentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Torrent URL" ref="torrent_url" />
        <button type="submit">Add a torrent</button>
      </form>
    );
  }
});

var TorrentList = React.createClass({
  render: function () {
    var torrentNodes = this.props.data.map(function (torrent) {
      return (
        <Torrent torrent={torrent} />
      );
    }); 

    return (
      <div className="torrentList">
        <div className="centerWrapper">
          {torrentNodes}
        </div>
      </div>
    );
  }
});

var TorrentToolbar = React.createClass({
  render: function () {
    return (
      <div className="torrentToolbar">
        <input type="text" placeholder="Search for a torrent"/>
        <span className="fa fa-search fa-lg searchIcon"></span>
      </div>
    );
  }
});

var Torrent = React.createClass({
  getInitialState: function () {
    return {
      torrent: this.props.torrent
    };
  },

  updateTorrent: function (torrent) {
    this.setState({torrent: torrent});
  },

  render: function () {
    return (
      <div className="row">
        <div className="col1">{this.state.torrent.name}</div>
        <div className="col2">{this.state.torrent.status}</div>
        <TorrentProgress progress={Math.floor(this.state.torrent.progress)}/>
        <TorrentActions torrent={this.state.torrent} updateTorrent={this.updateTorrent}/>
      </div>
    );
  }
});

var TorrentProgress = React.createClass({
  render: function () {
    return (
      <div className="col3 progress">
          {this.props.progress}%
      </div>
    );
  }
});

var TorrentActions = React.createClass({
  getInitialState: function () {
    return {
      actions: this.getPossibleActions(this.props.torrent)
    }
  },

  getPossibleActions: function (torrent) {
    var actions = ['remove'];

    if (torrent.status === 'complete')
      actions.push('download');

    if (torrent.status === 'paused')
      actions.push('start');
    
    if (torrent.status === 'running')
      actions.push('stop');

    return actions;
  },

  pauseTorrent: function (event) {
    event.preventDefault();

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

  render: function () {
    var actionNodes = [],
        actions = this.getPossibleActions(this.props.torrent);

    // Can't loop, we need to keep the same order
    if (actions.indexOf('remove') !== -1)
      actionNodes.push((
        <a href="#"><span className="fa fa-trash"></span></a>
      ));

    if (actions.indexOf('download') !== -1)
      actionNodes.push((
        <a href="#"><span className="fa fa-arrow-down"></span></a>
      ));

    if (actions.indexOf('start') !== -1)
      actionNodes.push((
        <a href="#" onClick={this.restartTorrent}><span className="fa fa-play"></span></a>
      ));

    if (actions.indexOf('stop') !== -1)
      actionNodes.push((
        <a href="#" onClick={this.pauseTorrent}><span className="fa fa-pause"></span></a>
      ));

    return (
      <div className="col4 torrentActions">
        {{actionNodes}}
      </div>
    );
  }
});

React.render(
  <Page url="/torrent/all" />,
  document.getElementById('content')
);