import './App.css'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Watchlist from './components/Watchlist'
import TopAnime from './pages/TopAnime'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './components/Authentication'


function App() {
  const [searchquery, setSearchquery] = useState('');
  const [user, setUser] = useState(null); // new

  return (
    <>
      <Router>
        <Navbar searchquery={searchquery} setSearchquery={setSearchquery} />
        <Authentication onUserChange={setUser} />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/topanime' element={<TopAnime />} />
          <Route path='/watchlist' element={<Watchlist userId={user?.uid} />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;