import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { UserContext } from "../App";
import { getInterviews } from "../utils/interviews";
import { Interview } from "../interfaces/Interview";

export const Profile = () => {
  const {user} = useContext(UserContext);
  const {interviewId} = useParams<{interviewId: string}>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.accessToken) {
      setLoading(true);
      getInterviews(user.accessToken)
        .then(interviews => {
          console.log('Fetched interviews:', interviews);
          setInterviews(interviews);
          setError(null);
        })
        .catch(err => {
          console.error("Error fetching interviews:", err);
          setError("Failed to load interviews");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);
  return (
    <>
    <section>
        <div className="bg-[rgba(84,121,173,0.6)] rounded-full px-4 mt-10 text-center">
            <h1 className="text-[42px] font-bold">{user?.data.Fname} {user?.data.Lname}</h1>
            
        </div>
    </section>
    <section className="p-4">
        <div className="w-full border-secondary border-2 rounded-xl bg-gradient-to-r from-blue-900/20 to-cyan-800/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10"></div>
            <div className="flex flex-col py-5">
            <div className="relative z-10 h-full flex items-center justify-between px-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Interview History
                    </span>
                </h2>
            </div>
            </div>
        </div>
    </section>
    </>
  )
}
