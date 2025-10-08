import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListView from './views/ListView';
import GalleryView from './views/GalleryView';
import DetailView from './views/DetailView';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="cs409-fa25-mp2">
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/pokemon/:id" element={<DetailView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
