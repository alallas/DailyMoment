import { MULTIPLE, CHANGECONTEXT } from "../action-types"

let iniState = { user: 1, title: 'title-default' }

export default function(state = iniState, action) {
  switch(action.type) {
    case MULTIPLE :
      return {...state, user: state.user * 2}
    case CHANGECONTEXT:
      return {...state, title: action.title}
    default:
      return state
  }
}

