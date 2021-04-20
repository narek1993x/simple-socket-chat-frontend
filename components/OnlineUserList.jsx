import React, { memo } from "react";
import { connect } from "react-redux";
import Badge from "shared/Badge";

const OnlineUserList = memo((props) => {
  const { users, currentUser, subscribeToUser, subscribedUser = {} } = props;

  const orderedUsers = [...users].sort((a, b) => a.id - b.id);
  const onlineUsersCount = orderedUsers.reduce((a, b) => {
    if (b.online) a++;
    return a;
  }, 0);

  return (
    <div className="online-users">
      <ul>
        <h3>Online users count: {onlineUsersCount}</h3>
        {orderedUsers.map((user) => {
          const isCurrent = user._id === currentUser._id;
          const selected = subscribedUser?.username === user.username;
          const unseenMessages = currentUser.unseenMessages.find((m) => m.from === user._id);

          return (
            <li key={user._id} className={`user ${selected ? "selected" : ""}`}>
              <a onClick={() => !isCurrent && subscribeToUser(user)}>
                <span className={`status${user.online ? " online" : ""}`}>{user.online ? "●" : "○"}</span>
                {user.username} {isCurrent && " (you)"}
                {unseenMessages?.count ? <Badge text={unseenMessages.count} /> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

const mapStateToProps = (state) => ({
  users: state.user.users,
});

export default connect(mapStateToProps)(OnlineUserList);
