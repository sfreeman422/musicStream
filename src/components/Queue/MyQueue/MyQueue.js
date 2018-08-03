import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
  queue: state.queue,
  user: state.user,
});

const ConnectedMyQueue = ({ queue, user }) => {
  if (queue.length > 0) {
    return (
      <React.Fragment>
        {queue
            .filter(queueItem => queueItem.userName === user.userName)
            .map((queueItem, index) => (
              <tr key={`queue-row-item-${index}`}>
                <td>{queueItem.linkName}{index === 0 ?
                  <i className="fas fa-headphones" /> : null}
                  <br /><span id="postedBy">Added by: {queueItem.userName}</span>
                </td>
              </tr>))}
      </React.Fragment>
    );
  } return null;
};

ConnectedMyQueue.propTypes = {
  queue: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.shape({ userName: PropTypes.string, userId: PropTypes.number }).isRequired,
};

const MyQueue = connect(mapStateToProps)(ConnectedMyQueue);

export default MyQueue;
