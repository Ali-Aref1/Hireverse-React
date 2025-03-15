import { useEffect, useState } from 'react';
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs';
import { MessageInput } from '../components/Interview/MessageInput';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Interview = () => {
  const [response, setResponse] = useState('');
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

  const handleSend = async (message: string) => {
    console.log('Sending message:', message); // Add this line
    try {
      const res = await axios.post('http://localhost:5000/generate', { input: message });
      console.log('Response:', res.data); // Add this line
      setResponse(res.data.generated_text);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  return (
    <>
      <Link to="/" className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold">
        <Arrow className="w-10 h-10" />
        Back
      </Link>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full p-4 border border-gray-300 rounded mb-4">
          {response}
        </div>
        <MessageInput onSend={handleSend} />
      </div>
    </>
  );
};