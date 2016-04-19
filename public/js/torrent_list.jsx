// LEFT BAR

var LeftBar = React.createClass({
  render: function () {
    return (
      <div className="leftBar">
        <Search />
        <div className="reset">
          <button className="btn btn-default">Reset filters</button>
        </div>
        <UserList />
        <LabelList />
      </div>
    );
  }
});

var Search = React.createClass({
  render: function () {
    return (
      <div className="search">
        <form>
          <input type="text" className="form-control" placeholder="Search torrent" />
        </form>
      </div>
    );
  }
});

var UserList = React.createClass({
  render: function () {
    return (
      <div className="userList">
        <h2>Users</h2>
        <ul className="list-unstyled">
          <li><span className="label label-primary userLabel">Arthur</span></li>
          <li><span className="label label-primary userLabel">Tricia</span></li>
          <li><span className="label label-primary userLabel">Ford</span></li>
        </ul>
      </div>
    )
  }
});

var LabelList = React.createClass({
  render: function () {
    return (
      <div className="labelList">
        <h2>Labels</h2>
        <ul className="list-unstyled">
          <li><span className="label label-warning torrentLabel">Music</span></li>
          <li><span className="label label-warning torrentLabel">Video</span></li>
          <li><span className="label label-warning torrentLabel">Series</span></li>
          <li><span className="label label-warning torrentLabel">Windows</span></li>
          <li><span className="label label-warning torrentLabel">Book</span></li>
        </ul>
      </div>
    );
  }
});

// TORRENT LIST

var TorrentList = React.createClass({
  render: function () {
    var self = this;
    
    var torrentNodes = this.props.data.map(function (torrent) {
      return (
        <Torrent torrent={torrent} changePage={self.props.changePage}/>
      );
    }); 

    return (
      <div className="torrentList">
        <table className="table">
          <thead>
            <tr className="listHeader">
              <th>Name</th>
              <th>Labels</th>
              <th>Down</th>
              <th>Up</th>
              <th>Ratio</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {torrentNodes}
          </tbody>
        </table>
      </div>
    );
  }
});

var Torrent = React.createClass({
  getInitialState: function () {
    return {
      torrent: this.props.torrent,
      expanded: false
    };
  },

  updateTorrent: function (torrent) {
    this.setState({torrent: torrent});
  },

  openTorrentDetails: function (event) {
    event.preventDefault();

    this.props.changePage({page: 'torrentDetails', torrent: this.state.torrent})
  },

  render: function () {
    return (
      <tr className="torrentLine" onClick={this.openTorrentDetails}>
        <td>{this.state.torrent.name}</td>
        <td><span class="label label-warning">Labels</span></td>
        <td>TODO</td>
        <td>TODO</td>
        <td>TODO</td>
        <td>{Math.floor(this.state.torrent.progress)}%</td>
        <td>{this.state.torrent.status}</td>
        <td><TorrentActions torrent={this.state.torrent} updateTorrent={this.updateTorrent} displayType="glyph"/></td>
      </tr>
    );
  }
});
