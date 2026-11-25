import './App.css'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import { WatchlistProvider } from './Utils/WatchlistContext'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'))
const TopAnime = lazy(() => import('./pages/TopAnime'))
const WatchList = lazy(() => import('./pages/WatchList'))
const AnimeNews = lazy(() => import('./pages/AnimeNews'))

const NotFound = () => (
  <div className="mx-auto max-w-md px-4 py-20 text-center">
    <h1 className="text-3xl font-extrabold text-white">Page not found</h1>
    <p className="mt-2 text-sm text-gray-400">That page does not exist.</p>
    <Link to="/" className="btn-primary mt-6 inline-flex px-5 py-2">Back to Discover</Link>
  </div>
)

function App() {
  return (
    <Router>
      <WatchlistProvider>
        <div className="flex min-h-screen flex-col">
          <ScrollToTop/>
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<div className="py-24 text-center text-sm text-gray-400">Loading…</div>}>
              <Routes>
                <Route path='/' element={<Home/>} />
                <Route path='/topanime' element={<TopAnime />} />
                <Route path='/seasonal' element={<Navigate to='/topanime' replace />} />
                <Route path='/watchlist' element={<WatchList />} />
                <Route path='/news' element={<AnimeNews />} />
                <Route path='/Animenews' element={<Navigate to='/news' replace />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer/>
        </div>
      </WatchlistProvider>
    </Router>
  );
}
export default App;
