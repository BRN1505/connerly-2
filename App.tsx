import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Page, Creator, Brand, Admin, Job, JobStatus, CreatorCategory, SocialProfile, ScoutOffer, ScoutOfferStatus, SubscriptionStatus, PaymentStatus, Notification, ChatMessage } from './types';
import { ADMIN_EMAIL } from './constants';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreatorDashboard from './pages/CreatorDashboard';
import BrandDashboard from './pages/BrandDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Modal from './components/Modal';
import Toast from './components/Toast';
import { CREATOR_CATEGORIES } from './constants';

// --- Mock Data (as fallback) ---
const initialCreators: Creator[] = [
    { id: 'c1', role: UserRole.CREATOR, name: '佐藤 リナ', email: 'rina.sato@example.com', password: 'password123',
      socials: [
        { platform: 'Instagram', followerCount: 25000, profileUrl: 'https://instagram.com/rinasato' }
      ], 
      categories: [CreatorCategory.FASHION, CreatorCategory.BEAUTY] },
    { id: 'c2', role: UserRole.CREATOR, name: '田中 健太', email: 'kenta.tanaka@example.com', password: 'password123',
      socials: [
        { platform: 'YouTube', followerCount: 120000, profileUrl: 'https://youtube.com/kentatanaka' }
      ],
      categories: [CreatorCategory.GAMING, CreatorCategory.DIY] },
    { id: 'c3', role: UserRole.CREATOR, name: '鈴木 ゆい', email: 'yui.suzuki@example.com', password: 'password123',
      socials: [
        { platform: 'TikTok', followerCount: 500000, profileUrl: 'https://tiktok.com/yuisuzuki' },
        { platform: 'Instagram', followerCount: 80000, profileUrl: 'https://instagram.com/yuisuzuki_travel' },
      ],
      categories: [CreatorCategory.FOOD, CreatorCategory.TRAVEL, 'ペット'] },
];

const initialBrands: Brand[] = [
    { id: 'b1', role: UserRole.BRAND, name: 'NextWear Apparel', email: 'contact@nextwear.com', password: 'password123', subscriptionStatus: 'active' },
    { id: 'b2', role: UserRole.BRAND, name: 'Gourmet Box Japan', email: 'support@gourmetbox.jp', password: 'password123', subscriptionStatus: 'inactive' },
];

const initialJobs: Job[] = [
    { id: 'j1', brandId: 'b1', brandName: 'NextWear Apparel', title: '新作春夏コレクションのSNSモデル', description: '私たちの新しい春夏コレクションのアイテムを着用し、Instagramで3回のフィード投稿をお願いします。', payment: 50000, numberOfCreators: 2, status: JobStatus.IN_PROGRESS, createdAt: new Date('2024-05-10T10:00:00Z'), applicants: ['c1', 'c2', 'c3'], selectedCreatorIds: ['c1'], paymentStatus: 'unpaid' },
    { id: 'j2', brandId: 'b2', brandName: 'Gourmet Box Japan', title: 'お取り寄せグルメのレビュー動画', description: '毎月届くグルメボックスの中身を紹介し、実際に調理・試食するYouTube動画を作成してください。', payment: 80000, numberOfCreators: 1, status: JobStatus.OPEN, createdAt: new Date('2024-05-12T14:00:00Z'), applicants: [], selectedCreatorIds: [], paymentStatus: 'unpaid' },
    { id: 'j3', brandId: 'b1', brandName: 'NextWear Apparel', title: '限定スニーカーの開封の儀', description: '発売前の限定スニーカーをお送りします。開封からレビューまでをお願いします。', payment: 30000, numberOfCreators: 1, status: JobStatus.CLOSED, createdAt: new Date('2024-04-20T11:00:00Z'), applicants: ['c1', 'c2'], selectedCreatorIds: ['c1'], paymentStatus: 'paid' },
];

const initialScoutOffers: ScoutOffer[] = [
    { id: 'so1', brandId: 'b2', brandName: 'Gourmet Box Japan', creatorId: 'c3', jobId: 'j2', message: '鈴木さんのグルメ投稿、いつも楽しく拝見しています！ぜひ当社のグルメボックスのレビューをお願いできませんでしょうか？', status: ScoutOfferStatus.PENDING, createdAt: new Date() }
];

