
import React from 'react';
import { Creator, Brand, Job, SubscriptionStatus } from '../types';
import { BRAND_MONTHLY_FEE } from '../constants';
import Tag from '../components/Tag';

interface AdminDashboardProps {
  creators: Creator[];
  brands: Brand[];
  jobs: Job[];
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="bg-indigo-100 rounded-full p-3">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function UserIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
}
function BuildingIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
}
function CashIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
}
function TrendingDownIcon() {
    return (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>);
}

function AdminDashboard({ creators, brands, jobs }: AdminDashboardProps) {
  const activeBrands = brands.filter(b => b.subscriptionStatus === 'active');
  const totalIncome = activeBrands.length * BRAND_MONTHLY_FEE;
  
  const creatorPayouts = jobs
    .filter(j => j.paymentStatus === 'paid')
    .reduce((acc, job) => acc + (job.payment * job.selectedCreatorIds.length), 0);
  
  const mockedExpenses = 50000; // Server costs, etc.
  const totalExpenses = mockedExpenses + creatorPayouts; 
  const netProfit = totalIncome - totalExpenses;
  const currencyFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

  const getSubscriptionStatusTag = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        // FIX: Added children to the Tag component as it is a required prop.
        return <Tag color="bg-green-100 text-green-800">契約中</Tag>;
      case 'inactive':
        // FIX: Added children to the Tag component as it is a required prop.
        return <Tag color="bg-gray-100 text-gray-800">未契約</Tag>;
      default:
        // FIX: Added children to the Tag component as it is a required prop.
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">管理者ダッシュボード</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="登録クリエイター数" value={creators.length} icon={<UserIcon />} />
        <StatCard title="契約中ブランド数" value={`${activeBrands.length} / ${brands.length}`} icon={<BuildingIcon />} />
        <StatCard title="月間収入" value={currencyFormatter.format(totalIncome)} icon={<CashIcon />} />
        <StatCard title="月間支出" value={currencyFormatter.format(totalExpenses)} icon={<TrendingDownIcon />} />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <h3 className="text-xl font-semibold text-gray-800">月間純利益</h3>
        <p className={`text-4xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currencyFormatter.format(netProfit)}
        </p>
         <p className="text-sm text-gray-500 mt-2">
            (収入: {currencyFormatter.format(totalIncome)} - 支出: {currencyFormatter.format(totalExpenses)})
        </p>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Creators Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">登録クリエイター一覧</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">名前</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">SNS &amp; フォロワー</th>
                </tr>
              </thead>
              <tbody>
                {creators.map(c => (
                  <tr key={c.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                    <td className="px-6 py-4">{c.email}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {c.socials.map((social, index) => (
                           <div key={index} className="flex items-center text-xs">
                             <a href={social.profileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">{social.platform}</a>
                             <span className="text-gray-500 ml-2">({social.followerCount.toLocaleString()})</span>
                           </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brands Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">登録ブランド一覧</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">ブランド名</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">契約状況</th>
                </tr>
              </thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b.id} className="bg-white border-b">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{b.name}</td>
                    <td className="px-6 py-4">{b.email}</td>
                    <td className="px-6 py-4">{getSubscriptionStatusTag(b.subscriptionStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;