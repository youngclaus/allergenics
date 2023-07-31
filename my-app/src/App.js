import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import About from "./pages/about"
import Home from "./pages/index"
import Settings from "./pages/settings"

// npm start
// localhost:3000
// ctrl c

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
