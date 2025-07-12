import { Link } from "react-router-dom"
import { HireverseTitle } from "../components/common/HireverseTitle"
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { OfferBox } from "../components/Home/OfferBox";

export const Home = () => {
  const { user } = useContext(UserContext);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  return (
    <>
    <section className="h-[700px]">
    <div className="w-full h-full flex flex-col text-white">
        <HireverseTitle size={42} className="mb-10 ml-4 mt-4"/>
        <div className="border-[#0DC8DC] border-4 border-l-0 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] 2xl:w-[45%] bg-interviews bg-contain bg-no-repeat rounded rounded-r-[32px] relative p-2 sm:p-4 md:p-6" style={{ aspectRatio: '2.176' }}>
            <div
          style={{
              background: 'rgba(2, 42, 70, 0.46)',
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              borderTopRightRadius: 32,
              borderBottomRightRadius: 32,
          }}
            />
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            <span className="relative z-10 text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[42px] font-bold">
          Your Career, Elevated by AI.
            </span>
            <span className="px-2 sm:px-8 md:px-16 lg:px-24 xl:px-32 text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-[32px] relative z-10 mt-2 font-extralight text-center">
              Unlock all kinds of possibilities and enhance your
              interview skills with our state-of-the-art AI.
              </span>
            </div>
        </div>
        <div className="bg-[rgba(137,137,137,0.19)] p-4 rounded-l-xl w-1/5 self-end overflow-visible">
        <Link to={user?"/interview":"/login"}>
          <button className="bg-[#204B83] text-2xl px-24 rounded-full py-4 transition-colors duration-200 hover:bg-[#2a5fa8]">
            Get Started
          </button>
        </Link>
        </div>
    </div>
    </section>
    <section className="h-[700px] flex flex-col items-center justify-center">
      <div className="flex flex-col w-full items-center gap-4">
        <div className="flex gap-4 flex-wrap justify-center items-center">
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[42px]">Why</h1>
          <HireverseTitle size={32} className="sm:text-3xl md:text-4xl lg:text-5xl xl:text-[42px]" />
          <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[42px]">?</h1>
        </div>
        <div className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-[32px] text-center w-full max-w-[1000px] px-2 font-extralight">
          According to surveys, 63% of young professionals don’t do mock interviews. With HIREVERSE, gain the practice and confidence you need to stand out.
        </div>
      </div>
    </section>
    <section className="h-[700px] flex flex-col items-center justify-center">
      <div className="flex gap-8">
      {
        [0, 1, 2].map((variant) => (
          <OfferBox key={variant} variant={variant} selectedBox={selectedBox} setSelectedBox={setSelectedBox} />
        ))
      }
      </div>
    </section>
    </>
  )
}

