import { useEffect, useState, useContext, useRef } from 'react';
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs';
import { MessageInput } from '../components/Interview/MessageInput';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import { UserContext } from '../App';
import { io, Socket } from 'socket.io-client';
import WebcamStream from '../components/Interview/WebcamStream';
import { VoiceButton } from '../components/Interview/VoiceButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface Message {
  sender: string;
  message: string;
}

export const Interview = () => {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTyping, setShowTyping] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null); // Store socket in state
  const [voiceText, setVoiceText] = useState<string>('');
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);
  const handleSend = async (message: string) => {
    if(message.trim() === '') return; // Prevent sending empty messages
    setLoading(true);
      const newMessage: Message = { sender: 'You', message: message };
      setChat((prevChat) => [...prevChat, newMessage]);
      timeout = setTimeout(() => setShowTyping(true), 500); // Show typing indicator after 1 second
      if (socket) {
        socket.emit('message', newMessage.message); // Emit message to the server
      }
  };
  const { startListening, stopListening, isListening } = useSpeechRecognition(voiceText, setVoiceText, handleSend);
  const toggleListening = () => {
    if (isListening) {
      stopListening(); // Stop listening if already listening
      console.log('Stopped listening');
    }
    else {
      startListening(); // Start listening if not already listening
      console.log('Started listening');
    }
  }
  let timeout: ReturnType<typeof setTimeout> | null = null; // Declare timeout variable
  if (!userContext) {
    throw new Error('UserContext is not defined');
  }
  const { user } = userContext;
  if (!user) return <Navigate to="/" />;

  useEffect(() => {
    const NodeSocket = io('http://localhost:3000'); // Initialize socket
    setSocket(NodeSocket); // Store socket in state

    NodeSocket.on('connect', () => {
      NodeSocket.emit('attach_user', user); // Send the user data to the server to attach it to the socket id
    });

    NodeSocket.on('ai_response', (response:string) => {
      const newMessage: Message = { sender: 'Interviewer', message: response };
      setChat((prevChat) => [...prevChat, newMessage]);
      if(timeout)clearTimeout(timeout); // Clear timeout for typing indicator
      setLoading(false);
      setShowTyping(false); // Hide typing indicator
    });

    NodeSocket.on('message_history', (history: Message[]) => {
      setChat(history);
      setLoading(false);
      setShowTyping(false);
    });

    return () => {
      // Only emit end_session if user is navigating away via UI (not on disconnect)
      NodeSocket.emit('end_session');
      NodeSocket.disconnect(); // Disconnect socket on cleanup
      setSocket(null); // Clear socket from state
    };
  }, [user]);

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
    scrollToBottom();
  }, [chat, showTyping]);



  return (
    <>
      <Link to="/" className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold antialiased">
        <Arrow className="w-10 h-10" />
        Back
      </Link>
        {socket && <WebcamStream socket={socket} userId={user.id} />}
      <div className="w-full h-full flex flex-col items-center justify-center text-sm subpixel-antialiased">
        <div className="w-4/5 h-screen flex flex-col pb-10 pt-20">
          <div className="flex flex-col flex-1 gap-4 mb-4">
            <div
              className="w-full p-4 border border-gray-300 rounded bg-slate-500 overflow-y-auto flex flex-col gap-4 basis-[85.7143%]"
              ref={chatContainerRef}
            >
            {chat.map((message, index) => (
              <div key={index}>
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
              className="bg-slate-700 text-white w-20 px-4 py-4 rounded-lg flex items-center justify-center animate-fade-in"
              >
              <PulseLoader size={7} color={'white'}></PulseLoader>
              </div>
            )}
            </div>
            <div className="w-full border border-gray-300 bg-slate-700 rounded basis-[14.2857%] flex items-center justify-center">
              {voiceText}
            </div>
          </div>
          <div className='w-full flex items-center justify-between gap-6'>
          <MessageInput onSend={handleSend} loading={loading} isListening={isListening} />
          <VoiceButton onClick={toggleListening} isListening={isListening} loading={loading}/>
          </div>
        </div>
      </div>
    </>
  );
};