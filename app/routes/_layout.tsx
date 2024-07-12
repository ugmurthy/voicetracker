import NavBar from "../components/NavBar"
import { Outlet } from '@remix-run/react'
function _layout() {
  return (
    <div>
        <NavBar bg="bg-gray-200"></NavBar>
        <Outlet/>
    </div>
  )
}

export default _layout