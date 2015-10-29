Simple torrent client with a web UI designed for seedbox. 

This is a work in progress and this can't be used at the moment. 

To run the server : 

- you will need a redis server running on the default port 
- you will need node and npm installed
- run npm install on the root folder of the project
- run node index.js to start the server
- UI should be available at localhost:8000

= TODO BACKEND =
- [ ] add route to stop / resume torrent 
- [ ] add route to remove torrent
- [ ] refactor backend code ( torrent creation )
- [ ] add file related routes ( download, list files )
- [ ] Zip and download feature for multi file torrents
- [ ] In memory mockup of redis for test purpose 


= TODO FRONTEND = 
- [ ] branch actions
- [ ] No torrent state on the UI 
- [ ] Create file explorer page 
- [ ] Search feature for the client
- [ ] Fix torrent names wrapping[ ] Display error on the client

= WORKING = 
- [X] display torrent list
- [X] add a new torrent by URL
