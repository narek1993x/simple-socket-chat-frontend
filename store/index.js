import thunk from "redux-thunk";
import { createStore, applyMiddleware, combineReducers } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import message from "./message/reducer";
import room from "./room/reducer";
import user from "./user/reducer";
import global from "./global/reducer";

const rootReducers = combineReducers({
  message,
  room,
  user,
  global,
});

const composedEnhancers = composeWithDevTools(applyMiddleware(thunk));
const store = createStore(rootReducers, composedEnhancers);

export default store;
