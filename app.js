import React from "react";
import { connect } from "react-redux";
import socket from "socket/socket";
import * as socketActions from "socket/socketActions";

import RoomList from "components/RoomList";
import OnlineUserList from "components/OnlineUserList";
import MessageList from "components/MessageList";
import SendMessageForm from "components/SendMessageForm";
import NewRoomForm from "components/NewRoomForm";
import Auth from "components/Auth";
import Loader from "components/shared/Loader";
import Notification from "components/shared/Notification";

import { addRoom } from "store/room/actions";
import { clearError } from "store/global/actions";
import { authUser, updateCurrentUser, subscribeToUser } from "store/user/actions";
import { setMessages, setPrivateMessages, addNewMessageByKey } from "store/message/actions";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      roomName: "",
      roomId: null,
      isUserNameSet: false,
      loading: false,
    };

    this.token = localStorage.getItem("userToken");
    this.authInputRef = React.createRef();
  }

  componentDidMount = () => {
    const { dispatch } = this.props;

    if (this.token) {
      this.setState({ loading: true });
      dispatch(authUser({ token: this.token }, socketActions.LOGIN_WITH_TOKEN));
    } else {
      this.authInputRef.current.focus();
    }
  };

  componentDidUpdate(prevProps) {
    const { isAuthenticated, error } = this.props;

    if ((prevProps.isAuthenticated !== isAuthenticated && isAuthenticated) || (prevProps.error !== error && error)) {
      this.setState({ loading: false });
    }
  }

  subscribeToRoom = ({ roomName, id }) => {
    const { currentUser, dispatch } = this.props;

    if (this.state.roomName) {
      socket.emit("query", {
        action: socketActions.LEAVE_ROOM,
        body: {
          roomName: this.state.roomName,
        },
      });
    }
    const emitData = {
      action: socketActions.SUBSCRIBE_ROOM,
      body: {
        roomName,
        roomId: id,
        currentUserId: currentUser._id,
      },
    };
    this.setState({ roomId: id, roomName });
    dispatch(setMessages([]));
    dispatch(subscribeToUser(null));

    socket.emit("query", emitData);
  };

  handleSubscribeToUser = (user) => {
    const { currentUser, dispatch } = this.props;

    const newUnseenMessages = currentUser.unseenMessages.map((m) => {
      if (m.from === user._id) {
        return { ...m, count: 0 };
      }
      return m;
    });

    const emitData = {
      action: socketActions.SUBSCRIBE_USER,
      body: {
        id: user._id,
        currentUserId: currentUser._id,
      },
    };

    this.setState({
      roomId: null,
      roomName: "",
    });

    dispatch(setPrivateMessages([]));
    dispatch(subscribeToUser(user));
    dispatch(updateCurrentUser({ unseenMessages: newUnseenMessages }));
    socket.emit("query", emitData);
  };

  sendMessage = (message) => {
    const { roomName, roomId } = this.state;
    const { currentUser, username, subscribedUser, dispatch } = this.props;

    if (!message) return;

    let emitData = {
      action: socketActions.MESSAGE,
      body: {
        message,
        userId: currentUser._id,
        roomName,
        roomId,
      },
    };

    if (subscribedUser?.username) {
      emitData = {
        action: socketActions.PRIVATE_MESSAGE,
        body: {
          message,
          directUserId: subscribedUser._id,
          username: subscribedUser.username,
          userId: currentUser._id,
        },
      };
    }

    const newItemKey = subscribedUser?._id ? "privateMessages" : "messages";
    dispatch(addNewMessageByKey({ message, username }, newItemKey));
    socket.emit("query", emitData);
  };

  addRoom = (roomName) => {
    const { dispatch, currentUser } = this.props;

    if (!roomName) return;

    const body = {
      name: roomName,
      userId: currentUser._id,
    };

    dispatch(addRoom(body, socketActions.ADD_ROOM));
  };

  handleUserAuth = ({ username, password, email, isSignin }) => {
    if (!username || !password || (!isSignin && !email)) return;

    const body = { isSignin, username, password, ...(!isSignin ? { email } : {}) };

    this.setState({ loading: true });
    this.props.dispatch(authUser(body, socketActions.LOGIN));
  };

  handleClearError = () => {
    this.props.dispatch(clearError());
  };

  render() {
    const { roomId, roomName, loading } = this.state;

    const { isAuthenticated, subscribedUser, currentUser, username, error } = this.props;

    const subscribedUsername = subscribedUser?.username;

    let content = (
      <Auth
        error={error}
        clearError={this.handleClearError}
        authInputRef={this.authInputRef}
        onHandleUserAuth={this.handleUserAuth}
      />
    );

    if (isAuthenticated) {
      content = (
        <div className="app">
          <RoomList currentRoomId={roomId} subscribeToRoom={this.subscribeToRoom} />
          <OnlineUserList
            currentUser={currentUser}
            subscribedUser={subscribedUser}
            subscribeToUser={this.handleSubscribeToUser}
          />
          <MessageList roomId={roomId} subscribedUsername={subscribedUsername} currentUserId={username} />
          <SendMessageForm
            disabled={!roomId && !subscribedUser?._id}
            sendMessage={this.sendMessage}
            roomName={roomName}
            subscribedUsername={subscribedUsername}
          />
          <NewRoomForm addRoom={this.addRoom} />
        </div>
      );
    }

    if (loading) {
      content = <Loader />;
    }

    return (
      <>
        {isAuthenticated && error && <Notification type="error" message={error} onClose={this.handleClearError} />}
        {content}
      </>
    );
  }
}

export default connect((state) => ({
  error: state.global.error,
  rooms: state.room.rooms,
  currentUser: state.user.currentUser,
  username: state.user.currentUser.username,
  isAuthenticated: state.user.isAuthenticated,
  subscribedUser: state.user.subscribedUser,
}))(App);
