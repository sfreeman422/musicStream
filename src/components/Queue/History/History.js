import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
  history: state.history,
});

const ConnectedHistory = ({ history }) => (
  <React.Fragment>
    {history
      .map((historyItem, index) =>
        (<tr key={`history-row-item${index}`}>
          <td>{historyItem.linkName}<br />
            <span id="postedBy">Added by: {historyItem.userName}</span>
          </td>
         </tr>))}
  </React.Fragment>
);

ConnectedHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const History = connect(mapStateToProps)(ConnectedHistory);

export default History;
