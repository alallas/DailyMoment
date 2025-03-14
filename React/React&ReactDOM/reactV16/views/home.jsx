import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentRole = location?.state?.identify
  
  useEffect(() => {
    if (currentRole === '3') {
      console.log('currentRole is 3')
      navigate('/users/login')
    } else {
      console.log('currentRole not 3')
    }
  }, [])

  return (
    <div>
      Home----
      <span>{!currentRole ? 'no currentRole' : currentRole}</span>
    </div>
  )
}