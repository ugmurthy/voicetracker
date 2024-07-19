import clsx from "clsx";
import {Link, useRouteLoaderData} from '@remix-run/react'
import Theme from '../components/Theme';

// eslint-disable-next-line react/prop-types
function NavBar({bg,appName="My App"}) {
  const {user} = useRouteLoaderData('root');
  const className = clsx("navbar",bg)
  //console.log("User from root loader :",user)
  const tipData =  user?.verified_email? user.name : user?.email+ " (not verified)"
  const imgUrl = user && user?.verified_email? user.picture.url : "/avatar.png"
  return (
  <div className={className}>
  <div className="flex-1">
    <Link className="btn btn-ghost text-xl" to="/">{appName}</Link>
  </div>
  <div className="flex-none gap-2">   
    <div className="form-control">
      <input name="search" type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
    </div>
    <Theme />
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar"> 
        <div className="w-10 rounded-full ring-2 ring-white tooltip-left" data-tip={tipData} >
          <img alt="Tailwind CSS Navbar component" src={imgUrl} />
        </div>
      </div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <Link className="justify-between" to="/profile">
            Profile
          </Link>
        </li>
        <li><Link>Settings</Link></li>
        <li><Link to='/logout'>Logout</Link></li>
      </ul>
    </div>
  </div>
</div>
  )
}

export default NavBar