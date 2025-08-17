import React, { useState, useMemo } from 'react';
import { Brand, Job, JobStatus, Creator, JobTemplate, CreatorCategory, ChatMessage, User } from '../types';
import Modal from '../components/Modal';
import Tag from '../components/Tag';
import Chat from '../components/Chat';
import { JOB_TEMPLATES, CREATOR_CATEGORIES, BRAND_MONTHLY_FEE } from '../constants';
import CreatorCard from '../components/CreatorCard';

interface BrandDashboardProps {
  brand: Brand;
  jobs: Job[];
  creators: Creator[];
  chatMessages: ChatMessage[];
  onPostJob: (jobData: { title: string; description: string; payment: number; numberOfCreators: number; }) => void;
  onSelectCreator: (jobId: string, creatorId: string) => void;
  onScoutCreator: (creatorId: string, jobId: string, message: string) => void;
  handleSendMessage: (jobId: string, text: string) => void;
  onSubscribe: () => void;
  onPayJob: (jobId: string) => void;
  onCancelSubscription: (reason: string, feedback: string) => void;
}

function ApplicantCard({ creator, onSelect, isSelected, isDisabled }: { creator: Creator, onSelect: () => void, isSelected: boolean, isDisabled: boolean }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-lg ${isSelected ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div>
                <p className="font-semibold text-gray-800">{creator.name}</p>
                <div className="mt-2 space-y-2">
                    {creator.socials.map((social, index) => (
                        <div key={index} className="flex items-center gap-4 text-sm">
                            <a href={social.profileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex-shrink-0">{social.platform}</a>
                            <span className="text-gray-600">フォロワー: {social.followerCount.toLocaleString()}人</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                    {creator.categories.map(cat => <Tag key={cat} color="bg-gray-200 text-gray-700">{cat}</Tag>)}
                </div>
            </div>
            <button
              onClick={onSelect}
              disabled={isSelected || isDisabled}
              className={`px-3 py-1 text-sm font-medium rounded-md flex-shrink-0 transition-colors ${
                isSelected ? 'bg-green-600 text-white cursor-default' : 
                isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isSelected ? '選定済み' : 'このクリエイターに決定'}
            </button>
        </div>
    );
}

function JobPostForm({ onPostJob, onClose }: { onPostJob: (jobData: any) => void, onClose: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [payment, setPayment] = useState(0);
    const [numberOfCreators, setNumberOfCreators] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPostJob({ title, description, payment, numberOfCreators });
        onClose();
    };

    const applyTemplate = (template: JobTemplate) => {
        setTitle(template.title);
        setDescription(template.description);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">テンプレートから作成</h3>
                <p className="text-sm text-gray-500 mb-3">クリックすると内容が入力フォームに反映されます。</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {JOB_TEMPLATES.map(template => (
                        <div key={template.title} onClick={() => applyTemplate(template)} className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer">
                            <p className="font-semibold text-sm text-indigo-700">{template.category}</p>
                            <p className="text-sm text-gray-800">{template.title}</p>
                        </div>
                    ))}
                </div>
            </div>

            <hr/>

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">案件名</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">案件内容</label>
                <textarea
                    id="description"
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="payment" className="block text-sm font-medium text-gray-700">支払い金額 (円)</label>
                    <input
                        type="number"
                        id="payment"
                        value={payment}
                        onChange={e => setPayment(Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="numberOfCreators" className="block text-sm font-medium text-gray-700">募集人数</label>
                    <input
                        type="number"
                        id="numberOfCreators"
                        value={numberOfCreators}
                        onChange={e => setNumberOfCreators(Math.max(1, Number(e.target.value)))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">案件を投稿する</button>
            </div>
        </form>
    );
}

function ScoutModal({
    creator,
    openJobs,
    onScout,
    onClose,
}: {
    creator: Creator;
    openJobs: Job[];
    onScout: (jobId: string, message: string) => void;
    onClose: () => void;
}) {
    const [selectedJobId, setSelectedJobId] = useState<string>(openJobs[0]?.id || '');
    const [message, setMessage] = useState(`こんにちは、${creator.name}さん。\n\nあなたの素晴らしいご活躍を拝見し、ぜひ私たちのプロジェクトにご参加いただきたいと思い、ご連絡いたしました。\n\n以下の案件にご興味はありませんか？\nご確認いただけますと幸いです。`);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJobId) {
            alert('スカウトする案件を選択してください。');
            return;
        }
        onScout(selectedJobId, message);
        onClose();
    };

    if (openJobs.length === 0) {
        return (
            <div className="p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">スカウトできる案件がありません</h3>
                <p className="mt-2 text-sm text-gray-500">
                    クリエイターをスカウトするには、まず「募集中」の案件を投稿する必要があります。
                </p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md">
                    閉じる
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="job" className="block text-sm font-medium text-gray-700">スカウトする案件</label>
                <select
                    id="job"
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    {openJobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">メッセージ</label>
                <textarea
                    id="message"
                    rows={8}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                />
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">スカウトメッセージを送信</button>
            </div>
        </form>
    );
}

function SubscriptionCTA({ onSubscribe, isSubscribing }: { onSubscribe: () => void; isSubscribing: boolean; }) {
    const currencyFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
    return (
        <div className="bg-white rounded-lg shadow-xl text-center p-8 max-w-2xl mx-auto mt-10">
            <svg className="mx-auto h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">connerlyの全機能を開放しましょう</h2>
            <p className="mt-2 text-gray-600">サブスクリプションに登録して、素晴らしいクリエイターとのコラボレーションを始めましょう。</p>
            <div className="mt-6 inline-block bg-indigo-50 p-4 rounded-lg">
                <span className="font-bold text-3xl text-indigo-700">{currencyFormatter.format(BRAND_MONTHLY_FEE)}</span>
                <span className="text-gray-600"> / 月</span>
            </div>
            <ul className="mt-6 text-left space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-3"><svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>無制限の案件投稿</li>
                <li className="flex items-center gap-3"><svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>全クリエイターの検索と閲覧</li>
                <li className="flex items-center gap-3"><svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>クリエイターへの直接スカウト機能</li>
            </ul>
            <button
                onClick={onSubscribe}
                disabled={isSubscribing}
                className="mt-8 w-full max-w-xs inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait"
            >
                {isSubscribing ? '処理中...' : 'サブスクリプションに登録'}
            </button>
        </div>
    );
}

function CancellationModal({ onCancel, onClose }: { onCancel: (reason: string, feedback: string) => void; onClose: () => void; }) {
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');

    const reasons = [
        '期待した効果が得られなかった',
        '利用したいクリエイターが少なかった',
        'プラットフォームの利用が不便だった',
        '料金が高い',
        'その他'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            alert('解約理由を選択してください。');
            return;
        }
        onCancel(reason, feedback);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">サブスクリプションの解約</h3>
                <p className="mt-2 text-sm text-gray-500">
                    サービスの解約、誠に残念です。今後のサービス改善のため、差し支えなければ理由をお聞かせください。
                </p>
            </div>
            <div className="space-y-3">
                {reasons.map(r => (
                    <label key={r} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300 cursor-pointer">
                        <input
                            type="radio"
                            name="cancellation-reason"
                            value={r}
                            checked={reason === r}
                            onChange={() => setReason(r)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{r}</span>
                    </label>
                ))}
            </div>
            {reason === 'その他' && (
                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">具体的な理由をお聞かせください</label>
                    <textarea
                        id="feedback"
                        rows={4}
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="例：〇〇の機能が使いづらかった"
                    />
                </div>
            )}
            <div className="flex justify-end gap-4">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    キャンセル
                </button>
                <button type="submit" disabled={!reason} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300">
                    解約を確定する
                </button>
            </div>
        </form>
    );
}

function BrandDashboard({ brand, jobs, creators, chatMessages, onPostJob, onSelectCreator, onScoutCreator, handleSendMessage, onSubscribe, onPayJob, onCancelSubscription }: BrandDashboardProps) {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [scoutingCreator, setScoutingCreator] = useState<Creator | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'search'>('jobs');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minFollowers, setMinFollowers] = useState('');
  const [snsPlatform, setSnsPlatform] = useState('');

  const handleSubscription = () => {
    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
        onSubscribe();
        setIsSubscribing(false);
    }, 2000);
  };

  if (brand.subscriptionStatus === 'inactive') {
      return <div className="container mx-auto p-4 sm:p-6 lg:p-8"><SubscriptionCTA onSubscribe={handleSubscription} isSubscribing={isSubscribing} /></div>;
  }

  const myJobs = useMemo(() => jobs.filter(job => job.brandId === brand.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [jobs, brand.id]);
  const myOpenJobs = useMemo(() => myJobs.filter(job => job.status === JobStatus.OPEN), [myJobs]);
  
  const paymentFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleOpenScoutModal = (creator: Creator) => {
      setScoutingCreator(creator);
      setIsScoutModalOpen(true);
  };
  
  const handleCloseScoutModal = () => {
      setScoutingCreator(null);
      setIsScoutModalOpen(false);
  }

  const handleSendScout = (jobId: string, message: string) => {
      if(scoutingCreator) {
          onScoutCreator(scoutingCreator.id, jobId, message);
      }
  };

  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
        if (searchTerm && !creator.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedCategories.length > 0 && !selectedCategories.every(cat => creator.categories.includes(cat))) return false;
        if (snsPlatform && !creator.socials.some(s => s.platform.toLowerCase().includes(snsPlatform.toLowerCase()))) return false;
        if (minFollowers) {
            const totalFollowers = creator.socials.reduce((acc, social) => acc + social.followerCount, 0);
            if (totalFollowers < Number(minFollowers)) return false;
        }
        return true;
    });
  }, [creators, searchTerm, selectedCategories, minFollowers, snsPlatform]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">ようこそ、{brand.name}さん</h2>
            <p className="mt-2 text-lg text-gray-600">新しいコラボレーションを始めましょう。</p>
            <div className="mt-2">
                <button onClick={() => setIsCancelModalOpen(true)} className="text-sm text-gray-500 hover:text-red-600 hover:underline">サブスクリプションを解約する</button>
            </div>
        </div>
        {activeTab === 'jobs' && (
            <button
              onClick={() => setIsJobModalOpen(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              新しい案件を投稿
            </button>
        )}
      </div>
      
      <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}>案件管理</button>
              <button onClick={() => setActiveTab('search')} className={`${activeTab === 'search' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}>クリエイターを探す</button>
          </nav>
      </div>

      <Modal isOpen={isJobModalOpen} onClose={() => setIsJobModalOpen(false)} title="新しい案件を投稿する">
        <JobPostForm onPostJob={onPostJob} onClose={() => setIsJobModalOpen(false)} />
      </Modal>

      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="解約手続き">
        <CancellationModal onCancel={onCancelSubscription} onClose={() => setIsCancelModalOpen(false)} />
      </Modal>

      {scoutingCreator && (
        <Modal isOpen={isScoutModalOpen} onClose={handleCloseScoutModal} title={`${scoutingCreator.name}さんをスカウトする`}>
            <ScoutModal creator={scoutingCreator} openJobs={myOpenJobs} onScout={handleSendScout} onClose={handleCloseScoutModal} />
        </Modal>
      )}

      {activeChatJob && (
          <Modal isOpen={!!activeChatJob} onClose={() => setActiveChatJob(null)} title={`チャット: ${activeChatJob.title}`}>
              <Chat 
                  messages={chatMessages.filter(m => m.jobId === activeChatJob.id)}
                  currentUser={brand}
                  onSendMessage={(text) => handleSendMessage(activeChatJob.id, text)}
              />
          </Modal>
      )}

      {activeTab === 'jobs' && (
          <div className="space-y-8">
            {myJobs.length > 0 ? myJobs.map(job => (
              <div key={job.id} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                    <p className="text-lg font-semibold text-indigo-600 mt-1">{paymentFormatter.format(job.payment)}</p>
                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span><span className="font-medium">募集:</span> {job.numberOfCreators}名</span>
                      <span><span className="font-medium">応募:</span> {job.applicants.length}名</span> 
                      <span><span className="font-medium">選定済み:</span> {job.selectedCreatorIds.length}名</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.selectedCreatorIds.length > 0 && (
                        <button
                            onClick={() => setActiveChatJob(job)}
                            className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                            title="チャットを開く"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm1.5 0a.5.5 0 00-.5.5v6a.5.5 0 00.5.5h11a.5.5 0 00.5-.5V5.5a.5.5 0 00-.5-.5h-11z" />
                                <path d="M2 13.5a.5.5 0 01.5-.5H5V13a1 1 0 102 0v-1.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V13a1 1 0 102 0v-1.5a.5.5 0 01.5-.5h1.5a.5.5 0 010 1H16v.5h1.5a.5.5 0 010 1H16v.5h1.5a.5.5 0 010 1H16v.5a.5.5 0 01-1 0v-.5h-1v.5a.5.5 0 01-1 0v-.5h-1v.5a.5.5 0 01-1 0v-.5h-1v.5a.5.5 0 01-1 0v-.5H7v.5a.5.5 0 01-1 0v-.5H5v.5a.5.5 0 01-1 0V14H2.5a.5.5 0 01-.5-.5z" />
                            </svg>
                        </button>
                    )}
                    <Tag color={job.status === JobStatus.OPEN ? 'bg-green-100 text-green-800' : job.status === JobStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {job.status}
                    </Tag>
                  </div>
                </div>
                <p className="text-gray-600 mt-3">{job.description}</p>
                
                {job.status === JobStatus.CLOSED && job.selectedCreatorIds.length > 0 && job.paymentStatus === 'unpaid' && (
                    <div className="mt-4 border-t pt-4 text-right">
                        <button onClick={() => onPayJob(job.id)} className="px-5 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 font-semibold">
                            クリエイターに報酬を支払う ({paymentFormatter.format(job.payment * job.selectedCreatorIds.length)})
                        </button>
                    </div>
                )}
                {job.paymentStatus === 'paid' && (
                     <div className="mt-4 border-t pt-4 text-right">
                        <p className="text-green-700 font-semibold flex items-center justify-end gap-2">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            支払い済み
                        </p>
                    </div>
                )}

                <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">
                      {job.applicants.length > 0 ? '応募者一覧' : 'まだ応募がありません'}
                    </h4>
                    
                    {job.status !== JobStatus.CLOSED && job.applicants.length > 0 && (
                        <div className="space-y-3">
                            {job.applicants.map(creatorId => {
                                const applicant = creators.find(c => c.id === creatorId);
                                if (!applicant) return null;
                                const isSelected = job.selectedCreatorIds.includes(creatorId);
                                const isJobFull = job.selectedCreatorIds.length >= job.numberOfCreators;
                                return <ApplicantCard key={creatorId} creator={applicant} onSelect={() => onSelectCreator(job.id, creatorId)} isSelected={isSelected} isDisabled={isSelected || isJobFull} />;
                            })}
                        </div>
                    )}

                    {job.status === JobStatus.CLOSED && job.selectedCreatorIds.length > 0 && (
                         <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-2">選定したクリエイター:</p>
                            {job.selectedCreatorIds.map(creatorId => {
                                 const applicant = creators.find(c => c.id === creatorId);
                                 if (!applicant) return null;
                                return <ApplicantCard key={creatorId} creator={applicant} onSelect={() => {}} isSelected={true} isDisabled={true} />;
                            })}
                         </div>
                    )}
                    
                    {job.applicants.length === 0 && (
                        <p className="text-sm text-gray-500 italic mt-3">この案件にはまだ応募がありません。</p>
                    )}
                </div>
              </div>
            )) : (
                <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">まだ案件が投稿されていません</h3>
                    <p className="mt-1 text-sm text-gray-500">右上の「新しい案件を投稿」ボタンから最初の案件を作成しましょう。</p>
                </div>
            )}
          </div>
      )}

      {activeTab === 'search' && (
        <div>
          <div className="p-6 bg-white rounded-xl shadow-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="search-term" className="block text-sm font-medium text-gray-700">クリエイター名</label>
                      <input type="text" id="search-term" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="佐藤 リナ" />
                  </div>
                  <div>
                      <label htmlFor="sns-platform" className="block text-sm font-medium text-gray-700">SNSプラットフォーム</label>
                      <input type="text" id="sns-platform" value={snsPlatform} onChange={e => setSnsPlatform(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="YouTube" />
                  </div>
                  <div>
                      <label htmlFor="min-followers" className="block text-sm font-medium text-gray-700">総フォロワー数 (以上)</label>
                      <input type="number" id="min-followers" value={minFollowers} onChange={e => setMinFollowers(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="50000" />
                  </div>
              </div>
              <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">活動カテゴリ</label>
                   <div className="mt-2 flex flex-wrap gap-2">
                      {CREATOR_CATEGORIES.map(category => (
                          <button key={category} onClick={() => toggleCategoryFilter(category)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedCategories.includes(category) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                              {category}
                          </button>
                      ))}
                   </div>
              </div>
          </div>

          <div className="space-y-6">
              <p className="text-sm text-gray-600 px-1">{filteredCreators.length}名のクリエイターが見つかりました。</p>
              {filteredCreators.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCreators.map(creator => (
                        <CreatorCard key={creator.id} creator={creator} onScout={handleOpenScoutModal}/>
                    ))}
                  </div>
              ) : (
                   <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
                      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">クリエイターが見つかりません</h3>
                      <p className="mt-1 text-sm text-gray-500">検索条件を変更して、再度お試しください。</p>
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandDashboard;