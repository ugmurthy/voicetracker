
function NavBar() {
  const appName = "My App"
  return (
    <div className="navbar bg-base-100">
  <div className="flex-1">
    <a className="btn btn-ghost text-xl" href="/">{appName}</a>
  </div>
  <div className="flex-none gap-2">
   
    {/* SEARCH BOX */}
    {/*  <div className="form-control">
      <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />
    </div>
    */}

    {/* DROP DOWN Menu - uncomment if u want it */} 
    {/* ----start----  
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="/avatar.png" />
        </div>
      </div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <a className="justify-between">
            Profile
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
       ---end--- */}
    <div className="divider">Separator</div>
  </div>
</div>
  )
}

export default NavBar