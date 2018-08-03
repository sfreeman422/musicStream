import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './Chat.css';

const mapStateToProps = state => ({
  messages: state.messages,
});

class ConnectedChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
    this.handleUserMessage = this.handleUserMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  handleUserMessage(event) {
    this.setState({
      message: event.target.value,
    });
  }

  sendMessage(event) {
    event.preventDefault();
    this.props.sendMessage(this.state.message);
    this.setState({
      message: '',
    });
  }

  render() {
    return (
      <div className="chat">
        <div className="message-area">
          <table>
            <tbody>
              {this.props.messages.map((message, index) => <tr key={`message-row-${index}`}><td>{message.userName}: {message.message}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="message-input-area">
          <table>
            <tbody>
              <tr>
                <td>
                  <form onSubmit={this.sendMessage}>
                    <input
                      type="text"
                      placeholder="Enter text message here..."
                      value={this.state.message}
                      onChange={this.handleUserMessage}
                    />
                    <button type="submit">Send</button>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

ConnectedChat.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  sendMessage: PropTypes.func.isRequired,
};

ConnectedChat.defaultProps = {
  messages: [{}],
};
const Chat = connect(mapStateToProps)(ConnectedChat);

export default Chat;
