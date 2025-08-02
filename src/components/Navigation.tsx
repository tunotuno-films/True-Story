import React from 'react';

const Navigation: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'introduction', label: 'INTRODUCTION' },
    { id: 'message', label: 'MESSAGE' },
    { id: 'artist', label: 'ARTIST' },
    { id: 'news', label: 'NEWS' },
    { id: 'crowdfunding', label: 'PROJECT' },
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16 space-x-4 md:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-neutral-300 hover:text-white transition duration-300 font-noto"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;