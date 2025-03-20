import { ADD, CHANGEIMAGE } from "../action-types"

let iniState = { number: 0, image: '/' }

export default function(state = iniState, action) {
  switch(action.type) {
    case ADD :
      return {...state, number: state.number + 1 }
    case CHANGEIMAGE:
      return {...state, image: action.image}
    default:
      return state
  }
}

