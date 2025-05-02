import * as actionsType from "../action-types";

const iniState = {
  number: 0,
};

export default function (state = iniState, action) {
  switch (action.type) {
    case actionsType.ADD:
      return { ...state, number: state.number + 1 };
    default:
      return { ...state };
  }
}
