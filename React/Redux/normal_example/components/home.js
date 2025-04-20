import React from "react"
import { useDispatch, useSelector } from "react-redux"
import actions from "../store/actions/home"

function Home() {

  // 下面相当于用了useContext拿到顶层的上下文，拿到里面的store的dispatch函数
  const dispatch = useDispatch()
  const selector = useSelector((state) => state.home)

  const handleSyncClick = () => {
    dispatch(actions.multiplyUser())
  }

  const handleAsyncClick = () => {
    dispatch(actions.fetchTitleData())
  }

  return (
    <div>
      <p>{selector.user}</p>
      <button onClick={handleSyncClick}>*2</button>
      <p>{selector.title}</p>
      <button onClick={handleAsyncClick}>*2</button>
    </div>
  )
  
}

export default Home




