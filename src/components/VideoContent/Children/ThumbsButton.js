import React from 'react';
import PropTypes from 'prop-types';
import './ThumbsButton.css';

// Renders a thumbsUp or thumbsDown button based on the props passed in.
const ThumbsButton = props => (
  <div
    className="thumbs"
    role="button"
    tabIndex="0"
    onClick={() => props.action()}
    onKeyUp={event => props.handleKeyUp(event)}
  >
    <i
      className={props.type}
    /><br />
    {props.type === 'far fa-thumbs-up' ? props.votes : null}
    {props.type === 'far fa-thumbs-down' ? props.votes : null}
  </div>
);

export default ThumbsButton;

ThumbsButton.propTypes = {
  type: PropTypes.string.isRequired,
  votes: PropTypes.number.isRequired,
  action: PropTypes.func.isRequired,
  handleKeyUp: PropTypes.func.isRequired,
};
