import React, { useState, useEffect, useCallback } from 'react';
import VoteModal from './VoteModal';
import { supabase } from '../lib/supabaseClient';
import VoteStatusGraph from './VoteStatusGraph';

interface Artist {
  id: string;
  name: string;
  role: string;
  image_url: string;
}

interface ArtistProps {
  onShowPrivacyPolicy: () => void;
}

interface VoteCount {
  artist_id: string;
  vote_count: number;
}

const Artist: React.FC<ArtistProps> = ({ onShowPrivacyPolicy }) => {
  const [staff, setStaff] = useState<Artist[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'sponsor' | null>(null);
  const [showSponsorMessage, setShowSponsorMessage] = useState(false);

  const fetchArtists = useCallback(async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, role, image_url');
    
    if (error) {
      console.error('Error fetching artists:', error);
    } else {
      setStaff(data || []);
    }
  }, []);

  const fetchVoteCounts = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_artist_vote_counts');
    if (error) {
      console.error('Error fetching vote counts:', error);
    } else {
      setVoteCounts(data || []);
    }
  }, []);

  const checkUserType = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUserType(null);
        return;
      }

      // individual_membersテーブルをチェック
      const { data: individualMember } = await supabase
        .from('individual_members')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (individualMember) {
        setUserType('individual');
        return;
      }

      // sponsor_membersテーブルをチェック
      const { data: sponsorMember } = await supabase
        .from('sponsor_members')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (sponsorMember) {
        setUserType('sponsor');
        return;
      }

      setUserType(null);
    } catch (error) {
      console.error('Error checking user type:', error);
      setUserType(null);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
    fetchVoteCounts();
    checkUserType();
  }, [fetchArtists, fetchVoteCounts, checkUserType]);

  const handleModalClose = (voteSubmitted: boolean) => {
    setIsModalOpen(false);
    if (voteSubmitted) {
      fetchVoteCounts();
    }
  };

  const handleVoteButtonClick = () => {
    if (userType === 'sponsor') {
      setShowSponsorMessage(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const totalVotes = voteCounts.reduce((sum, current) => sum + current.vote_count, 0);
  const colors = ['#a855f7', '#ec4899', '#22d3ee', '#10b981', '#f59e0b'];

  const artistVoteData = staff
    .map((artist) => {
      const countData = voteCounts.find(vc => vc.artist_id === artist.id);
      const voteCount = countData ? countData.vote_count : 0;
      
      return {
        id: artist.id,
        name: artist.name, // Keep original name for sorting
        voteCount: voteCount,
      };
    })
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((artist, index) => {
      const percentage = totalVotes > 0 ? (artist.voteCount / totalVotes) * 100 : 0;
      return {
        id: artist.id,
        name: `アーティスト ${String.fromCharCode(65 + index)}`, // Generic name: アーティスト A, B, C...
        voteCount: artist.voteCount,
        percentage: percentage,
        color: colors[index % colors.length]
      };
    });

  return (
    <>
      <section id="artist" className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
            ARTIST
          </h2>
          <p className="font-noto text-lg text-center mb-12">参加アーティスト</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {staff.map((person) => (
              <div key={person.id} className="text-center bg-neutral-900 p-8 rounded-lg">
                <img
                  src={person.image_url}
                  alt={`${person.name}の写真`}
                  className="w-40 h-40 mx-auto rounded-full mb-4 shadow-md object-cover"
                />
                <h3 className="font-noto text-2xl font-bold">{person.name}</h3>
                <p className="text-neutral-400">{person.role}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <button
              onClick={handleVoteButtonClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg"
            >
              投票する
            </button>
          </div>

          <div className="mt-20 max-w-4xl mx-auto">
            <h3 className="text-3xl text-center mb-8 gradient-text">現在の投票状況</h3>
            <VoteStatusGraph voteData={artistVoteData} />
          </div>
        </div>
      </section>

      {/* スポンサーメッセージモーダル */}
      {showSponsorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-8 max-w-md mx-4 relative">
            <button
              onClick={() => setShowSponsorMessage(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white text-xl"
            >
              ×
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">
                投票確認
              </h2>
              
              <div className="bg-orange-600 text-white p-4 rounded-lg mb-6">
                <p>
                  スポンサーアカウントでは投票できません。<br />
                  投票は一般ユーザーアカウントでのみ可能です。
                </p>
              </div>
              
              <button
                onClick={() => setShowSponsorMessage(false)}
                className="bg-neutral-600 hover:bg-neutral-700 text-white px-6 py-2 rounded-md transition duration-200"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <VoteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        artists={staff}
        onShowPrivacyPolicy={onShowPrivacyPolicy}
      />
    </>
  );
};

export default Artist;