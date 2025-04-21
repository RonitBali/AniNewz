import './App.css'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import WatchList from './pages/WatchList'
import TopAnime from './pages/TopAnime'
import AnimeNews from './pages/AnimeNews'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [searchquery, setSearchquery] = useState('');
  const [user, setUser] = useState(null);

  const handleUserChange = (newUser) => {
    setUser(newUser);
  };

  return (
    <>
      <Router>
        
        <ScrollToTop/>
        <Navbar 
          searchquery={searchquery} 
          setSearchquery={setSearchquery} 
          user={user}
          onUserChange={handleUserChange}
        />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/topanime' element={<TopAnime />} />
          <Route path='/seasonal' element={<TopAnime />} />
          <Route path='/watchlist' element={<WatchList userId={user} />} />
          <Route path='/Animenews' element={<AnimeNews />} /> 
        </Routes>
         <Footer/>
      </Router>
    </>
  );
}
export default App;