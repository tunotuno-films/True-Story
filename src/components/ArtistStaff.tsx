import React from 'react';

const ArtistStaff: React.FC = () => {
  const staff = [
    {
      name: 'Artist Name',
      role: 'Vocal / Songwriter',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
    },
    {
      name: '監督名 太郎',
      role: 'MV Director',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
    },
    {
      name: '撮影監督 花子',
      role: 'Cinematographer',
      image: 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
    }
  ];

  return (
    <section id="artist" className="py-20 md:py-32 bg-black">
      <div className="container mx-auto px-6 md:px-12">
        <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
          ARTIST & STAFF
        </h2>
        <p className="font-noto text-lg text-center mb-12">参加アーティスト & スタッフ</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {staff.map((person, index) => (
            <div key={index} className="text-center bg-neutral-900 p-8 rounded-lg">
              <img
                src={person.image}
                alt={`${person.name}の写真`}
                className="w-40 h-40 mx-auto rounded-full mb-4 shadow-md object-cover"
              />
              <h3 className="font-noto text-2xl font-bold">{person.name}</h3>
              <p className="text-neutral-400">{person.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistStaff;