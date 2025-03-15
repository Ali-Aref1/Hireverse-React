import { useState } from 'react';
import { IoMdSend as Send } from "react-icons/io";

interface MessageInputProps {
  onSend: (message: string) => void;
}

export const MessageInput = ({ onSend }: MessageInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="flex items-center gap-4 justify-center w-1/2 bg-secondary p-4 rounded-full">
      <input
        type="text"
        className="bg-white text-black p-4 rounded-full w-full outline-none"
        placeholder="Type your message here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className='bg-white rounded-full p-2' onClick={handleSend}>
        <Send className="w-10 h-10" color="#022A46" />
      </button>
    </div>
  );
};