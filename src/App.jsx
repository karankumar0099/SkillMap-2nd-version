import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import Home from './Pages/Hero/Home';
import Skills from './Pages/Skills/Skills';
import SkillInput from './Pages/Skillinput/SkillInput';
import OfficialRoadmaps from './Pages/OfficialRoadmaps/OfficialRoadmaps';
import Roadmap from './Components/Roadmap/Roadmap';
import StepDetail from './Pages/Steps/StepDetail';
import Contact from './Pages/Contact/Contact';
import AiTutor from './Pages/AiTutor/AiTutor';
import RoadmapChatSelection from './Pages/RoadmapChatSelection/RoadmapChatSelection';

import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';
import Dashboard from './Pages/Dashboard/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NoteProvider } from './context/NoteContext';

const PageWrapper = ({ children }) => (
  <div className="page-animate">
    {children}
  </div>
);

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NoteProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/skills" element={<PageWrapper><Skills /></PageWrapper>} />
              <Route path="/official-roadmaps" element={<PageWrapper><OfficialRoadmaps /></PageWrapper>} />
              <Route path="/skill-input" element={<PageWrapper><SkillInput /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/ai-tutor" element={<PageWrapper><AiTutor /></PageWrapper>} />
              <Route path="/roadmap-chat" element={<PageWrapper><RoadmapChatSelection /></PageWrapper>} />
              <Route path="/roadmap/:id" element={<PageWrapper><Roadmap /></PageWrapper>} />
              <Route path="/step/:id" element={<PageWrapper><StepDetail /></PageWrapper>} />

              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </NoteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
