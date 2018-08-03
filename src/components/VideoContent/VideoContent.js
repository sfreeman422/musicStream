import React, { Component } from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import ThumbsButton from './Children/ThumbsButton';
import ClientSocket from '../../ClientSocket';
import './VideoContent.css';

// Options to interact with the react-youtube component.
const options = {
  playerVars: {
    autoplay: 1,
    controls: 0,
    disablekb: 1,
    iv_load_policy: 3,
    rel: 0,
    showinfo: 0,
  },
};

const mapStateToProps = state => ({
  queue: state.queue,
});

class ConnectedVideoContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      upvotes: 0,
      downvotes: 0,
      player: {},
    };
    this.upvote = this.upvote.bind(this);
    this.downvote = this.downvote.bind(this);
    this.cleanUp = this.cleanUp.bind(this);
    this.handleReady = this.handleReady.bind(this);
    this.trackTime = this.trackTime.bind(this);
    this.timeSync = this.timeSync.bind(this);
    this.jumpToSeconds = this.jumpToSeconds.bind(this);
  }
  // Increments the state of the upvotes for the currently playing song.
  upvote() {
    this.setState({
      upvotes: this.state.upvotes + 1,
    });
  }
  // Increments the state of the downvotes for the currently playing song.
  downvote() {
    this.setState({
      downvotes: this.state.downvotes + 1,
    });
  }
  // Sends the data off to our parent to be sent to the DB and sets local state to 0 for UV and DV.
  cleanUp() {
    this.props.adjustQueue(this.props.queue[0], this.state.upvotes, this.state.downvotes);
    this.setState({
      upvotes: 0,
      downvotes: 0,
    });
  }
  // Allows us to invoke upVote/downVote from the keyboard.
  handleKeyUp(event) {
    if (event.keyCode === 87) {
      this.upVote(this.props.queue[0].linkUrl);
    } else if (event.keycode === 83) {
      this.downVote(this.props.queue[0].linkUrl);
    }
  }

  handleReady(event) {
    this.setState({ player: event.target });
    setInterval(() => this.trackTime(), 100);
    ClientSocket.client.on('syncWithServer', time => this.timeSync(time));
  }

  trackTime() {
    if (this.state.player) {
      const time = Math.round(this.state.player.getCurrentTime());
      ClientSocket.client.emit('timeSync', time);
    }
  }

  jumpToSeconds(seconds) {
    this.state.player.seekTo(seconds, true);
  }

  timeSync(serverTime) {
    console.log(`Time Sync called with serverTime${serverTime}`);
    if (this.state.player) {
      const playerTime = Math.round(this.state.player.getCurrentTime());
      if (serverTime !== playerTime) {
        let difference;
        if (playerTime > serverTime) {
          difference = playerTime - serverTime;
          if (difference > 1) {
            this.jumpToSeconds(playerTime - difference);
          }
        } else if (playerTime < serverTime) {
          difference = serverTime - playerTime;
          if (difference > 1) {
            this.jumpToSeconds(playerTime + difference);
          }
        }
      }
    }
  }

  render() {
    return (
      <div className="video-content-section">
        {this.props.queue.length > 0 ?
          <div className="video-content">
            <YouTube
              videoId={this.props.queue[0].linkUrl}
              opts={options}
              onEnd={() => this.cleanUp()}
              onReady={this.handleReady}
            />
            <ThumbsButton
              type="far fa-thumbs-down"
              songId={this.props.queue[0].linkUrl}
              action={() => this.downvote()}
              handleKeyUp={() => this.handleKeyUp()}
              votes={this.state.downvotes}
            />
            <ThumbsButton
              type="far fa-thumbs-up"
              songId={this.props.queue[0].linkUrl}
              action={() => this.upvote()}
              handleKeyUp={() => this.handleKeyUp()}
              votes={this.state.upvotes}
            />
          </div>
          :
          <h3>No songs in the queue! Queue something</h3>}
      </div>
    );
  }
}

const VideoContent = connect(mapStateToProps)(ConnectedVideoContent);

export default VideoContent;

ConnectedVideoContent.propTypes = {
  queue: PropTypes.arrayOf(PropTypes.object).isRequired,
  adjustQueue: PropTypes.func.isRequired,
};
