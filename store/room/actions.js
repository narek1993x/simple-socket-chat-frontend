import * as types from "./actionTypes";
import * as socketActions from "socket/socketActions";
import { createSubscriptions, socketQuery } from "socket/socket";
import { setError } from "store/global/actions";

export const addRoom = (body, queryAction) => {
  return async (dispatch) => {
    try {
      const newRoom = await socketQuery(body, queryAction);
      dispatch(setNewRoom(newRoom));
    } catch (error) {
      dispatch(setError(error));
      console.error("addRoom: ", error);
    }
  };
};

export const setRooms = (rooms) => {
  return {
    type: types.SET_ROOMS,
    rooms,
  };
};

export const setNewRoom = (newRoom) => {
  return {
    type: types.SET_NEW_ROOM,
    newRoom,
  };
};

createSubscriptions([
  {
    query: socketActions.ADD_ROOM,
    reduxAction: setNewRoom,
  },
]);
