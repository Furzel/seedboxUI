var TorrentDetails = React.createClass({
  loadTorrent: function (torrentUrl) {
    $.ajax({
      url: torrentUrl,
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function (data) {
        console.log('setState');
        this.setState({torrent: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.torrentUrl, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function () {
    return {
      torrent: null
    };
  },

  componentDidMount: function () {
    this.loadTorrent(this.props.torrentUrl);
  },

  updateTorrent: function (torrent) {
    this.setState({torrent: torrent});
  },

  render: function () {
    console.log('render');
    if (!this.state.torrent)
      return (
        <div className="loading">
          <BackButton changePage={this.props.changePage}/>
          <h1>LOADING</h1>
        </div>
      );

    return (
      <div className="torrentDetails container">
        <BackButton changePage={this.props.changePage}/>
        <div className="col-md-10 col-md-offset-1">
          <h1>{this.state.torrent.name}</h1>
          <p>Started: TODO</p>
          <p>Status: {this.state.torrent.status}</p>
          <TorrentActions torrent={this.state.torrent} updateTorrent={this.updateTorrent} displayType="button"/>
          <hr/>
          <h2>{this.state.torrent.files.length} files</h2>
          <TorrentFileList files={this.state.torrent.files}/>
        </div>
      </div>
    );
  }
});

var BackButton = React.createClass({
  goBack: function () {
    this.props.changePage({
      page: 'torrentList'
    });
  },

  render: function () {
    return (
      <div className="backButton" onClick={this.goBack}>
        <p><span className="glyphicon glyphicon-arrow-left"></span>Back</p> 
      </div>
    );
  }
});

var TorrentFileList = React.createClass({
  render: function () {
    var fileNodes = this.props.files.map(function (file) {
      return (
        <TorrentFile file={file}/>
      );
    });

    return (
      <table className="torrentFileList table">
        <thead>
          <tr className="listHeader">
            <td>File name</td>
            <td>Size</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {fileNodes}
        </tbody>
      </table>
    );
  }
});

var TorrentFile = React.createClass({
  beautifySize: function () {
    var fileSize = this.props.file.length;
    if (fileSize < 1024)
      return fileSize + ' B';

    fileSize /= 1024;

    if (fileSize < 1024)
      return Math.round(fileSize) + ' kB'

    fileSize /= 1024;

    if (fileSize < 1024)
      return Math.round(fileSize) + ' MB'

    return Math.round(fileSize) / 1024 + ' GB'
  },

  render: function () {
    return (
    <tr className="torrentFile">
      <td>{this.props.file.name}</td>
      <td>{this.beautifySize()}</td>
      <td><a href={this.props.file.url}>Download</a></td>
    </tr>
    );
  }
});