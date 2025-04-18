import './App.css'
import Home from './pages/Home'
import AnimeCard from './components/AnimeCard'
import Navbar from './components/Navbar'
import { useState } from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import TopAnime from './pages/TopAnime'


function App() {
  const [searchquery, setSearchquery] = useState('');

  return (
    <>

      <Navbar searchquery={searchquery} setSearchquery={setSearchquery} />
      <Router>
        <Routes>
          <Route path='/' element={<Home searchquery={searchquery} />} />
          <Route path='/topanime' element={<TopAnime />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