const initialChatMessages: ChatMessage[] = [
    { id: 'msg1', jobId: 'j1', senderId: 'b1', senderName: 'NextWear Apparel', text: '佐藤さん、この度はご参加いただきありがとうございます！撮影の件ですが、来週あたりでご都合いかがでしょうか？', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 24) },
    { id: 'msg2', jobId: 'j1', senderId: 'c1', senderName: '佐藤 リナ', text: 'ご連絡ありがとうございます！はい、来週ですと火曜日以降でしたら調整可能です。', timestamp: new Date(new Date().getTime() - 1000 * 60 * 60 * 23) }
];


const adminUser: Admin = { id: 'admin1', role: UserRole.ADMIN, name: '管理者', email: ADMIN_EMAIL, password: 'Ariel1550' };

function loadStateFromLocalStorage<T>(key: string, defaultValue: T, reviver?: (key: string, value: any) => any): T {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            return JSON.parse(storedValue, reviver);
        }
    } catch (e) {
        console.error(`Error loading ${key} from localStorage`, e);
    }
    return defaultValue;
}

// --- Login/Register Forms (defined outside App to avoid re-renders) ---
function LoginForm({ onLogin }: { onLogin: (email: string, password: string) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }} className="space-y-4">
            <div>
                <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input type="email" id="email-login" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
             <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">パスワード</label>
                <input type="password" id="password-login" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">ログイン</button>
        </form>
    );
}

