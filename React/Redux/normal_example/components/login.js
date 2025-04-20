import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from 'react-route-dom'
import { LogoutActionCreator } from "../store_toolkit/modules/user"

// 这里演示的是另一种写法，redux官网推荐的toolkit写法，截止2025.3.20还没研究源码

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
		dispatch(LogoutActionCreator())
			.then((res) => {
				const { message: resMessage } = res.payload
        console.log(resMessage)
        navigate("/users/login")
			})
			.catch((err) => {
				console.log(err);
			});
	};
  
  return (
    <>
      <button onClick={handleLogout}>navigate</button>
    </>
  )
}


export default Login


