import React from "react";
import { connect } from "react-redux";
import "./Notification.scss";

const Notification = ({ type, message }) => {
  return <div className={`Notification Notification__${type}`}>{message}</div>;
};

export default Notification;
