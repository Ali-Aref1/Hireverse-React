import { useContext, useEffect, useState } from "react"
import { UserContext } from "../App";
import { getInterviews } from "../utils/interviews";
import { Interview } from "../interfaces/Interview";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { PercentageBar } from "../components/Profile/PercentageBar";

export const Profile = () => {
  const {user} = useContext(UserContext);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(-1);
  const [expandedPhases, setExpandedPhases] = useState<{[key: string]: boolean}>({});

  const togglePhaseExpansion = (interviewId: string, phase: string) => {
    const key = `${interviewId}-${phase}`;
    setExpandedPhases(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleTabSelect = (index: number) => {
    setSelectedTabIndex(index);
  };

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

  const convertToPercentage = (value:number)=>{
    return Math.round(value*100/7);
  }

  const getOverallScore = (interview: Interview) => {
    const scores = [
      interview.eval?.behavioural?.score,
      interview.eval?.technical?.score,
      interview.eval?.coding?.score,
      interview.eval?.FPL_scores?.RecommendHiring ? convertToPercentage(interview.eval.FPL_scores.RecommendHiring) : undefined
    ].filter(score => score !== undefined && score !== null);
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };
  return (
    <>
    <style>
      {`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .slide-in-right {
          animation: slideInRight 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 69, 19, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(196, 165, 216, 0.7);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(196, 165, 216, 0.9);
        }
      `}
    </style>
    <section>
        <div className="bg-[rgba(84,121,173,0.6)] rounded-full px-4 mt-10 text-center">
            <h1 className="text-[42px] font-bold">{user?.data.Fname} {user?.data.Lname}</h1>
        </div>
    </section>
    <section className="p-4">
        {loading ? (
            <div className="text-white text-center py-8">Loading interviews...</div>
        ) : error ? (
            <div className="text-red-400 text-center py-8">{error}</div>
        ) : interviews.length === 0 ? (
            <div className="text-white/70 text-center py-8">No interviews found</div>
        ) : (
            <Tabs 
                className="flex gap-6 transition-all duration-300 overflow-x-hidden"
                selectedIndex={selectedTabIndex}
                onSelect={handleTabSelect}
            >
                {/* Custom styled TabList to look like the original interview list */}
                <div className={`border-secondary border-2 rounded-xl bg-gradient-to-r from-blue-900/20 to-cyan-800/20 backdrop-blur-sm relative overflow-hidden transition-all duration-300 ${selectedTabIndex === -1 ? 'flex-1' : 'w-1/2'}`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-400/10 -z-20"></div>
                    <div className="flex flex-col p-5 gap-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Interview History
                            </span>
                        </h2>
                        
                        <TabList className="flex flex-col w-full items-start justify-start !border-none !bg-transparent !p-0 !m-0">
                            {interviews.map((interview, index) => (
                                <Tab 
                                    key={interview._id}
                                    className="w-full cursor-pointer z-20 !border-none !bg-transparent !p-0 !m-0 !outline-none rounded-lg"
                                    selectedClassName="!bg-cyan-500/20 shadow-cyan-500/30 rounded-lg"
                                    style={{boxShadow: selectedTabIndex === index ? '0 0 20px rgba(6, 182, 212, 0.3)' : undefined}}
                                >
                                    <div className="flex items-center justify-between w-full p-3 bg-white/10 rounded-lg mb-2 hover:bg-white/20 transition-colors">
                                        <div className="flex flex-col items-start">
                                            <span className="text-white font-medium">
                                                {interview.name || `Interview ${index + 1}`}
                                            </span>
                                            <span className="text-white/60 text-sm">
                                                {new Date(interview.time).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/70 text-sm">Overall:</span>
                                            <div className="bg-white/20 rounded-full px-2 py-1 text-xs font-medium text-white">
                                                {getOverallScore(interview)}%
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            ))}
                        </TabList>
                    </div>
                </div>

                {/* TabPanels for interview details */}
                {selectedTabIndex !== -1 && (
                    <div className="flex-1 slide-in-right">
                        {interviews.map((interview, index) => (
                            <TabPanel 
                                key={interview._id}
                                className={`border-secondary border-2 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-800/20 backdrop-blur-sm relative overflow-hidden h-[600px] ${index === selectedTabIndex ? 'block' : 'hidden'}`}
                            >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-400/10 -z-20"></div>
                            <div className="flex flex-col p-5 gap-4 h-full">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="w-1 h-8 bg-gradient-to-b from-pink-400 to-purple-500 rounded-full"></div>
                                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                        Interview Details
                                    </span>
                                </h2>
                                
                                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                    {/* Interview Info */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-2">Interview Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/70">Date:</span>
                                                <span className="text-white">{new Date(interview.time).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/70">Duration:</span>
                                                <span className="text-white">{Math.round(interview.duration /60000 )} minutes</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/70">Overall Score:</span>
                                                <span className="text-white font-semibold">{getOverallScore(interview)}%</span>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Phase Scores */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">Phase Scores</h3>
                                        <div className="space-y-3">
                                            {/* Behavioral Phase */}
                                            <div className="space-y-2">
                                                <div 
                                                    className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                                                    onClick={() => togglePhaseExpansion(interview._id, 'behavioural')}
                                                >
                                                    <span className="text-white/70 flex items-center gap-2">
                                                        Behavioral:
                                                        <svg 
                                                            className={`w-4 h-4 transform transition-transform ${expandedPhases[`${interview._id}-behavioural`] ? 'rotate-180' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </span>
                                                    <PercentageBar color="#EF4444" percentage={interview.eval?.behavioural?.score || 0} />
                                                </div>
                                                {expandedPhases[`${interview._id}-behavioural`] && interview.eval?.behavioural?.feedback && (
                                                    <div className="ml-4 p-3 bg-white/5 rounded text-white/80 text-sm leading-relaxed">
                                                        {interview.eval.behavioural.feedback}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Technical Phase */}
                                            <div className="space-y-2">
                                                <div 
                                                    className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                                                    onClick={() => togglePhaseExpansion(interview._id, 'technical')}
                                                >
                                                    <span className="text-white/70 flex items-center gap-2">
                                                        Technical:
                                                        <svg 
                                                            className={`w-4 h-4 transform transition-transform ${expandedPhases[`${interview._id}-technical`] ? 'rotate-180' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </span>
                                                    <PercentageBar color="#3B82F6" percentage={interview.eval?.technical?.score || 0} />
                                                </div>
                                                {expandedPhases[`${interview._id}-technical`] && interview.eval?.technical?.feedback && (
                                                    <div className="ml-4 p-3 bg-white/5 rounded text-white/80 text-sm leading-relaxed">
                                                        {interview.eval.technical.feedback}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Coding Phase */}
                                            <div className="space-y-2">
                                                <div 
                                                    className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                                                    onClick={() => togglePhaseExpansion(interview._id, 'coding')}
                                                >
                                                    <span className="text-white/70 flex items-center gap-2">
                                                        Coding:
                                                        <svg 
                                                            className={`w-4 h-4 transform transition-transform ${expandedPhases[`${interview._id}-coding`] ? 'rotate-180' : ''}`}
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </span>
                                                    <PercentageBar color="#22C55E" percentage={interview.eval?.coding?.score || 0} />
                                                </div>
                                                {expandedPhases[`${interview._id}-coding`] && interview.eval?.coding?.feedback && (
                                                    <div className="ml-4 p-3 bg-white/5 rounded text-white/80 text-sm leading-relaxed">
                                                        {interview.eval.coding.feedback}
                                                    </div>
                                                )}
                                            </div>
                                            
                                        </div>
                                    </div>

                                    {/* FPL Scores if available */}
                                    {interview.eval?.FPL_scores && (
                                      <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">Performance Metrics</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                          {Object.entries(interview.eval.FPL_scores)
                                            .filter(([key]) => key !== "RecommendHiring")
                                            .map(([key, value]) => (
                                              <div key={key} className="flex justify-between">
                                                <span className="text-white/70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                <PercentageBar color="#F59E0B" percentage={convertToPercentage(value)} />
                                              </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Video Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">Interview Recording</h3>
                                        <div className="bg-black/20 rounded-lg p-3">
                                            <video 
                                                controls 
                                                className="w-full max-h-64 rounded-lg"
                                                preload="metadata"
                                            >
                                                <source src={`http://localhost:3000/${interview._id}.webm`} type="video/webm" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>

                                    {/* Transcript Section */}
                                    <div className="bg-white/10 rounded-lg p-4">
                                        <div 
                                            className="flex justify-between items-center cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
                                            onClick={() => togglePhaseExpansion(interview._id, 'transcript')}
                                        >
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                Interview Transcript
                                                <svg 
                                                    className={`w-4 h-4 transform transition-transform ${expandedPhases[`${interview._id}-transcript`] ? 'rotate-180' : ''}`}
                                                    fill="none" 
                                                    stroke="currentColor" 
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </h3>
                                        </div>
                                        {expandedPhases[`${interview._id}-transcript`] && interview.messages && interview.messages.length > 0 ? (
                                            <div className="mt-4 space-y-3">
                                                {(() => {
                                                    let currentPhase = 'introduction';
                                                    const elements: React.ReactElement[] = [];
                                                    
                                                    interview.messages.forEach((message, msgIndex) => {
                                                        // Check if this is a phase transition
                                                        if (message.sender !== 'You' && message.phase && message.phase !== currentPhase) {
                                                            currentPhase = message.phase;
                                                            // Add phase divider
                                                            elements.push(
                                                                <div key={`divider-${msgIndex}`} className="flex items-center gap-3 py-3">
                                                                    <div className={`h-0.5 flex-1 ${
                                                                        currentPhase === 'behavioural' ? 'bg-red-400' :
                                                                        currentPhase === 'technical' ? 'bg-blue-400' :
                                                                        currentPhase === 'coding' ? 'bg-green-400' :
                                                                        currentPhase === 'end' ? 'bg-gray-400' :
                                                                        'bg-yellow-400'
                                                                    }`}></div>
                                                                    <span className={`text-sm font-medium px-3 py-1 rounded capitalize ${
                                                                        currentPhase === 'behavioural' ? 'bg-red-500/20 text-red-200' :
                                                                        currentPhase === 'technical' ? 'bg-blue-500/20 text-blue-200' :
                                                                        currentPhase === 'coding' ? 'bg-green-500/20 text-green-200' :
                                                                        currentPhase === 'end' ? 'bg-gray-500/20 text-gray-200' :
                                                                        'bg-yellow-500/20 text-yellow-200'
                                                                    }`}>
                                                                        {currentPhase} Phase
                                                                    </span>
                                                                    <div className={`h-0.5 flex-1 ${
                                                                        currentPhase === 'behavioural' ? 'bg-red-400' :
                                                                        currentPhase === 'technical' ? 'bg-blue-400' :
                                                                        currentPhase === 'coding' ? 'bg-green-400' :
                                                                        currentPhase === 'end' ? 'bg-gray-400' :
                                                                        'bg-yellow-400'
                                                                    }`}></div>
                                                                </div>
                                                            );
                                                        }
                                                        
                                                        // Add message
                                                        elements.push(
                                                            <div 
                                                                key={`message-${msgIndex}`}
                                                                className={`p-3 rounded-lg border-l-4 ${
                                                                    message.sender === 'You' 
                                                                        ? 'bg-emerald-500/15 border-emerald-400 ml-8' 
                                                                        : 'bg-indigo-500/15 border-indigo-400'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className={`w-2 h-2 rounded-full ${
                                                                        message.sender === 'You' ? 'bg-emerald-400' : 'bg-indigo-400'
                                                                    }`}></div>
                                                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                                        message.sender === 'You' 
                                                                            ? 'bg-emerald-500/30 text-emerald-200' 
                                                                            : 'bg-indigo-500/30 text-indigo-200'
                                                                    }`}>
                                                                        {message.sender === 'You' ? 'You' : 'Interviewer'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-white/90 text-sm leading-relaxed">
                                                                    {typeof message.message === 'string' 
                                                                        ? message.message 
                                                                        : typeof message.message === 'object' && message.message !== null && 'response' in message.message
                                                                            ? (message.message as {response: string}).response
                                                                            : 'No message content'
                                                                    }
                                                                </p>
                                                            </div>
                                                        );
                                                    });
                                                    
                                                    return elements;
                                                })()}
                                            </div>
                                        ) : expandedPhases[`${interview._id}-transcript`] ? (
                                            <div className="text-white/60 text-center py-4 mt-4">
                                                No transcript available for this interview
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    ))}
                </div>
                )}
            </Tabs>
        )}
    </section>
    </>
  )
}
