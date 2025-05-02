import * as actionsType from "../action-types";

const iniState = {
  userinfo: 1,
}


export default function (state = iniState, action) {
  switch(action.type) {
    case actionsType.LOGIN:
      return {...state, userinfo: state.userinfo + 5};
    default:
      return {...state};
  }
}