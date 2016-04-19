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
      this.setState({page: 'torrentDetails'});
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
                         <TorrentDetails />
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




/* TORRENT FILE

var TorrentFileList = React.createClass({
  loadFiles: function () {
    $.ajax({
      url: '/torrent/' + this.props.torrent.key + '/files',
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function (data) {
        this.setState({files: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error('loadFiles', status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function () {
    return {files: []};
  },

  componentDidMount: function () {
    this.loadFiles();
    setInterval(this.loadFiles, refreshDelay);
  },

  render: function () {
    var self = this;

    var fileNodes = this.state.files.map(function (file) {
      var url = '/torrent' + self.props.torrent.key + '/files/' + file.id; 
      return (
        <li>{file.name + '-' + file.size + '-'}<a href={url}>Download</a></li> 
      );
    });

    return (
      <tr className="torrentFiles">
        <td colspan="8">
          <ul className="list-unstyled">  
            {fileNodes}
          </ul>
        </td>
      </tr>
    );
  }
});*/

React.render(
  <Page url="/torrent/all" />,
  document.getElementById('content')
);