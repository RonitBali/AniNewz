import './App.css'
import Home from './pages/Home'
import AnimeCard from './components/AnimeCard'
import GooeyNav from './components/GooeyNav'


function App() {
  const navItems = [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
  ]
  return (
    <>
    <div className='flex justify-center items-center mt-8'>
     <GooeyNav items={navItems} />
     </div>
     {/* <Home/> */}
     {/* <AnimeCard/> */}
    </>
  )
}

export default App
