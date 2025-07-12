import { PulseLoader } from "react-spinners";
import { Message } from "../interfaces/Interview"
import { useEffect, useRef } from "react";

interface ChatBoxProps {
    chat: Message[];
    setCode: (code: string) => void;
    showTyping: boolean;
    phase: "greeting" | "behavioural" | "technical" | "coding" | "end";
    }

export const ChatBox = ({chat,setCode,showTyping,phase}:ChatBoxProps) => {
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
        scrollToBottom();
    }, [chat, showTyping]);

  return (
    <div
    className={`p-4 border border-gray-300 rounded-r-lg bg-slate-500 overflow-y-auto flex flex-col gap-4 transition-all duration-500 h-full`}
    ref={chatContainerRef}
>
    {chat.map((message, index) => (
    <div key={index}>
        <div
        className={`w-full px-4 py-2 rounded-lg ${message.sender === 'You' ? 'bg-white text-gray-900' : 'bg-slate-700 text-white'}`}
        >
        <div className="text-sm font-bold">{message.sender}</div>
        <div>
            {(() => {
            if (message.isCode) {
                return <><span className="italic">[You sent a segment of code.] </span><span className='text-blue-600 underline cursor-pointer' onClick={() => { setCode(String(message.message)) }}>Copy to code editor</span></>;
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
  )
}
