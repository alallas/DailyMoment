import * as actionTypes from "../action-types";
export function addNumberAction(data) {
  return {
    type: actionTypes.ADD,
    data,
  };
}

export function addNumberAsyncAction(data) {
  return {
    type: actionTypes.WRAP_ADD,
    data,
  };
}

export function stopAddNumberAction(data) {
  return {
    type: actionTypes.STOP_ADD,
    data,
  };
}
