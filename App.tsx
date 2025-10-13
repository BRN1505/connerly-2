
import AuthBox from "./AuthBox";
import AdminGate from "./AdminGate";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Page, Creator, Brand, Admin, Job, JobStatus, CreatorCategory, SocialProfile, ScoutOffer, ScoutOfferStatus, SubscriptionStatus, PaymentStatus, Notification, ChatMessage, InboxNotification } from './types';
import { ADMIN_EMAIL, HIGH_FOLLOWER_THRESHOLD } from './constants';
import * as api from './api/supabaseAPI';

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
      categories: [CreatorCategory.FASHION, CreatorCategory.BEAUTY], isVerified: true },
    { id: 'c2', role: UserRole.CREATOR, name: '田中 健太', email: 'kenta.tanaka@example.com', password: 'password123',
      socials: [
        { platform: 'YouTube', followerCount: 120000, profileUrl: 'https://youtube.com/kentatanaka' }
      ],
      categories: [CreatorCategory.GAMING, CreatorCategory.DIY], isVerified: true },
    { id: 'c3', role: UserRole.CREATOR, name: '鈴木 ゆい', email: 'yui.suzuki@example.com', password: 'password123',
      socials: [
        { platform: 'TikTok', followerCount: 500000, profileUrl: 'https://tiktok.com/yuisuzuki' },
        { platform: 'Instagram', followerCount: 80000, profileUrl: 'https://instagram.com/yuisuzuki_travel' },
      ],
      categories: [CreatorCategory.FOOD, CreatorCategory.TRAVEL, 'ペット'], isVerified: true },
];

const initialBrands: Brand[] = [
    { id: 'b1', role: UserRole.BRAND, name: 'NextWear Apparel', email: 'contact@nextwear.com', password: 'password123', subscriptionStatus: 'active', isVerified: true },
    { id: 'b2', role: UserRole.BRAND, name: 'Gourmet Box Japan', email: 'support@gourmetbox.jp', password: 'password123', subscriptionStatus: 'inactive', isVerified: true },
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

const initialInboxNotifications: InboxNotification[] = [];


const adminUser: Admin = { id: 'admin1', role: UserRole.ADMIN, name: '管理者', email: "connerly.0811@gmail.com", password: 'Ariel1550' };

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

// FIX: Refactored to a named interface for props to improve type safety.
interface LoginFormProps {
    onLogin: (email: string, password: string) => void;
}
function LoginForm({ onLogin }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }} className="space-y-4">
            <div>
                <AuthBox />

<AdminGate>
  <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd" }}>
    <h2>管理者タブ</h2>
    <p>ここに管理者専用の操作を置く。</p>
  </section>
</AdminGate>

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

// FIX: Refactored to a named interface for props to improve type safety.
interface RegisterFormProps {
    onRegister: (data: any, role: UserRole) => void;
}

