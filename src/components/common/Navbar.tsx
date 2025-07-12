import Logo from "../../assets/logo.png"
import { Link, useNavigate } from "react-router-dom"
import { FaCircleUser } from "react-icons/fa6";
import { useState, useContext } from "react";
import { UserContext } from "../../App";
import { UserMenu } from "./UserMenu";
import { HireverseTitle } from "./HireverseTitle";
export const Navbar = () => {
    const navigate = useNavigate();
    const {user,setUser} = useContext(UserContext);
    const [showMenu, setShowMenu] = useState(false);
  return (
    <div
      className="fixed top-0 left-0 right-0 h-24 border-[#002255] border-b-4 flex items-center px-4 justify-between z-50"
      style={{
        background: "linear-gradient(to right, rgba(26,35,64,0.7) 0%, rgba(21,27,46,0.7) 75%, rgba(15,22,61,0.7) 100%)"
      }}
    >
    <span className="cursor-pointer" onClick={() => navigate("/")}>
      <img
        src={Logo}
        alt="Hireverse Logo"
        className="inline-block mr-2 w-20 h-20 border-secondary border rounded-full p-1"
      />
      <HireverseTitle size={24} />
    </span>

    <div className="relative flex items-center">
    {user?<>
    <UserMenu showMenu={showMenu} setShowMenu={setShowMenu} user={user} setUser={setUser}/>
    <FaCircleUser className="cursor-pointer" onClick={()=>{setShowMenu((prev)=>(!prev))}} size={50}/>
    </>
    :<>
        <Link to="/login">
        <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
            Login
        </button>
        </Link>
        <Link to="/register">
        <button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors ml-2">
            Register
        </button>
        </Link>
        </>  
    }
    </div>
    </div>
  )
}
