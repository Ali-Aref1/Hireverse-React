import { Link } from "react-router-dom";
import { handleLogout } from "../../utils/auth";

interface UserMenuProps {
    showMenu: boolean;
    setShowMenu: (showMenu: boolean) => void;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
}

export const UserMenu = ({showMenu, setShowMenu, user, setUser}:UserMenuProps) => {
  console.log(user);
  return (
    <div className={`${showMenu ? "h-fit border-2 py-2" : "h-0 border-0 py-0"} absolute transition-all duration-300 ease-in-out top-0 right-full mr-2 border-secondary rounded-xl w-32 bg-gray-800 z-50 overflow-hidden`}>
    <div className="w-full text-white px-3 py-2 text-lg transition-colors font-bold text-center">{user.data.Fname} {user.data.Lname}</div>
    <div className="w-full h-0 border-2 border-slate-900"></div>
    <Link to={`/profile`}><button className="w-full text-white hover:bg-gray-700 px-3 py-2 text-sm transition-colors font-bold" onClick={()=>{setShowMenu(false)}}>Profile</button></Link>
    <div className="w-full h-0 border-2 border-slate-900"></div>
    <button className="w-full text-white hover:bg-gray-700 px-3 py-2 text-sm transition-colors font-bold" onClick={() => {handleLogout(user,setUser); setShowMenu(false);}}>Logout</button>
    </div>
  )
}
