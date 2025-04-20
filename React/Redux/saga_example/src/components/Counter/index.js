import React from "react";
import { useSelector, useDispatch } from "react-redux";

function Counter() {
  const state = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  const handleNumberPlus = () => {
    dispatch({type: 'wrap-add'})
  }
  
  return (
    <>
      <div>number: {state.number}</div>
      <button onClick={handleNumberPlus}>+1</button>
    </>

  )
}

export default Counter;