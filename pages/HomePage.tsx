
import React from 'react';

interface HomePageProps {
  onRegisterClick: () => void;
  onGuestViewClick: () => void;
}

function CheckIcon() {
    return (
      <svg className="h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
}

function HomePage({ onRegisterClick, onGuestViewClick }: HomePageProps) {
  return (
    <div className="bg-white">
      <main>
        {/* Hero section */}
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-50" />
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <img
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                  alt="People working on laptops"
                />
                <div className="absolute inset-0 bg-indigo-700 mix-blend-multiply" />
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">才能が、ビジネスになる。</span>
                  <span className="block text-indigo-200">クリエイターとブランドの出会いの場</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-indigo-100 sm:max-w-3xl">
                  connerlyは、新しい才能を探すブランドと、活躍の場を求めるクリエイターを繋ぐプラットフォームです。
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                   <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <button
                      onClick={onRegisterClick}
                      className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 sm:px-8"
                    >
                      今すぐに始める
                    </button>
                     <button
                        onClick={onGuestViewClick}
                        className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 sm:px-8"
                    >
                      お試しで見てみる
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-extrabold text-center text-gray-900">connerlyの仕組み</h2>
                <div className="mt-12 grid gap-16 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
                    {/* For Creators */}
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900">クリエイターの方へ</h3>
                        <p className="mt-3 text-lg text-gray-500">あなたの才能を求めているブランドがここにいます。</p>
                        <dl className="mt-8 space-y-5">
                            <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">無料登録：</span>プロフィールを登録して、あなたのスキルや世界観をアピール。</dd>
                            </div>
                            <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">案件を探す：</span>様々なジャンルのブランド案件から、あなたにピッタリの仕事を発見。</dd>
                            </div>
                             <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">簡単応募：</span>気になる案件にワンクリックで応募。ブランドからの連絡を待つだけ。</dd>
                            </div>
                        </dl>
                    </div>
                    {/* For Brands */}
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-900">ブランドの方へ</h3>
                        <p className="mt-3 text-lg text-gray-500">あなたのブランドに最適なクリエイターを見つけましょう。</p>
                        <dl className="mt-8 space-y-5">
                            <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">簡単案件投稿：</span>テンプレートを使って、PR案件を簡単に作成・投稿。（月額20,000円）</dd>
                            </div>
                            <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">クリエイター選定：</span>応募してきたクリエイターのプロフィールを確認し、最適な人材を選定。</dd>
                            </div>
                             <div className="relative flex items-start">
                                <dt><CheckIcon /></dt>
                                <dd className="ml-3 text-base text-gray-500"><span className="font-semibold text-gray-700">コラボ実現：</span>クリエイターと直接コミュニケーションを取り、コラボレーションを実現。</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;