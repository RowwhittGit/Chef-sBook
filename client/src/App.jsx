import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Login2 from './pages/Login2'
import Register2 from './pages/Register2'
import Create from './pages/Create'
import Msg from './pages/Msg'
import Notifications from './pages/Notifications'
import ViewPost from './pages/ViewPost' 
import ViewPost2 from './pages/ViewPost2'
import ProfileEdit from './pages/ProfileEdit'
import UpdatePost from './pages/UpdatePost'

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/register' element={<Register2 />} />
      <Route path='/login' element={<Login2 />} />
      <Route path='/profile' element={<Profile />} />
      <Route path='/create' element={<Create />} />
      <Route path='/notifications' element={<Notifications />} />
      <Route path='/chat' element={<Msg />} />
      <Route path='/post/:id' element={<ViewPost />} /> 
      {/* <Route path='/viewpost' element={<ViewPost2 />} /> */}
      <Route path='/edit_profile' element={<ProfileEdit />} />
      <Route path='/post/update/:id' element={<UpdatePost />} /> 
    </Routes>
    
  )
}
