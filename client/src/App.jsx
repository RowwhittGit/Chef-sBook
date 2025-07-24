import React from 'react'
import { Route, Routes } from 'react-router-dom'
// import Register from './pages/Register'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
// import Profile2 from './pages/Profile2'
// import ProfileEdit from './pages/ProfileEdit'
import Login2 from './pages/Login2'
import Register2 from './pages/Register2'
import Create from './pages/Create'
import Msg from './pages/Msg'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register2 />} />
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login2 />} />
      <Route path='/Profile' element={<Profile />} />
      <Route path='/create' element={<Create />} />
      <Route path='/notifications' element={<Notifications />} />
      <Route path='/chat' element={<Msg />} />

    </Routes>
  )
}
