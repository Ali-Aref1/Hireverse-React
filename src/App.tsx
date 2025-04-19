import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Interview } from './pages/Interview'

function App() {
  
  return (
    <>
      <div className="w-screen h-screen overflow-hidden bg-primary z-0 relative text-white bg-base">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/test" element={
              <div
              className="w-48 h-48 bg-blue-500"
              style={{
                WebkitMask: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"><rect width=\"24\" height=\"24\" fill=\"white\"/><path d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\" fill=\"black\"/></svg>')",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "contain",
              }}
            ></div>
            
            
            } />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App