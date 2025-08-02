import React from 'react';

interface ArtistVoteData {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

interface VoteStatusGraphProps {
  voteData: ArtistVoteData[];
}

const VoteStatusGraph: React.FC<VoteStatusGraphProps> = ({ voteData }) => {
  if (voteData.length === 0 || voteData.every(d => d.percentage === 0)) {
    return (
      <div className="text-center text-neutral-400 py-8">
        <p>まだ投票がありません。最初の投票者になりませんか？</p>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const gradientParts = voteData
    .filter(d => d.percentage > 0)
    .map((artist) => {
      const start = cumulativePercentage;
      const end = cumulativePercentage + artist.percentage;
      cumulativePercentage = end;
      return `${artist.color} ${start}% ${end}%`;
    });
  
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
      {/* Pie Chart */}
      <div 
        className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-neutral-800 shadow-lg"
        style={{ backgroundImage: gradient }}
      />

      {/* Legend */}
      <div className="w-full md:w-auto space-y-3">
        {voteData.map((artist) => (
          <div key={artist.id} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-sm mr-3 flex-shrink-0"
              style={{ backgroundColor: artist.color }}
            />
            <span className="font-noto text-white text-lg">
              {artist.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoteStatusGraph;
