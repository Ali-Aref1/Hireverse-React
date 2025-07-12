import Offer1 from "../../assets/offer1.png";
import Offer2 from "../../assets/offer2.png";
import Offer3 from "../../assets/offer3.png";
import { useState } from "react";

const offerTexts =[
    {main:"Conduct Real Time Interviews", desc: "Conduct an immersive, one-on-one interview with our realistic AI chatbot and 3D avatar.",image: Offer1},
    {main:"Get Constructive Feedback", desc: "Get conclusive feedback on interview skills that matter to recruiters.",image: Offer2},
    {main:"Automated Hiring", desc: "Automate your hiring process by incorporating HIREVERSE into your applicant filtering.",image: Offer3}
]

interface OfferBoxProps {
    variant: number;
    selectedBox: number|null;
    setSelectedBox: (box: number|null) => void;
}

export const OfferBox = ({variant, selectedBox,setSelectedBox}:OfferBoxProps) => {
  const expanded = selectedBox === variant;
  const hidden = selectedBox!=null && selectedBox !== variant; // If another box is selected, do not render this one
  return (
    <div className={`bg-[#0073AC] rounded-lg transition-all duration-300 ease-in-out overflow-hidden relative ${expanded?"w-[620px]":"w-48"} ${hidden&&"opacity-25"}`} onMouseEnter={() => setSelectedBox(variant)} onMouseLeave={() => setSelectedBox(null)}>
      <div className={`bg-[#0073AC] rounded-lg h-48 w-48 text-center p-4 flex flex-col items-center gap-2`} >
        <span className="text-lg font-bold w-[160px]">{offerTexts[variant].main}</span>
        <img src={offerTexts[variant].image} className="w-24"></img>
      </div>
      <div className={`absolute top-0 left-48 w-[372px] h-48 bg-[#0073AC] rounded-r-lg p-4 flex items-center justify-center transition-all duration-300 ease-in-out ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
        <p className="text-lg text-center w-full">{offerTexts[variant].desc}</p>
      </div>
    </div>
  )
}
