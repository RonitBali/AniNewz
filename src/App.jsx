import './App.css'
import Home from './pages/Home'
import AnimeCard from './components/AnimeCard'
import Navbar from './components/Navbar'
import Watchlist from './components/Watchlist'
import { useState } from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopAnime from './pages/TopAnime'


function App() {
  const [searchquery, setSearchquery] = useState('');

  return (
    <>
      <Router>
      {/* <Navbar searchquery={searchquery} setSearchquery={setSearchquery} /> */}
        <Routes>
          <Route path='/' element={<Home searchquery={searchquery} />} />
          <Route path='/topanime' element={<TopAnime />} />
          <Route path='/watchlist' element={<Watchlist />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
