import { useState } from 'react';
import { IoMdSend as Send } from "react-icons/io";
import MoonLoader from "react-spinners/MoonLoader";

interface MessageInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export const MessageInput = ({ onSend, loading }: MessageInputProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
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
        onKeyDown={handleKeyDown}
      />
      
      <button
        className={`bg-white rounded-full p-2 ${(input.trim() === '' || loading)? "opacity-50 cursor-not-allowed":"cursor-pointer"} w-12 h-12 flex items-center justify-center`}
        onClick={handleSend}
        disabled={input.trim() === '' || loading}
      >
        {loading ? (
          <MoonLoader loading={true} size={25} color={"#022A46"}></MoonLoader>
        ) : (
          <Send className="w-10 h-10" color="#022A46" />
        )}
      </button>
    </div>
  );
};