import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Interview } from './pages/Interview'

function App() {
  return (
    <>
      <div className="w-screen h-screen bg-primary z-0 relative text-white bg-base">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App