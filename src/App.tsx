import React from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Introduction from './components/Introduction';
import ConceptMovie from './components/ConceptMovie';
import Message from './components/Message';
import ArtistStaff from './components/ArtistStaff';
import News from './components/News';
import Project from './components/Project';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-black text-gray-200">
      <Header />
      <main className="w-full">
        <Navigation />
        <Introduction />
        <ConceptMovie />
        <Message />
        <ArtistStaff />
        <News />
        <Project />
      </main>
      <Footer />
    </div>
  );
}

export default App;