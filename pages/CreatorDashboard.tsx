import React, { useState, useMemo } from 'react';
import { Job, Creator, JobStatus, CreatorCategory, ScoutOffer, ScoutOfferStatus, PaymentStatus, ChatMessage, User } from '../types';
import Tag from '../components/Tag';
import Modal from '../components/Modal';
import Chat from '../components/Chat';
import { CREATOR_CATEGORIES } from '../constants';

interface CreatorDashboardProps {
  creator?: Creator;
  jobs: Job[];
  scoutOffers?: ScoutOffer[];
  chatMessages: ChatMessage[];
  onApply?: (jobId: string) => void;
  onRespondToScout?: (scoutId: string, response: 'ACCEPTED' | 'DECLINED') => void;
  handleSendMessage: (jobId: string, text: string) => void;
  appliedJobIds?: string[];
  onLoginClick?: () => void;
}

const paymentFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

function JobCard({ job, onApply, isApplied, isClosed, isGuest }: { job: Job; onApply: () => void; isApplied: boolean; isClosed: boolean; isGuest: boolean }) {
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <Tag color={job.status === JobStatus.OPEN ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{job.status}</Tag>
        </div>
        <p className="mt-1 text-sm font-medium text-gray-600">by {job.brandName}</p>
        <p className="mt-4 text-gray-500 text-sm h-20 overflow-hidden text-ellipsis">{job.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-lg font-bold text-indigo-600">{paymentFormatter.format(job.payment)}</p>
          <button
            onClick={onApply}
            disabled={!isGuest && (isApplied || isClosed)}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
              isGuest
                ? 'bg-teal-500 text-white hover:bg-teal-600'
                : isApplied || isClosed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isGuest ? '応募にはログイン' : (isApplied ? '応募済み' : (isClosed ? '募集終了' : '応募する'))}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoutOfferCard({ offer, job, onRespond, isApplied }: { offer: ScoutOffer; job: Job | undefined; onRespond: (scoutId: string, response: 'ACCEPTED' | 'DECLINED') => void; isApplied: boolean; }) {
    if (!job) return null; // Job might not be found if it's old or deleted
    const isActionable = offer.status === ScoutOfferStatus.PENDING && job.status === JobStatus.OPEN;

    return (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="p-6">
                 <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <Tag color={'bg-yellow-100 text-yellow-800'}>スカウト</Tag>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-600">from {offer.brandName}</p>
                <p className="text-lg font-bold text-indigo-600 mt-2">{paymentFormatter.format(job.payment)}</p>

                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-semibold text-indigo-800 mb-2">メッセージ:</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{offer.message}</p>
                </div>
            </div>
            {isActionable && !isApplied && (
                <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3">
                    <button onClick={() => onRespond(offer.id, 'DECLINED')} className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-md hover:bg-gray-100">
                        辞退する
                    </button>
                    <button onClick={() => onRespond(offer.id, 'ACCEPTED')} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        応募する
                    </button>
                </div>
            )}
             {isApplied && (
                <div className="bg-gray-50 px-6 py-4 text-right">
                    <p className="text-sm font-medium text-green-600">この案件には応募済みです。</p>
                </div>
            )}
        </div>
    );
}

function AcceptedJobRow({ job, onOpenChat }: { job: Job; onOpenChat: (job: Job) => void; }) {
    const getPaymentStatusTag = (status: PaymentStatus) => {
        switch (status) {
            case 'paid':
                return <Tag color="bg-green-100 text-green-800">支払い済み</Tag>;
            case 'unpaid':
                return <Tag color="bg-yellow-100 text-yellow-800">支払い待ち</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="font-semibold text-gray-800">{job.title}</p>
                <p className="text-sm text-gray-500">by {job.brandName}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
                <p className="font-semibold text-gray-700 hidden sm:block">{paymentFormatter.format(job.payment)}</p>
                {getPaymentStatusTag(job.paymentStatus)}
                <button
                    onClick={() => onOpenChat(job)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                    チャットを開く
                </button>
            </div>
        </div>
    );
}

function CreatorDashboard({ 
    creator, 
    jobs, 
    scoutOffers = [], 
    chatMessages,
    onApply = () => {}, 
    onRespondToScout = () => {}, 
    handleSendMessage,
    appliedJobIds = [], 
    onLoginClick = () => {} 
}: CreatorDashboardProps) {
  const isGuest = !creator;
  const [activeTab, setActiveTab] = useState<'jobs' | 'scouts'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<CreatorCategory[]>([]);
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);

  const pendingScouts = useMemo(() => {
      if (isGuest || !creator) return [];
      return scoutOffers.filter(
        o => o.creatorId === creator.id && o.status === ScoutOfferStatus.PENDING
      );
  }, [scoutOffers, creator, isGuest]);

  const toggleCategory = (category: CreatorCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => job.status === JobStatus.OPEN)
      .filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(job => {
        if(selectedCategories.length === 0) return true;
        // This logic can be improved to match job categories if they exist
        return true; 
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [jobs, searchTerm, selectedCategories]);

  const acceptedJobs = useMemo(() => {
    if (isGuest || !creator) return [];
    return jobs
      .filter(job => job.selectedCreatorIds.includes(creator.id) && (job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.CLOSED))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [jobs, creator, isGuest]);
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {isGuest ? (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-800 p-4 mb-8 rounded-r-lg shadow" role="alert">
          <p className="font-bold">ゲストとして閲覧中です。</p>
          <p>全ての機能を利用するには、<button onClick={onLoginClick} className="font-bold underline hover:text-indigo-900">ログイン</button>または新規登録が必要です。</p>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">ようこそ、{creator.name}さん！</h2>
          <p className="mt-2 text-lg text-gray-600">新しいチャンスを探しましょう。</p>
          <div className="mt-4 flex flex-wrap gap-2">
              {creator.categories.map(cat => <Tag key={cat}>{cat}</Tag>)}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                  onClick={() => setActiveTab('jobs')}
                  className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                  案件を探す
              </button>
              {!isGuest && (
                  <button
                      onClick={() => setActiveTab('scouts')}
                      className={`${activeTab === 'scouts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                  >
                      スカウト
                      {pendingScouts.length > 0 && (
                          <span className="absolute top-3 -right-3 ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{pendingScouts.length}</span>
                      )}
                  </button>
              )}
          </nav>
      </div>

      {activeTab === 'jobs' && (
        <>
            <div className="sticky top-16 bg-gray-50/95 backdrop-blur-sm z-40 py-4 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">募集中のお仕事</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="キーワードで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="w-full sm:w-2/3">
                        <p className="text-sm font-medium text-gray-700 mb-2">カテゴリで絞り込み:</p>
                        <div className="flex flex-wrap gap-2">
                            {CREATOR_CATEGORIES.map(category => (
                                <button key={category} onClick={() => toggleCategory(category)}
                                className={`px-3 py-1 text-sm rounded-full border ${selectedCategories.includes(category) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <JobCard
                    key={job.id}
                    job={job}
                    onApply={isGuest ? onLoginClick : () => onApply(job.id)}
                    isApplied={!isGuest && appliedJobIds.includes(job.id)}
                    isClosed={job.status !== JobStatus.OPEN}
                    isGuest={isGuest}
                    />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">現在募集中の案件がありません</h3>
                    <p className="mt-1 text-sm text-gray-500">条件に合う案件が見つかりませんでした。条件を変更して再度お試しください。</p>
                </div>
            )}

            {!isGuest && acceptedJobs.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">採用されたお仕事</h3>
                    <div className="space-y-4">
                        {acceptedJobs.map(job => (
                            <AcceptedJobRow key={job.id} job={job} onOpenChat={setActiveChatJob} />
                        ))}
                    </div>
                </div>
            )}
        </>
      )}

      {activeTab === 'scouts' && !isGuest && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">受信したスカウト</h3>
             {pendingScouts.length > 0 ? (
                <div className="space-y-6">
                    {pendingScouts.map(offer => (
                        <ScoutOfferCard
                            key={offer.id}
                            offer={offer}
                            job={jobs.find(j => j.id === offer.jobId)}
                            onRespond={onRespondToScout}
                            isApplied={appliedJobIds.includes(offer.jobId)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">新しいスカウトはありません</h3>
                    <p className="mt-1 text-sm text-gray-500">ブランドからのスカウトがここに表示されます。</p>
                </div>
            )}
          </div>
      )}

      {activeChatJob && creator && (
            <Modal isOpen={!!activeChatJob} onClose={() => setActiveChatJob(null)} title={`チャット: ${activeChatJob.title}`}>
                <Chat 
                    messages={chatMessages.filter(m => m.jobId === activeChatJob.id)}
                    currentUser={creator}
                    onSendMessage={(text) => handleSendMessage(activeChatJob.id, text)}
                />
            </Modal>
        )}
    </div>
  );
}

export default CreatorDashboard;