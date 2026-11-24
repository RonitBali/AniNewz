import './App.css'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import WatchList from './pages/WatchList'
import TopAnime from './pages/TopAnime'
import AnimeNews from './pages/AnimeNews'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop/>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/topanime' element={<TopAnime />} />
            <Route path='/seasonal' element={<TopAnime />} />
            <Route path='/watchlist' element={<WatchList />} />
            <Route path='/Animenews' element={<AnimeNews />} />
          </Routes>
        </main>
        <Footer/>
      </div>
    </Router>
  );
}
export default App;
