import { useEffect } from 'react'
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs'
import { MessageInput } from '../components/Interview/MessageInput';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

export const Interview = () => {
    useEffect(() => {}, []);
    const navigate = useNavigate();

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          navigate('/');
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [navigate]);

    return (
        <>
            <Link to="/" className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold">
                <Arrow className="w-10 h-10" />
                Back
            </Link>
            <div className="w-full h-full flex items-center justify-center">
              <MessageInput />
            </div>
        </>
    );
};
