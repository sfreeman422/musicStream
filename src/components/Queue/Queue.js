import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import SearchResults from './Search/SearchResults';
import RoomQueue from './RoomQueue/RoomQueue';
import MyQueue from './MyQueue/MyQueue';
import History from './History/History';
import './Queue.css';

const mapStateToProps = state => ({
  queue: state.queue,
  history: state.history,
  roomId: state.roomId,
  user: state.user,
});

class ConnectedQueue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chosenView: 'queue',
      searchTerm: '',
      searchResults: [],
      isSearching: false,
    };
    this.changeView = this.changeView.bind(this);
    this.search = this.search.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
  }

  onSearchTermChange(event) {
    this.setState({
      searchTerm: event.target.value,
    });
    if (event.target.value === '') {
      this.setState({
        searchResults: [],
        chosenView: 'queue',
      });
    }
  }

  search(e) {
    e.preventDefault();
    this.setState({ isSearching: true, chosenView: 'searchResults' });
    fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: this.state.searchTerm,
      }),
    })
      .then(res => res.json())
      .then((json) => {
        this.setState({
          searchResults: json,
          isSearching: false,
        });
      });
  }

  // Adjusts the view of the component to show queue, history or myQueue.
  // Queue - Shows the current queue of songs. (Functional)
  // History  - Shows the songs that have been played. (Functional)
  // MyQueue - Shows the songs that a user has personally queued. (Not Functional)
  changeView(view) {
    this.setState({
      chosenView: view,
    });
  }

  render() {
    return (
      <div className="queue">
        <div className="view-buttons">
          <form onSubmit={this.search}>
            <input type="text" placeholder="Search for a song..." value={this.state.searchTerm} onChange={this.onSearchTermChange} />
            <i className="fas fa-search" />
          </form>
          <button onClick={() => this.changeView('queue')}>Queue</button>
          <button onClick={() => this.changeView('history')}>History</button>
          <button onClick={() => this.changeView('myQueue')}>My Queue</button>
          <button onClick={() => this.changeView('searchResults')}>Search Results</button>
        </div>
        <div className="queue-list">
          <table>
            <tbody>
              {this.state.chosenView === 'queue' && <RoomQueue />}
              {this.state.chosenView === 'history' && <History />}
              {this.state.chosenView === 'myQueue' && <MyQueue />}
              {this.state.chosenView === 'searchResults' && <SearchResults />}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
const Queue = connect(mapStateToProps)(ConnectedQueue);

export default Queue;

ConnectedQueue.propTypes = {
  queue: PropTypes.arrayOf(PropTypes.object),
  history: PropTypes.arrayOf(PropTypes.object),
  addToPlaylist: PropTypes.func.isRequired,
  user: PropTypes.number,
  roomId: PropTypes.number,
};

ConnectedQueue.defaultProps = {
  queue: [],
  history: [],
  user: 0,
  roomId: 0,
};
