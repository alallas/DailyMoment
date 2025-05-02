import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNumberAsyncAction, stopAddNumberAction } from "../../store/action/counter";

function Counter() {
  const state = useSelector((state) => state.counter);
  const dispatch = useDispatch();

  const handleNumberPlus = () => {
    // debugger
    console.log("1 time", new Date().getSeconds());
    dispatch(addNumberAsyncAction());
  };

  const stopNumberPlus = () => {
    dispatch(stopAddNumberAction());
  };

  return (
    <>
      <div>number: {state.number}</div>
      <button onClick={handleNumberPlus}>+1</button>
      <br />
      <button onClick={stopNumberPlus}>stop</button>
    </>
  );
}

export default Counter;
