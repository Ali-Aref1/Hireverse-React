import { useState, useEffect, useContext, useRef } from 'react';
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
import { MdError } from 'react-icons/md';
import { Editor } from '@monaco-editor/react';
import { FaRegCheckCircle } from "react-icons/fa";

interface Message {
  sender: string;
  message: string | { response: string };
  isCode?: boolean; // Optional property to indicate if the message is code
  transition?: boolean; // Optional property to indicate if the message is a transition message
}

export const Interview = () => {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTyping, setShowTyping] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null); // Store socket in state
  const [voiceText, setVoiceText] = useState<string>('');
  const [phase, setPhase] = useState<"greeting"|"behavioural"|"technical"|"coding"|"end">("greeting"); 
  const [code, setCode] = useState<string>('');
  const [showChatBox, setShowChatBox] = useState(true);
  const [showEndFade, setShowEndFade] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userContext = useContext(UserContext);

  const [error,setError]= useState<string | null>(null);

  const handleSend = async (message: string) => {
    console.log('Sending message:', message);
    if (message.trim() === '') {
      return; // Prevent sending empty messages
    }
    setLoading(true);
      const newMessage: Message = { sender: 'You', message: message, isCode: phase === "coding" };
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
    if (!user) return;

    // Pass the access token in the auth option
    const NodeSocket = io('http://localhost:3000', {
      auth: {
        token: user.accessToken
      }
    });
    setSocket(NodeSocket);

    NodeSocket.on('connect', () => {
      NodeSocket.emit('attach_user', user); // Send the user data to the server to attach it to the socket id
    });

    NodeSocket.on('ai_response', (response:any) => {
      const newMessage: Message = { sender: 'Interviewer', message: response };
      if(response.phase!== phase) {
        setPhase(response.phase as "greeting"|"behavioural"|"technical"|"coding"|"end");
      }
      setChat((prevChat) => {console.log([...prevChat, newMessage]); return [...prevChat, newMessage]});
      if(timeout)clearTimeout(timeout); // Clear timeout for typing indicator
      if(!response.transition)
      {
        setLoading(false);
        setShowTyping(false);
      }
    });

    NodeSocket.on('message_history', (history: Message[]) => {
      setChat(history);
      console.log(history);
      if(!history[history.length -1].transition)
      {
        setLoading(false);
        setShowTyping(false);
      }
    });

    NodeSocket.on('error', (error:any) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
    });

    return () => {
      NodeSocket.disconnect(); // Disconnect socket on cleanup
      setSocket(null); // Clear socket from state
    };
  }, [user]);

  // Always keep phase in sync with the latest message
  useEffect(() => {
    if (chat.length > 0) {
      const last = chat[chat.length - 1];
      // If the message has a phase property, use it
      if (typeof last.message === "object" && last.message !== null && "phase" in last.message) {
        setPhase((last.message as any).phase);
      } else if ((last as any).phase) {
        setPhase((last as any).phase);
      }
    }
  }, [chat]);

  // Fade out chat box and fade in complete message when phase is "end"
  useEffect(() => {
    console.log('Phase changed:', phase);
    if (phase === "end") {
      setTimeout(() => {
        setShowChatBox(false);
        setTimeout(() => setShowEndFade(true), 500); // fade in after fade out
        if (socket) socket.emit('end_session'); // Emit end session event to the server
      }, 5000);
    } else {
      setShowChatBox(true);
      setShowEndFade(false);
    }
  }, [phase]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, showTyping]);

  const handleBack = () => {
    if (socket) {
      socket.emit('end_session');
    }
    navigate('/');
  };

  return (
    <>
      <Link
        to="/"
        onClick={e => {
          e.preventDefault();
          handleBack();
        }}
        className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold antialiased"
      >
        <Arrow className="w-10 h-10" />
        Back
      </Link>
        {(socket && !error && phase!="end")&& <WebcamStream socket={socket} userId={user.id} />}
      {error!=null?
      <div className="flex flex-col items-center justify-center gap-4 p-8 h-full">
        <div className='flex flex-col items-center justify-center gap-2 w-1/2 h-1/2 bg-white border border-red-300 rounded-lg shadow-lg p-6'>
        <span className="text-red-600 text-5xl">
          <MdError />
        </span>
        <span className="text-lg font-semibold text-red-700">
          {error}
        </span>
        </div>
      </div>
      :
      showEndFade?
      <div className="flex flex-col items-center justify-center gap-4 p-8 h-full transition-opacity duration-700 opacity-100">
        <div className='flex flex-col items-center justify-center gap-2 w-1/2 h-1/2 bg-white border border-red-300 rounded-lg shadow-lg p-6'>
        <span className="text-green-600 text-5xl">
          <FaRegCheckCircle />
        </span>
        <span className="text-lg font-semibold text-slate-500">
          Your interview is complete! Please wait while we process your results.
        </span>
        <Link to={`/interviews`}><button className='bg-blue-500 text-white rounded-full p-4'>Check Evaluation Status</button></Link>
        </div>
      </div>
      :
      <div className={`w-full h-full flex flex-col items-center justify-center text-sm subpixel-antialiased transition-opacity duration-700 ${!showChatBox && "opacity-0 pointer-events-none"}`}>
        <div className="w-4/5 h-screen flex flex-col pb-10 pt-20">
          <div className={`flex flex-1 gap-4 mb-4 h-[75vh] max-h-[75vh] ${phase==="coding" ? "flex-row" : "flex-col"}`}>
            <div
              className={`p-4 border border-gray-300 rounded bg-slate-500 overflow-y-auto flex flex-col gap-4 transition-all duration-500
                ${phase !== "coding" ? "basis-[85.7143%] w-full" : "basis-[66.6667%] w-2/3"}`}
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
                <div>
                  {(() => {
                  if (message.isCode) {
                    return <><span className="italic">[You sent a segment of code.] </span><span className='text-blue-600 underline cursor-pointer' onClick={()=>{setCode(String(message.message))}}>Copy to code editor</span></>;
                  }
                  if (typeof message.message === 'string') {
                    return message.message;
                  } else if (
                    typeof message.message === 'object' &&
                    message.message !== null &&
                    'response' in message.message
                  ) {
                    return message.message.response;
                  } else {
                    return '';
                  }
                  })()}
                </div>
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
            {phase=="coding"?
            <div className="basis-[33.3333%] w-1/3 flex flex-col gap-2 items-center">
                <Editor
                height="100%"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? '')}
                />
              <button className={`bg-blue-500 text-xl font-bold p-2 rounded-lg w-full hover:bg-blue-600 transition-color duration-100 ${loading&&"opacity-50"}`} disabled={loading} onClick={()=>{if(!loading){handleSend(code);setCode("")}}}>Submit Code</button>
            </div>
            :<div className="w-full border border-gray-300 bg-slate-700 rounded basis-[14.2857%] flex items-center justify-center">
              {voiceText}
            </div>}
          </div>
          <div className='w-full flex items-center justify-between gap-6'>
          <MessageInput onSend={handleSend} loading={loading} isListening={isListening} phase={phase} />
          {(phase!=="coding"&&phase!=="end")&&<VoiceButton onClick={toggleListening} isListening={isListening} loading={loading}/>}
          </div>
        </div>
      </div>
      }
    </>
  );
};