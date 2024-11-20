import NavBar from "../components/NavBar"
import { Outlet } from '@remix-run/react'
function _layout() {
  return (
    <div>
        {/*<NavBar></NavBar>*/}
        <Outlet/>
    </div>
  )
}

export default _layout