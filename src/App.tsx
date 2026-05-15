import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { CookieBanner } from './components/CookieBanner'
import HomePage from './pages/HomePage'
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import ListPropertyPage from './pages/ListPropertyPage'
import AuctionPage from './pages/AuctionPage'
import AboutPage from './pages/AboutPage'
import ImpressumPage from './pages/ImpressumPage'
import DatenschutzPage from './pages/DatenschutzPage'
import QuizPage from './pages/QuizPage'
import MortgagePage from './pages/MortgagePage'
import BuyingGuidePage from './pages/BuyingGuidePage'

export default function App() {
  return (
    <>
      <Routes>
        {/* Auction page: full-screen with fixed nav offset */}
        <Route path="/auction"     element={<><NavBar /><AuctionPage /></>} />

        {/* Standard pages */}
        <Route path="/"            element={<><NavBar /><HomePage /></>} />
        <Route path="/listings"      element={<><NavBar /><ListingsPage /></>} />
        <Route path="/listings/:id"  element={<><NavBar /><ListingDetailPage /></>} />
        <Route path="/list-property" element={<><NavBar /><ListPropertyPage /></>} />
        <Route path="/about"       element={<><NavBar /><AboutPage /></>} />
        <Route path="/impressum"   element={<><NavBar /><ImpressumPage /></>} />
        <Route path="/datenschutz" element={<><NavBar /><DatenschutzPage /></>} />

        {/* Tools */}
        <Route path="/quiz"          element={<><NavBar /><QuizPage /></>} />
        <Route path="/mortgage"      element={<><NavBar /><MortgagePage /></>} />
        <Route path="/buying-guide"  element={<><NavBar /><BuyingGuidePage /></>} />
      </Routes>

      {/* Cookie consent — rendered outside Routes so it appears on every page */}
      <CookieBanner />
    </>
  )
}
