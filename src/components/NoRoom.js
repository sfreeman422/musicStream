import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './NoRoom.css';

const mapStateToProps = state => ({
  error: state.roomErr,
});

// Renders a component to let the user know that a room was not found and why.
const ConnectedNoRoom = ({ error }) => (
  <div className="no-room">
    <h1>Sorry, the room you are searching for was not found.</h1>
    <h2>Error: {error.message}</h2>
  </div>
);

const NoRoom = connect(mapStateToProps)(ConnectedNoRoom);
export default NoRoom;

ConnectedNoRoom.propTypes = {
  error: PropTypes.shape({
    status: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
};

