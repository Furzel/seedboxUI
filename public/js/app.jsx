// APP

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
    return {
      torrents: [], 
      page: 'torrentList'
    };
  },

  componentDidMount: function () {
    this.loadTorrentList();
    setInterval(this.loadTorrentList, refreshDelay);
  },

  changePage: function (pageData) {
    if (pageData.page === 'torrentDetails')
      this.setState({
        page: 'torrentDetails',
        torrentKey: pageData.torrentKey
      });
  },

  render: function () {
    var currentPage = null;
    switch(this.state.page) {
      case 'torrentList': {
        currentPage = (<div className="main">
                        <LeftBar />
                        <TorrentList data={this.state.torrents} changePage={this.changePage}/>
                       </div>);
        break;
      }

      case 'torrentDetails': {
        currentPage = (<div className="main">
                         <TorrentDetails torrentKey={this.state.torrentKey} changePage={this.changePage}/>
                       </div>);
        break;
      }
    }
    
    return (
      <div className="page">
        <Header onAddTorrent={this.handleAddTorrent} page={this.state.page}/>
        {currentPage}
      </div>
    );
  }
});

// HEADER

var Header = React.createClass({
  onAddTorrent: function (event) {
    event.preventDefault();

    var url = this.refs.torrent_url.getDOMNode().value.trim();

    if (!url)
      return;

    this.props.onAddTorrent(url);

    this.refs.torrent_url.getDOMNode().value = '';

    location.reload(true);
  },

  render: function () {
    return (
      <div className="header">
        <h1 className="title">
          Bordemb Seedbox
        </h1>
        <div className="headerControls">
          <input type="text" placeholder="Torrent URL" ref="torrent_url" className="torrentUrlInput"/>
          <div className="btn-group">
            <button type="button" className="btn btn-danger" onClick={this.onAddTorrent}>Add torrent</button>
            <button type="button" className="btn btn-danger">Settings</button>
          </div>
        </div>
      </div>
    );
  }
});


React.render(
  <Page url="/torrent/all" />,
  document.getElementById('content')
);