function RegisterForm({ onRegister }: RegisterFormProps) {
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
    
    // FIX: Updated handleSocialChange to be type-safe and prevent assignment errors.
    const handleSocialChange = (index: number, field: keyof SocialProfile, value: string | number) => {
        const newSocials = socials.map((social, i) => {
            if (i === index) {
                const updatedSocial = { ...social };
                if (field === 'followerCount') {
                    updatedSocial.followerCount = typeof value === 'number' ? value : Number(value) || 0;
                } else if (field === 'platform') {
                    updatedSocial.platform = String(value);
                } else if (field === 'profileUrl') {
                    updatedSocial.profileUrl = String(value);
                }
                return updatedSocial;
            }
            return social;
        });
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
  const [inboxNotifications, setInboxNotifications] = useState<InboxNotification[]>(() => loadStateFromLocalStorage('connerly_inboxNotifications', initialInboxNotifications, dateReviver));
  
  const [verificationTokens, setVerificationTokens] = useState<Record<string, string>>(() => loadStateFromLocalStorage('connerly_tokens', {}));
// Supabaseからデータを読み込む
useEffect(() => {
  async function loadData() {
    try {
      const [creatorsData, brandsData, jobsData, scoutOffersData, chatData, notificationsData] = await Promise.all([
        api.getAllCreators(),
        api.getAllBrands(),
        api.getAllJobs(),
        api.getAllScoutOffers(),
        api.getAllChatMessages(),
        api.getAllNotifications()
      ]);

      setCreators(creatorsData);
      setBrands(brandsData);
      setJobs(jobsData);
      setScoutOffers(scoutOffersData);
      setChatMessages(chatData);
      setInboxNotifications(notificationsData);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  }

  loadData();
}, []);

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showVerificationMessageFor, setShowVerificationMessageFor] = useState<string | null>(null);

  useEffect(() => {
    try {
        localStorage.setItem('connerly_creators', JSON.stringify(creators));
        localStorage.setItem('connerly_brands', JSON.stringify(brands));
        localStorage.setItem('connerly_jobs', JSON.stringify(jobs));
        localStorage.setItem('connerly_scoutOffers', JSON.stringify(scoutOffers));
        localStorage.setItem('connerly_chatMessages', JSON.stringify(chatMessages));
        localStorage.setItem('connerly_inboxNotifications', JSON.stringify(inboxNotifications));
        localStorage.setItem('connerly_tokens', JSON.stringify(verificationTokens));
    } catch(e) {
        console.error("Failed to save state to localStorage", e);
    }
  }, [creators, brands, jobs, scoutOffers, chatMessages, inboxNotifications, verificationTokens]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'success') => {
    const id = `notif-${Date.now()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const handleVerifyEmail = useCallback((token: string) => {
    const userId = verificationTokens[token];
    if (!userId) {
        addNotification('無効な認証トークンです。', 'error');
        return;
    }

    let userToVerify: User | undefined;
    
    const updatedCreators = creators.map(c => {
        if (c.id === userId) {
            userToVerify = { ...c, isVerified: true };
            return userToVerify as Creator;
        }
        return c;
    });
    
    if(userToVerify) {
        setCreators(updatedCreators);
    } else {
        const updatedBrands = brands.map(b => {
            if (b.id === userId) {
                userToVerify = { ...b, isVerified: true };
                return userToVerify as Brand;
            }
            return b;
        });
        setBrands(updatedBrands);
    }
    
    if (userToVerify) {
        setCurrentUser(userToVerify);
        setPage(Page.DASHBOARD);
        addNotification('メールアドレスが認証されました！', 'success');
        
        const newTokens = { ...verificationTokens };
        delete newTokens[token];
        setVerificationTokens(newTokens);
    } else {
        addNotification('認証対象のユーザーが見つかりませんでした。', 'error');
    }
}, [verificationTokens, creators, brands, addNotification]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('verify_token');
    if (token) {
        handleVerifyEmail(token);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleVerifyEmail]);


  const handleLogin = async (email: string, password: string) => {
  try {
    const foundUser = await api.loginUser(email, password);
    
    if ('isVerified' in foundUser && !foundUser.isVerified) {
      alert('アカウントがまだ有効化されていません。登録時に送信されたメールを確認してください。');
      return;
    }
    
    setCurrentUser(foundUser);
    setPage(Page.DASHBOARD);
    setLoginModalOpen(false);
  } catch (error) {
    console.error('ログインエラー:', error);
    alert('メールアドレスまたはパスワードが正しくありません。');
  }
};

const handleRegister = async (data: any, role: UserRole) => {
  try {
    const existingUser = [...creators, ...brands].find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      alert('このメールアドレスは既に使用されています。');
      return;
    }

    const newUser = await api.registerUser(data, role);
    
    // ローカルstateも更新
    if (role === UserRole.CREATOR) {
      const creatorWithDetails = {
        ...newUser,
        socials: data.socials || [],
        categories: data.categories || []
      };
      setCreators(prev => [...prev, creatorWithDetails]);
    } else {
      setBrands(prev => [...prev, newUser]);
    }

    setRegisterModalOpen(false);
    setShowVerificationMessageFor(newUser.email);
  } catch (error) {
    console.error('登録エラー:', error);
    alert('登録に失敗しました。');
  }

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

    const qualifiedCreators = creators.filter(creator => {
        const totalFollowers = creator.socials.reduce((sum, social) => sum + social.followerCount, 0);
        return totalFollowers >= HIGH_FOLLOWER_THRESHOLD;
    });

    if (qualifiedCreators.length > 0) {
        const newNotificationsForCreators: InboxNotification[] = qualifiedCreators.map(creator => ({
            id: `in-${Date.now()}-${creator.id}`,
            userId: creator.id,
            message: `新着案件: ${newJob.brandName}が「${newJob.title}」を投稿しました。`,
            isRead: false,
            createdAt: new Date(),
        }));
        setInboxNotifications(prev => [...prev, ...newNotificationsForCreators]);
        addNotification(`案件を投稿し、${qualifiedCreators.length}名のクリエイターに通知しました。`, 'success');
    } else {
        addNotification(`案件を投稿しました。`, 'success');
    }
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
  
  const handleMarkAllAsRead = useCallback(() => {
    if (!currentUser) return;
    setInboxNotifications(prev =>
        prev.map(n =>
            n.userId === currentUser.id && !n.isRead ? { ...n, isRead: true } : n
        )
    );
  }, [currentUser]);

  const userInboxNotifications = useMemo(() => {
    if (!currentUser) return [];
    return inboxNotifications
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [inboxNotifications, currentUser]);


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
            return <HomePage onRegisterClick={() => setRegisterModalOpen(true)} onGuestViewClick={() => setPage(Page.GUEST)} onLoginClick={() => setLoginModalOpen(true)} />;
        case Page.DASHBOARD:
            return renderDashboard();
        case Page.GUEST:
            return <CreatorDashboard jobs={jobs} onLoginClick={() => setLoginModalOpen(true)} chatMessages={chatMessages} handleSendMessage={() => {}} />;
        default:
            return <HomePage onRegisterClick={() => setRegisterModalOpen(true)} onGuestViewClick={() => setPage(Page.GUEST)} onLoginClick={() => setLoginModalOpen(true)} />;
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
        notifications={userInboxNotifications}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
      <main>
        {renderPage()}
      </main>

      {/* FIX: Added children to the Modal component as it is a required prop. */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} title="ログイン">
          <LoginForm onLogin={handleLogin} />
      </Modal>
      {/* FIX: Added children to the Modal component as it is a required prop. */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} title="新規登録">
          <RegisterForm onRegister={handleRegister} />
      </Modal>

      {/* FIX: Added children to the Modal component as it is a required prop. */}
      <Modal isOpen={!!showVerificationMessageFor} onClose={() => setShowVerificationMessageFor(null)} title="メールを確認してください">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">ご登録ありがとうございます！</h3>
            <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">{showVerificationMessageFor}</span> 宛に、アカウントを有効化するためのメールを送信しました。
            </p>
            <p className="mt-1 text-sm text-gray-600">
                メール内のリンクをクリックして、登録を完了してください。
            </p>
            <p className="mt-4 text-xs text-gray-500">
                (このデモでは、実際のメールは送信されません。開発者コンソールで認証リンクを確認してください。)
            </p>
            <button
                onClick={() => setShowVerificationMessageFor(null)}
                className="mt-6 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                閉じる
            </button>
          </div>
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
