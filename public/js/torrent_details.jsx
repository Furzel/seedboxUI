var TorrentDetails = React.createClass({
  loadTorrent: function (torrentKey) {
    $.ajax({
      url: '/torrent/' + torrentKey,
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function (data) {
        console.log('setState');
        this.setState({torrent: data});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  getInitialState: function () {
    return {
      torrent: null
    };
  },

  componentDidMount: function () {
    this.loadTorrent(this.props.torrentKey);
  },

  render: function () {
    console.log('render');
    if (!this.state.torrent)
      return (
        <div className="loading">
          <h1>LOADING</h1>
        </div>
      );

    return (
      <div className="torrentDetails container">
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
      <td><a href="#">Download</a></td>
    </tr>
    );
  }
});