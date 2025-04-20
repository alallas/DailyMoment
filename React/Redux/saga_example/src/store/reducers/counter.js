
const iniState = {
  number: 0,
}


export default function (state = iniState, action) {
  switch(action.type) {
    case 'add':
      return {...state, number: state.number + 1};
    default:
      return {...state};
  }
}