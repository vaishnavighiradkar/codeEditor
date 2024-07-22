import React, { useEffect } from 'react'
import axios from 'axios'

const Profile = () => {
  const token = localStorage.getItem('token');
useEffect(()=>{
  const handlegetcode = async () => {
    try {
      
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/getcode`,
        {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  console.log(response)
     
    } catch (error) {
    }
  };
  handlegetcode();
})
  
  return (
    <div>this is my profile</div>
  )
}

export default Profile