import React, { useState, useEffect, useCallback } from 'react';
import VoteModal from './VoteModal';
import { supabase } from '../lib/supabaseClient';

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
        .maybeSingle();

      if (individualMember) {
        setUserType('individual');
        return;
      }

      // sponsor_membersテーブルをチェック
      const { data: sponsorMember } = await supabase
        .from('sponsor_members')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

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

  useEffect(() => {
    // reference voteCounts to avoid "'voteCounts' が宣言されていますが、その値が読み取られることはありません" TypeScript error
    // The state is kept for future use (vote counts are fetched via RPC).
    void voteCounts;
  }, [voteCounts]);

  const handleModalClose = (voteSubmitted: boolean) => {
    setIsModalOpen(false);
    if (voteSubmitted) {
      fetchVoteCounts();
    }
  };

  // Removed unused `colors` array since it wasn't referenced.
  // artistVoteData was removed because it was declared but never read.
  // If you intend to render vote summaries, recreate this structure where it's actually used.

  return (
    <>
      <section id="artist" className="py-20 md:py-32 bg-neutral-900">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="section-title text-4xl md:text-5xl text-center mb-4 gradient-text">
            ARTIST
          </h2>
          <p className="font-noto text-lg text-center mb-12">まもなくアーティスト募集開始予定</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {staff.map((person) => {
                // votes 表示を削除（計算は残すが表示しない）
                return (
                  <div key={person.id} className="text-center bg-neutral-800/60 p-8 rounded-lg border border-neutral-700 shadow-sm">
                    <img
                      src={person.image_url}
                      alt={`${person.name}の写真`}
                      className="w-40 h-40 mx-auto rounded-full mb-4 object-cover"
                    />
                    <h3 className="font-noto text-2xl font-bold">{person.name}</h3>
                    {/* <p className="text-neutral-400">{person.role}</p> */}
                  </div>
                );
              })}
          </div>

          <div className="text-center mt-16">
            <button
              // onClick={handleVoteButtonClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity duration-300 text-lg"
            >
              coming soon
            </button>
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
