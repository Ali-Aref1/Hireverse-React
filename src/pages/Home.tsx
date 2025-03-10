import {Link} from 'react-router-dom';
export const Home = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
        <Link to="/interview">
        <button className="bg-white text-black p-4 rounded-full cursor-pointer">
            Start Interview
        </button>
        </Link>
    </div>
  )
}

