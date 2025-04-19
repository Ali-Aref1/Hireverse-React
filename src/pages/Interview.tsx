import { useEffect, useState } from 'react';
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs';
import { MessageInput } from '../components/Interview/MessageInput';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



import axios from 'axios';
interface Message {
  sender: string;
  message: string;
}
export const Interview = () => {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchInitialMessage = async () => {
      try {
        const res = await axios.get('http://localhost:3000/start_interview');
        const initialMessage: Message = { sender: 'Interviewer', message: res.data.response };
        console.log('Initial message:', initialMessage);
        setChat([initialMessage]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial message:', error);
      }
    };

    if(chat.length===0)fetchInitialMessage();
  }, []);
    

  const handleSend = async (message: string) => {
    console.log('Sending message:', message);
    setLoading(true);
    try {
      const newMessage: Message = { sender: 'You', message: message };
      setChat((prevChat) => [...prevChat, newMessage]);
      const res = await axios.post('http://localhost:3000/send_prompt', { user_input: message });
      const responseMessage: Message = { sender: 'Interviewer', message: res.data.response };
      setChat((prevChat) => [...prevChat, responseMessage]);
      setLoading(false);
      console.log('Received response:', responseMessage);
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
      <div className="w-full h-full flex flex-col items-center justify-center text-sm">
        <div className='w-4/5 h-screen flex flex-col pb-10 pt-20 justify-between'>
        <div className="w-full p-4 border border-gray-300 rounded bg-slate-500 grid overflow-y-auto h-4/5" style={{ display: 'grid', gridTemplateColumns: '100px auto', rowGap: '10px' }}>
          {chat.map((message, index) => (
            <>
              <div className="font-bold">{message.sender}:</div>
              <div>{typeof message.message === 'object' ? JSON.stringify(message.message) : message.message}</div>
            </>
          ))}
        </div>
        <MessageInput onSend={handleSend} loading={loading} />
      </div>
      
      </div>
    </>
  );
};