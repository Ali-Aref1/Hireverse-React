import { useEffect, useState, useRef } from 'react';
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs';
import { MessageInput } from '../components/Interview/MessageInput';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';



import axios from 'axios';
interface Message {
  sender: string;
  message: string;
}
export const Interview = () => {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTyping, setShowTyping] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

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

  
  useEffect(() => {
    scrollToBottom();
  }, [chat,showTyping]);

  const handleSend = async (message: string) => {
    console.log('Sending message:', message);
    setLoading(true);
    const timeout=setTimeout(() => {
      setShowTyping(true);
    }
    , 1000); // Show typing indicator after 1 second
    try {
      const newMessage: Message = { sender: 'You', message: message };
      setChat((prevChat) => [...prevChat, newMessage]);
      const res = await axios.post('http://localhost:3000/send_prompt', { user_input: message });
      const responseMessage: Message = { sender: 'Interviewer', message: res.data.response };
      setChat((prevChat) => [...prevChat, responseMessage]);
      setLoading(false);
      setShowTyping(false);
      clearTimeout(timeout);
      console.log('Received response:', responseMessage);
    } catch (error) {
      console.error('Error generating text:', error);
    }
  };

  return (
    <>
      <Link to="/" className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold antialiased">
        <Arrow className="w-10 h-10" />
        Back
      </Link>
      <div className="w-full h-full flex flex-col items-center justify-center text-sm subpixel-antialiased">
        <div className='w-4/5 h-screen flex flex-col pb-10 pt-20 justify-between'>
        <div className="w-full p-4 border border-gray-300 rounded bg-slate-500 overflow-y-auto h-4/5 flex flex-col gap-4" ref={chatContainerRef}>
          {chat.map((message, index) => (
            <div
              key={index}
            >
              <div
          className={`w-full px-4 py-2 rounded-lg ${
            message.sender === 'You' ? 'bg-white text-gray-900' : 'bg-slate-700 text-white'
          }`}
              >
          <div className="text-sm font-bold">{message.sender}</div>
          <div>{typeof message.message === 'object' ? JSON.stringify(message.message) : message.message}</div>
              </div>
            </div>
          ))}
            {showTyping && (
            <div
              className='bg-slate-700 text-white w-20 px-4 py-4 rounded-lg flex items-center justify-center animate-fade-in'
            >
              <PulseLoader size={7} color={"white"}></PulseLoader>
            </div>
            )}
        </div>
        <MessageInput onSend={handleSend} loading={loading} />
      </div>
      
      </div>
    </>
  );
};