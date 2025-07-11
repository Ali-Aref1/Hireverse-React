import { useState, useEffect, useContext} from 'react';
import { BsArrowLeftCircleFill as Arrow } from 'react-icons/bs';
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { io, Socket } from 'socket.io-client';
import WebcamStream from '../components/Interview/WebcamStream';
import { VoiceButton } from '../components/Interview/VoiceButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MdError } from 'react-icons/md';
import { Editor } from '@monaco-editor/react';
import { FaRegCheckCircle } from "react-icons/fa";
import { PixelStreamingWrapper } from '../components/Interview/PixelStreamingWrapper';
import { Message } from '../interfaces/Interview'; // Import the Message interface
import { ChatBox } from '../components/ChatBox';



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
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false); // State to track if the interviewer is speaking
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null); // Track current audio element
  const navigate = useNavigate();
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

    NodeSocket.on('ai_response', (response) => {
      if (response.audio) {
        // Stop any currently playing audio
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.audio), c => c.charCodeAt(0))],
          { type: 'audio/wav' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Track the current audio
        setCurrentAudio(audio);
        setInterviewerSpeaking(true);
        
        audio.play();
        audio.onended = () => {
          setInterviewerSpeaking(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl); // Clean up the object URL
          startListening(); // Allow user to speak
        };
        
        // Clean up if audio fails to play
        audio.onerror = () => {
          setInterviewerSpeaking(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
      }
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
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      NodeSocket.disconnect(); // Disconnect socket on cleanup
      setSocket(null); // Clear socket from state
    };
  }, [user, currentAudio]);

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
    }
    else if (phase === "coding") {
      setShowChatBox(false);
    }
    else {
      setShowChatBox(true);
      setShowEndFade(false);
    }
  }, [phase]);



  const handleBack = () => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
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
        className="rounded-full m-4 absolute flex items-center gap-2 text-2xl font-bold antialiased z-20"
      >
        <Arrow className="w-10 h-10" />
        Back
      </Link>
      {(socket && !error && phase != "end") && <WebcamStream socket={socket} userId={user.id} />}
      {error != null ? (
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
      ) : showEndFade ? (
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
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-sm subpixel-antialiased transition-opacity duration-700 relative px-10">
          <div className="w-full h-screen flex flex-col pb-10 pt-20 justify-center">
            <div className='flex h-fit items-center'>
              <div className="flex flex-row w-full h-[75vh] max-h-[75vh]">
                {/* PixelStreamingWrapper takes up 2/3 of the flex space */}
                <div className="h-full flex items-center flex-[2_2_0%] min-w-0" style={{ aspectRatio: '16/9' }}>
                  <PixelStreamingWrapper
                    initialSettings={{
                      AutoPlayVideo: true,
                      AutoConnect: true,
                      ss: 'ws://localhost:80',
                      StartVideoMuted: true,
                      HoveringMouse: true,
                      WaitForStreamer: true,
                      StreamerId: 'DefaultStreamer'
                    }}
                  />
                </div>
                {/* Right column takes up 1/3 of the flex space */}
                <div className="flex flex-col h-full flex-[1_1_0%] min-w-0">
                  <ChatBox
                    chat={chat}
                    setCode={setCode}
                    showTyping={showTyping}
                    phase={phase}
                  />
                  {phase === "coding" && (
                    <div style={{ height: "50%" }} className="flex flex-col">
                      <Editor
                        height="100%"
                        width="100%"
                        language="javascript"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          readOnly: true
                        }}
                      />
                      <button className='text-xl bg-blue-500 rounded-full h-24'>Submit Code</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* VoiceButton fixed at the bottom */}
          {showChatBox && (
              <VoiceButton
                onClick={toggleListening}
                className="w-16 h-16 mb-10"
                isListening={isListening}
                loading={loading}
                interviewerSpeaking={interviewerSpeaking} 
              />
          )}
        </div>
      )}
    </>
  );
};