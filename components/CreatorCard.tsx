
import React from 'react';
import { Creator } from '../types';
import Tag from './Tag';

interface CreatorCardProps {
    creator: Creator;
    onScout: (creator: Creator) => void;
}

function CreatorCard({ creator, onScout }: CreatorCardProps) {
    const totalFollowers = creator.socials.reduce((acc, social) => acc + social.followerCount, 0);

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
            <div className="p-6 flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{creator.name}</h3>
                        <p className="mt-1 text-sm font-medium text-gray-600">
                            総フォロワー数: <span className="font-bold">{totalFollowers.toLocaleString()}</span>人
                        </p>
                    </div>
                </div>
                
                <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">活動カテゴリ</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {creator.categories.map(cat => (
                            <Tag key={cat} color="bg-gray-200 text-gray-700">{cat}</Tag>
                        ))}
                        {creator.categories.length === 0 && <p className="text-sm text-gray-500">カテゴリ未設定</p>}
                    </div>
                </div>

                <div className="mt-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SNSアカウント</h4>
                    <div className="mt-2 space-y-3">
                        {creator.socials.map((social, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                <span className="font-medium text-gray-800 flex-1 truncate">{social.platform}</span>
                                <span className="text-gray-600 flex-shrink-0">{social.followerCount.toLocaleString()} フォロワー</span>
                                <a 
                                    href={social.profileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200 flex-shrink-0"
                                >
                                    見る →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
                <button
                    onClick={() => onScout(creator)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-1.42 2.882a1 1 0 01-.753.547l-3.19.464a1 1 0 00-.554 1.705l2.308 2.25a1 1 0 01.287.884l-.545 3.178a1 1 0 001.451 1.054l2.852-1.5a1 1 0 01.93 0l2.852 1.5a1 1 0 001.451-1.054l-.545-3.178a1 1 0 01.287-.884l2.308-2.25a1 1 0 00-.554-1.705l-3.19-.464a1 1 0 01-.753-.547l-1.42-2.882z" />
                    </svg>
                    スカウトする
                </button>
            </div>
        </div>
    );
}

export default CreatorCard;