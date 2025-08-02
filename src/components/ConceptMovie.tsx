import React from 'react';

const ConceptMovie: React.FC = () => {
  return (
    <section id="trailer" className="py-20 md:py-32 bg-black">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          CONCEPT MOVIE
        </h2>
        <p className="font-noto text-lg text-center mb-12">コンセプトムービー</p>
        <div className="aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
          <img
            src="https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="コンセプトムービーのサムネイル"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default ConceptMovie;