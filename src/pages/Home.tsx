import {Link} from 'react-router-dom';
export const Home = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
        <Link to="/interview">
        <button className="bg-white text-black p-4 rounded-full cursor-pointer">
            Start Interview
        </button>
        </Link>
        <Link to="/login">
        <button className="bg-white text-black p-4 rounded-full cursor-pointer ml-4">
            Login
        </button>
        </Link>
        <Link to="/register">
        <button className="bg-white text-black p-4 rounded-full cursor-pointer ml-4">
            Register
        </button>
        </Link>
        <Link to="/interviews">
        <button className="bg-white text-black p-4 rounded-full cursor-pointer ml-4">
            Interviews
        </button>
        </Link>
    </div>
  )
}

