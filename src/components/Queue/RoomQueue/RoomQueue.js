import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
  queue: state.queue,
});

const ConnectedRoomQueue = ({ queue }) => {
  if (queue.length > 0) {
    return (
      <React.Fragment>
        {queue
            .map((queueItem, index) =>
              (
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

ConnectedRoomQueue.propTypes = {
  queue: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const RoomQueue = connect(mapStateToProps)(ConnectedRoomQueue);

export default RoomQueue;
