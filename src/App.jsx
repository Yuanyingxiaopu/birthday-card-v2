import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import FormPage from './pages/FormPage'
import GeneratingPage from './pages/GeneratingPage'
import PasswordPage from './pages/PasswordPage'
import CardPage from './pages/CardPage'
import GreetPage from './pages/GreetPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/generating" element={<GeneratingPage />} />
          <Route path="/card/:cardId" element={<CardPage />} />
          <Route path="/card/:cardId/verify" element={<PasswordPage />} />
          <Route path="/greet/:data" element={<GreetPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
