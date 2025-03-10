import { IoMdSend as Send } from "react-icons/io";
export const MessageInput = () => {
  return (
    <div className="flex items-center gap-4 justify-center w-1/2 bg-secondary p-4 rounded-full">
    <input
        type="text"
        className="bg-white text-black p-4 rounded-full w-full outline-none"
        placeholder="Type your message here"
    />
    <button className='bg-white rounded-full p-2'>
        <Send className="w-10 h-10" color="#022A46" />
    </button>
</div>
  )
}
