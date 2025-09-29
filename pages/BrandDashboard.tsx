
import React, { useState, useMemo } from 'react';
import { Brand, Job, Creator, JobStatus, ChatMessage, SubscriptionStatus, PaymentStatus } from '../types';
import Modal from '../components/Modal';
import Tag from '../components/Tag';
import CreatorCard from '../components/CreatorCard';
import Chat from '../components/Chat';

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

const paymentFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

const PostJobForm: React.FC<{ onPostJob: BrandDashboardProps['onPostJob'], onClose: () => void }> = ({ onPostJob, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [payment, setPayment] = useState(0);
    const [numberOfCreators, setNumberOfCreators] = useState(1);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPostJob({ title, description, payment, numberOfCreators });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">案件タイトル</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">案件詳細</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">報酬額 (円)</label>
                <input type="number" value={payment} onChange={e => setPayment(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">募集人数</label>
                <input type="number" value={numberOfCreators} onChange={e => setNumberOfCreators(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end gap-2">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200">キャンセル</button>
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">投稿する</button>
            </div>
        </form>
    );
};

const ScoutCreatorModal: React.FC<{
    creator: Creator;
    myJobs: Job[];
    onScout: (jobId: string, message: string) => void;
    onClose: () => void;
}> = ({ creator, myJobs, onScout, onClose }) => {
    const [selectedJobId, setSelectedJobId] = useState<string>('');
    const [message, setMessage] = useState(`こんにちは、${creator.name}さん。\nあなたの素晴らしいご活躍を拝見し、ぜひ当社の案件にご協力いただきたくご連絡いたしました。\nご検討いただけますと幸いです。`);

    const openJobs = myJobs.filter(j => j.status === JobStatus.OPEN);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJobId) {
            alert('スカウトする案件を選択してください。');
            return;
        }
        onScout(selectedJobId, message);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium">スカウト: {creator.name}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">対象案件</label>
                <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">案件を選択...</option>
                    {openJobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
                 {openJobs.length === 0 && <p className="text-xs text-red-500 mt-1">スカウト可能な募集中案件がありません。先に案件を作成してください。</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">メッセージ</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={6} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200">キャンセル</button>
                <button type="submit" disabled={openJobs.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400">スカウトを送信</button>
            </div>
        </form>
    );
};


function BrandDashboard({
    brand,
    jobs,
    creators,
    chatMessages,
    onPostJob,
    onSelectCreator,
    onScoutCreator,
    handleSendMessage,
    onSubscribe,
    onPayJob,
    onCancelSubscription,
}: BrandDashboardProps) {
    const [activeTab, setActiveTab] = useState<'jobs' | 'creators'>('jobs');
    const [isPostJobModalOpen, setPostJobModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [scoutingCreator, setScoutingCreator] = useState<Creator | null>(null);
    const [activeChatJob, setActiveChatJob] = useState<Job | null>(null);

    const myJobs = useMemo(() => jobs.filter(j => j.brandId === brand.id).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()), [jobs, brand.id]);

    const getPaymentStatusTag = (status: PaymentStatus) => {
        switch (status) {
            case 'paid':
                return <Tag color="bg-green-100 text-green-800">支払い済み</Tag>;
            case 'unpaid':
                 return <Tag color="bg-yellow-100 text-yellow-800">未払い</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    if (brand.subscriptionStatus === 'inactive') {
        return (
            <div className="container mx-auto p-8 text-center">
                <div className="bg-white p-10 rounded-lg shadow-xl max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800">サブスクリプションが有効ではありません</h2>
                    <p className="mt-4 text-gray-600">
                        connerlyの全ての機能を利用するには、月額サブスクリプション（{paymentFormatter.format(20000)}）への登録が必要です。
                    </p>
                    <button onClick={onSubscribe} className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        今すぐ登録する
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">ようこそ、{brand.name}さん</h2>
                    <p className="mt-2 text-lg text-gray-600">新しい才能を見つけましょう。</p>
                </div>
                {activeTab === 'jobs' && (
                    <button
                        onClick={() => setPostJobModalOpen(true)}
                        className="px-6 py-3 font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700"
                    >
                        新しい案件を投稿
                    </button>
                )}
            </div>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('jobs')} className={`${activeTab === 'jobs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                        案件管理
                    </button>
                    <button onClick={() => setActiveTab('creators')} className={`${activeTab === 'creators' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                        クリエイターを探す
                    </button>
                </nav>
            </div>

            {activeTab === 'jobs' && (
                <div className="space-y-6">
                    {myJobs.length > 0 ? myJobs.map(job => (
                        <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                                <Tag color={job.status === JobStatus.OPEN ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{job.status}</Tag>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{paymentFormatter.format(job.payment)} | 募集: {job.numberOfCreators}名 | 採用: {job.selectedCreatorIds.length}名</p>
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => setSelectedJob(job)} className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200">
                                    応募者を見る ({job.applicants.length})
                                </button>
                                {job.selectedCreatorIds.length > 0 && (
                                     <button onClick={() => setActiveChatJob(job)} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                                        チャットを開く
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : <p>まだ投稿した案件がありません。</p>}
                </div>
            )}

            {activeTab === 'creators' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creators.map(creator => (
                        <CreatorCard key={creator.id} creator={creator} onScout={setScoutingCreator} />
                    ))}
                </div>
            )}

            <Modal isOpen={isPostJobModalOpen} onClose={() => setPostJobModalOpen(false)} title="新しい案件を投稿">
                <PostJobForm onPostJob={onPostJob} onClose={() => setPostJobModalOpen(false)} />
            </Modal>

            {selectedJob && (
                <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={`応募者一覧: ${selectedJob.title}`}>
                    <div className="space-y-4">
                        {selectedJob.applicants.length > 0 ? selectedJob.applicants.map(creatorId => {
                            const creator = creators.find(c => c.id === creatorId);
                            if (!creator) return null;
                            const isSelected = selectedJob.selectedCreatorIds.includes(creatorId);
                            const isJobFull = selectedJob.selectedCreatorIds.length >= selectedJob.numberOfCreators;
                            return (
                                <div key={creatorId} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-semibold">{creator.name}</p>
                                        <p className="text-sm text-gray-500">{creator.socials.map(s => `${s.platform}: ${s.followerCount.toLocaleString()}`).join(', ')}</p>
                                    </div>
                                    <button
                                        onClick={() => onSelectCreator(selectedJob.id, creatorId)}
                                        disabled={isSelected || isJobFull}
                                        className="px-4 py-2 text-sm font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed enabled:bg-green-600 enabled:text-white enabled:hover:bg-green-700"
                                    >
                                        {isSelected ? '選定済み' : (isJobFull ? '募集終了' : '選定する')}
                                    </button>
                                </div>
                            );
                        }) : <p>まだ応募者がいません。</p>}
                    </div>
                </Modal>
            )}
            
            {scoutingCreator && (
                <Modal isOpen={!!scoutingCreator} onClose={() => setScoutingCreator(null)} title="クリエイターをスカウト">
                    <ScoutCreatorModal
                        creator={scoutingCreator}
                        myJobs={myJobs}
                        onClose={() => setScoutingCreator(null)}
                        onScout={(jobId, message) => onScoutCreator(scoutingCreator.id, jobId, message)}
                    />
                </Modal>
            )}

            {activeChatJob && brand && (
                <Modal isOpen={!!activeChatJob} onClose={() => setActiveChatJob(null)} title={`チャット: ${activeChatJob.title}`}>
                    <Chat 
                        messages={chatMessages.filter(m => m.jobId === activeChatJob.id)}
                        currentUser={brand}
                        onSendMessage={(text) => handleSendMessage(activeChatJob.id, text)}
                    />
                </Modal>
            )}
        </div>
    );
}

export default BrandDashboard;
