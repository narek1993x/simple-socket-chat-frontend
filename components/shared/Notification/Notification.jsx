import React from "react";
import "./Notification.scss";

const Notification = ({ type, message, onClose }) => {
  return (
    <div className={`Notification Notification__${type}`}>
      {message}
      <span className="Notification__close-btn" onClick={onClose}>
        &times;
      </span>
    </div>
  );
};

export default Notification;
