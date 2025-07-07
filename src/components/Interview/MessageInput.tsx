import { useEffect, useRef, useState } from 'react';
import { IoMdSend as Send } from "react-icons/io";
import MoonLoader from "react-spinners/MoonLoader";

interface MessageInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
  isListening?: boolean;
  phase: "greeting" | "behavioural" | "technical" | "coding" | "end";
}

export const MessageInput = ({ onSend, loading, isListening, phase }: MessageInputProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleSend = () => {
    if (loading || isListening || phase === "coding" || phase === "end") return; // Prevent sending during loading or listening or coding phase
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
    <div className={`flex items-center gap-4 justify-center w-full bg-secondary p-4 rounded-full transition opacity ${(phase=="coding"||phase=="end") && "opacity-0 height-0"}`}>
      <input
        type="text"
        className="bg-white text-black p-4 rounded-full w-full outline-none"
        placeholder={"Type your message here"}
        value={input}
        ref={inputRef}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || isListening || phase === "coding" || phase === "end"}
      />
      
      <button
        className={`bg-white rounded-full p-2 ${(input.trim() === '' || loading || isListening || phase === "coding" || phase === "end")? "opacity-50 cursor-not-allowed":"cursor-pointer"} w-12 h-12 flex items-center justify-center`}
        onClick={handleSend}
        disabled={input.trim() === '' || loading || isListening}
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