function RegisterForm({ onRegister }: { onRegister: (data: any, role: UserRole) => void }) {
    const [role, setRole] = useState<UserRole.CREATOR | UserRole.BRAND>(UserRole.CREATOR);
    // Common fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Creator specific fields
    const [socials, setSocials] = useState<SocialProfile[]>([{ platform: 'Instagram', profileUrl: '', followerCount: 0 }]);
    const [categories, setCategories] = useState<string[]>([]);
    const [otherCategoryText, setOtherCategoryText] = useState('');
    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";


    const handleCategoryChange = (category: string) => {
        setCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
    };
    
    const handleSocialChange = (index: number, field: keyof SocialProfile, value: string | number) => {
        const newSocials = socials.map((social, i) => i === index ? { ...social, [field]: value } : social);
        setSocials(newSocials);
    };

    const addSocial = () => {
        setSocials([...socials, { platform: 'Instagram', profileUrl: '', followerCount: 0 }]);
    };
    
    const removeSocial = (index: number) => {
        setSocials(socials.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert('パスワードが一致しません。');
            return;
        }
        if (password.length < 8) {
            alert('パスワードは8文字以上で設定してください。');
            return;
        }

        if (role === UserRole.CREATOR) {
            const finalCategories: string[] = categories.filter(c => c !== CreatorCategory.OTHER);
            if (categories.includes(CreatorCategory.OTHER) && otherCategoryText.trim()) {
                finalCategories.push(...otherCategoryText.split(/[,、]/).map(s => s.trim()).filter(Boolean));
            }

            const areSocialsValid = socials.every(s => s.profileUrl && s.followerCount >= 0);
            if (!areSocialsValid) {
                alert('すべてのSNS情報は正しく入力してください（URLとフォロワー数）。');
                return;
            }

            onRegister({ name, email, password, socials, categories: finalCategories }, UserRole.CREATOR);
        } else {
            onRegister({ name, email, password }, UserRole.BRAND);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button type="button" onClick={() => setRole(UserRole.CREATOR)} className={`${role === UserRole.CREATOR ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>クリエイターとして登録</button>
                    <button type="button" onClick={() => setRole(UserRole.BRAND)} className={`${role === UserRole.BRAND ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>ブランドとして登録</button>
                </nav>
            </div>
            
             <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{role === UserRole.CREATOR ? 'クリエイター名' : 'ブランド名'}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputStyles}/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputStyles}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">パスワード (8文字以上)</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputStyles}/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">パスワード (確認用)</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputStyles}/>
                </div>
            </div>


            {role === UserRole.CREATOR ? (
                // Creator Fields
                <div className="space-y-6 pt-6 border-t">
                    <p className="text-sm text-gray-600">あなたの才能をアピールしましょう！登録は無料です。</p>
                   
                    {/* SNS Fields */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">SNSアカウント</label>
                        {socials.map((social, index) => (
                            <div key={index} className="p-3 border rounded-md space-y-3 relative">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">SNSプラットフォーム</label>
                                        <input type="text" value={social.platform} onChange={e => handleSocialChange(index, 'platform', e.target.value)} className={inputStyles} list="social-platforms" placeholder="例: Instagram" />
                                        <datalist id="social-platforms">
                                            <option value="Instagram" />
                                            <option value="YouTube" />
                                            <option value="TikTok" />
                                            <option value="X (旧Twitter)" />
                                            <option value="Blog" />
                                        </datalist>
                                    </div>
                                     <div>
                                        <label className="block text-xs font-medium text-gray-500">フォロワー数</label>
                                        <input type="number" value={social.followerCount} onChange={e => handleSocialChange(index, 'followerCount', Number(e.target.value))} required className={inputStyles} placeholder="例: 10000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">プロフィールURL</label>
                                    <input type="url" value={social.profileUrl} onChange={e => handleSocialChange(index, 'profileUrl', e.target.value)} required className={inputStyles}/>
                                </div>
                                {socials.length > 1 && (
                                     <button type="button" onClick={() => removeSocial(index)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addSocial} className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            SNSを追加
                        </button>
                    </div>

                    {/* Category Fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">活動カテゴリ (複数選択可)</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.values(CreatorCategory).map(cat => (
                                <label key={cat} className="flex items-center space-x-2 p-2 border rounded-md has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-400 cursor-pointer">
                                    <input type="checkbox" checked={categories.includes(cat)} onChange={() => handleCategoryChange(cat)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <span className="text-sm">{cat}</span>
                                </label>
                            ))}
                        </div>
                        {categories.includes(CreatorCategory.OTHER) && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700">その他のカテゴリを具体的に入力</label>
                                <input type="text" value={otherCategoryText} onChange={e => setOtherCategoryText(e.target.value)} className={inputStyles} placeholder="例: ペット, 投資 (カンマ区切り)" />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="pt-6 border-t">
                    <p className="text-sm text-gray-600">素晴らしいクリエイターと出会いましょう！利用料は月額20,000円です。</p>
                </div>
            )}
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">同意して登録</button>
        </form>
    );
}

export default function App() {
  const [page, setPage] = useState<Page>(Page.HOME);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const dateReviver = (key: string, value: any) => {
      if (key === 'createdAt' || key === 'timestamp') return new Date(value);
      return value;
  };

  const [creators, setCreators] = useState<Creator[]>(() => loadStateFromLocalStorage('connerly_creators', initialCreators));
  const [brands, setBrands] = useState<Brand[]>(() => loadStateFromLocalStorage('connerly_brands', initialBrands));
  const [jobs, setJobs] = useState<Job[]>(() => loadStateFromLocalStorage('connerly_jobs', initialJobs, dateReviver));
  const [scoutOffers, setScoutOffers] = useState<ScoutOffer[]>(() => loadStateFromLocalStorage('connerly_scoutOffers', initialScoutOffers, dateReviver));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadStateFromLocalStorage('connerly_chatMessages', initialChatMessages, dateReviver));


  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
        localStorage.setItem('connerly_creators', JSON.stringify(creators));
        localStorage.setItem('connerly_brands', JSON.stringify(brands));
        localStorage.setItem('connerly_jobs', JSON.stringify(jobs));
        localStorage.setItem('connerly_scoutOffers', JSON.stringify(scoutOffers));
        localStorage.setItem('connerly_chatMessages', JSON.stringify(chatMessages));
    } catch(e) {
        console.error("Failed to save state to localStorage", e);
    }
  }, [creators, brands, jobs, scoutOffers, chatMessages]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'success') => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);


  const handleLogin = (email: string, password: string) => {
      const allUsers: User[] = [...creators, ...brands, adminUser];
      const foundUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && foundUser.password === password) {
          setCurrentUser(foundUser);
          setPage(Page.DASHBOARD);
          setLoginModalOpen(false);
      } else {
          alert('メールアドレスまたはパスワードが正しくありません。');
      }
  };

  const handleRegister = (data: any, role: UserRole) => {
      let newUser: User;
      if(role === UserRole.CREATOR) {
          newUser = {
              id: `c${Date.now()}`,
              role,
              ...data,
          };
          setCreators(prev => [...prev, newUser as Creator]);
      } else {
           newUser = {
              id: `b${Date.now()}`,
              role,
              subscriptionStatus: 'active' as SubscriptionStatus,
              ...data,
          };
          setBrands(prev => [...prev, newUser as Brand]);
      }
      setCurrentUser(newUser);
      setPage(Page.DASHBOARD);
      setRegisterModalOpen(false);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setPage(Page.HOME);
  };

  const handlePostJob = (jobData: { title: string; description: string; payment: number; numberOfCreators: number; }) => {
    if (currentUser?.role !== UserRole.BRAND) return;
    const newJob: Job = {
        id: `j${Date.now()}`,
        brandId: currentUser.id,
        brandName: currentUser.name,
        ...jobData,
        status: JobStatus.OPEN,
        createdAt: new Date(),
        applicants: [],
        selectedCreatorIds: [],
        paymentStatus: 'unpaid',
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const handleApplyJob = useCallback((jobId: string) => {
    if (currentUser?.role !== UserRole.CREATOR) {
        setLoginModalOpen(true);
        return;
    }
    const creatorId = currentUser.id;
    const job = jobs.find(j => j.id === jobId);
    const brand = brands.find(b => b.id === job?.brandId);

    setJobs(prevJobs => prevJobs.map(j => {
        if (j.id === jobId && !j.applicants.includes(creatorId)) {
            return { ...j, applicants: [...j.applicants, creatorId] };
        }
        return j;
    }));
    
    if (job && brand) {
      console.log(`--- SIMULATING EMAIL (Apply) ---`);
      console.log(`To: ${brand.email}`);
      console.log(`From: system@connerly.com`);
      console.log(`Subject: [connerly] 新規応募のお知らせ: 「${job.title}」`);
      console.log(`内容: ${currentUser.name}さんがあなたの案件「${job.title}」に応募しました。ダッシュボードからご確認ください。`);
      console.log(`---------------------------------`);
      addNotification(`「${job.title}」に応募しました。${brand.name}に通知が送信されます。`);
    }
  }, [currentUser, jobs, brands, addNotification]);

  const handleSelectCreator = (jobId: string, creatorId: string) => {
      const job = jobs.find(j => j.id === jobId);
      const creator = creators.find(c => c.id === creatorId);

      setJobs(prevJobs => prevJobs.map(j => {
          if (j.id === jobId && !j.selectedCreatorIds.includes(creatorId)) {
              const newSelectedIds = [...j.selectedCreatorIds, creatorId];
              const isJobFilled = newSelectedIds.length >= j.numberOfCreators;
              
              return { 
                  ...j, 
                  selectedCreatorIds: newSelectedIds, 
                  status: isJobFilled ? JobStatus.CLOSED : JobStatus.IN_PROGRESS 
              };
          }
          return j;
      }));

      if(job && creator) {
        console.log(`--- SIMULATING EMAIL (Match) ---`);
        console.log(`To: ${creator.email}`);
        console.log(`From: system@connerly.com`);
        console.log(`Subject: [connerly] おめでとうございます！案件に採用されました`);
        console.log(`内容: ${job.brandName}の案件「${job.title}」に採用されました。今後の流れについてはブランドからの連絡をお待ちください。`);
        console.log(`--------------------------------`);
        addNotification(`${creator.name}さんを「${job.title}」の案件に選定しました。`);
    }
  };

  const handleScoutCreator = (creatorId: string, jobId: string, message: string) => {
      if (currentUser?.role !== UserRole.BRAND) return;
      
      const creator = creators.find(c => c.id === creatorId);
      if (!creator) return;

      const newScoutOffer: ScoutOffer = {
          id: `so${Date.now()}`,
          brandId: currentUser.id,
          brandName: currentUser.name,
          creatorId,
          jobId,
          message,
          status: ScoutOfferStatus.PENDING,
          createdAt: new Date(),
      };
      setScoutOffers(prev => [...prev, newScoutOffer]);
      
      console.log(`--- SIMULATING EMAIL (Scout) ---`);
      console.log(`To: ${creator.email}`);
      console.log(`From: system@connerly.com`);
      console.log(`Subject: [connerly] ${currentUser.name}からスカウトが届いています`);
      console.log(`内容: ${currentUser.name}からスカウトが届きました。ダッシュボードからメッセージを確認し、応募をご検討ください。`);
      console.log(`---------------------------------`);
      addNotification(`${creator.name}さんをスカウトしました。通知が送信されます。`);
  };

  const handleRespondToScout = (scoutId: string, response: 'ACCEPTED' | 'DECLINED') => {
      const offer = scoutOffers.find(o => o.id === scoutId);
      if (!offer || currentUser?.role !== UserRole.CREATOR) return;
      
      setScoutOffers(prev => prev.map(o => o.id === scoutId ? {...o, status: ScoutOfferStatus[response]} : o));

      if (response === 'ACCEPTED') {
          handleApplyJob(offer.jobId);
          addNotification("スカウトを承諾し、案件に応募しました。");
      } else {
          addNotification("スカウトを辞退しました。", "info");
      }
  };

  const handleSubscribe = () => {
    if (currentUser?.role !== UserRole.BRAND) return;
    const brandId = currentUser.id;
    
    const updatedUser = { ...currentUser, subscriptionStatus: 'active' as SubscriptionStatus };
    const updatedBrands = brands.map(b => b.id === brandId ? updatedUser as Brand : b);
    
    setCurrentUser(updatedUser);
    setBrands(updatedBrands);
  };
  
  const handlePayJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, paymentStatus: 'paid' as PaymentStatus } : job
    ));
  };
  
  const handleCancelSubscription = (reason: string, feedback: string) => {
    if (currentUser?.role !== UserRole.BRAND) return;
    const brandId = currentUser.id;
    
    const updatedUser = { 
        ...currentUser, 
        subscriptionStatus: 'inactive' as SubscriptionStatus,
        cancellationReason: reason,
        cancellationFeedback: feedback,
    };
    
    const updatedBrands = brands.map(b => b.id === brandId ? updatedUser as Brand : b);
    
    setCurrentUser(updatedUser);
    setBrands(updatedBrands);
  };

  const handleSendMessage = (jobId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        jobId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: text.trim(),
        timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, newMessage]);
  };


  const renderDashboard = () => {
    if (!currentUser) return null;
    switch(currentUser.role) {
      case UserRole.CREATOR:
        const appliedJobIds = jobs.filter(j => j.applicants.includes(currentUser.id)).map(j => j.id);
        return <CreatorDashboard 
            creator={currentUser as Creator} 
            jobs={jobs} scoutOffers={scoutOffers} 
            chatMessages={chatMessages}
            onApply={handleApplyJob} 
            onRespondToScout={handleRespondToScout} 
            handleSendMessage={handleSendMessage}
            appliedJobIds={appliedJobIds}
        />;
      case UserRole.BRAND:
        return <BrandDashboard 
            brand={currentUser as Brand} 
            jobs={jobs} 
            creators={creators} 
            chatMessages={chatMessages}
            onPostJob={handlePostJob} 
            onSelectCreator={handleSelectCreator} 
            onScoutCreator={handleScoutCreator} 
            handleSendMessage={handleSendMessage}
            onSubscribe={handleSubscribe} 
            onPayJob={handlePayJob} 
            onCancelSubscription={handleCancelSubscription} 
        />;
      case UserRole.ADMIN:
        return <AdminDashboard creators={creators} brands={brands} jobs={jobs}/>;
      default:
        return null;
    }
  };

  const renderPage = () => {
    switch(page) {
        case Page.HOME:
            return <HomePage onRegisterClick={() => setRegisterModalOpen(true)} onGuestViewClick={() => setPage(Page.GUEST)} />;
        case Page.DASHBOARD:
            return renderDashboard();
        case Page.GUEST:
            return <CreatorDashboard jobs={jobs} onLoginClick={() => setLoginModalOpen(true)} chatMessages={chatMessages} handleSendMessage={() => {}} />;
        default:
            return <HomePage onRegisterClick={() => setRegisterModalOpen(true)} onGuestViewClick={() => setPage(Page.GUEST)} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onLoginClick={() => setLoginModalOpen(true)}
        onRegisterClick={() => setRegisterModalOpen(true)}
        onLogoClick={() => setPage(currentUser ? Page.DASHBOARD : Page.HOME)}
      />
      <main>
        {renderPage()}
      </main>

      <Modal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} title="ログイン">
          <LoginForm onLogin={handleLogin} />
      </Modal>
      <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} title="新規登録">
          <RegisterForm onRegister={handleRegister} />
      </Modal>

      {/* Notification Toasts */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {notifications.map(notification => (
            <Toast key={notification.id} notification={notification} onClose={removeNotification} />
          ))}
        </div>
      </div>
    </div>
  )
  


}