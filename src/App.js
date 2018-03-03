import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import openSocket from 'socket.io-client';
import logo from './logo.svg';
import './App.css';
import Queue from './Children/Queue/Queue';
import VideoContent from './Children/VideoContent/VideoContent';
import Chat from './Children/Chat/Chat';
import NoRoom from './Children/NoRoom';
import testData from './testData';

let client;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomName: '',
      roomErr: '',
      users: '',
      connectedUserId: 1, // This is a placeholder. Should be dynamic.
      loggedInStatus: false,
      loggedInUser: '',
      queueArr: testData.queueArr,
      messageArr: testData.messageArr,
      historyArr: [],
    };
    this.markPlayed = this.markPlayed.bind(this);
    this.adjustQueue = this.adjustQueue.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);
    this.updateQueue = this.updateQueue.bind(this);
  }
  componentWillMount() {
    this.updateQueue();
  }
  // Makes a request to the server to make a song as played.
  // If a song has been played, it will be listed in the historyArr
  // If a song has not yet been played, it will be listed in the queue.
  markPlayed(songObj) {
    fetch('/api/played', {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songObj),
    }).then(response => response.json()).then((json) => {
      client.emit('queueChange', `Played video: ${songObj.title}`);
    });
  }
  updateQueue() {
    // If we have a roomName parameter...
    if (this.props.match.params.roomName !== undefined) {
      // Get the roomName, current queue and history queue from MySQL.
      fetch(`/api/${this.props.match.params.roomName}`)
        .then(response => response.json()).then((json) => {
          if (json.status === 200) {
            // Sets state based on results of query.
            this.setState({
              roomName: json.roomName,
              queueArr: json.queue,
              historyArr: json.history,
              roomId: json.roomId,
            });
            // Creates a socket connection for the client.
            client = openSocket();
            // Connects us to the specific name space we are looking for.
            // This needs work.
            // How can our users see messages/queue/video info via this socket?
            client.connect(`/${json.roomName}`);
            // Tells our client to update the queue when a song is added/removed, etc.
            client.on('updateQueue', () => this.updateQueue());
          } else if (json.status === 404) {
            this.setState({
              roomErr: json.message,
            });
          }
        });
    } else {
      // Get the roomName, current queue and history queue from MySQL.
      fetch('/api/lobby')
        .then(response => response.json()).then((json) => {
          if (json.status === 200) {
            // Sets state based on results of query.
            this.setState({
              roomName: json.roomName,
              queueArr: json.queue,
              historyArr: json.history,
              roomId: json.roomId,
            });
            // Creates a socket connection for the client.
            client = openSocket();
            // Connects us to the specific name space we are looking for.
            // This needs work.
            // How can our users see messages/queue/video info via this socket?
            client.connect(`/${json.roomName}`);
            // Tells our client to update the queue when a song is added/removed, etc.
            client.on('updateQueue', () => this.updateQueue());
          } else if (json.status === 404) {
            this.setState({
              roomErr: json.message,
            });
          }
        });
    }
  }
  addToPlaylist(songObj) {
    fetch('/api/addSong', {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(songObj),
    }).then(response => response.json()).then((json) => {
      // Lets our server know that we have added a song.
      client.emit('queueChange', `Added video: ${songObj.title}`);
    });
  }
  adjustQueue(songObj, upvotes, downvotes) {
    const dbObj = Object.assign(songObj, {});
    // The following three values should be sent to
    // a route that will adjust the amount of upvotes/downvotes on a song.
    // This will be stored in the DB so that end users can view the most liked songs in a room etc.
    // Possibility: May want to constantly update the upvotes/downvotes
    // per vote OR communicate the current # via socket?
    dbObj.upvotes += upvotes;
    dbObj.downvotes += downvotes;
    this.markPlayed(dbObj);
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{this.state.roomName === '' ? 'Welcome to Music Stream' : this.state.roomName}</h1>
        </header>
        {this.state.roomErr !== '' ?
          <div className="container">
            <NoRoom error={this.state.roomErr} />
          </div> :
          <div className="container">
            <Queue
              queueArr={this.state.queueArr}
              historyArr={this.state.historyArr}
              addToPlaylist={this.addToPlaylist}
              roomId={this.state.roomId}
              userId={this.state.connectedUserId}
            />
            <VideoContent
              queueArr={this.state.queueArr}
              adjustQueue={this.adjustQueue}
              client={client}
            />
            <Chat messageArr={this.state.messageArr} />
          </div>}
      </div>
    );
  }
}

export default App;
