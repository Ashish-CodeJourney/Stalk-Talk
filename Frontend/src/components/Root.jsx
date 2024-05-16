import React from 'react'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import { Outlet } from 'react-router-dom'

function Root() {
  return (
    <>
    {/* <Header /> */}
    <Outlet />
    <Footer />
    </>
  )
}

export default Root
