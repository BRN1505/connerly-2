import { Job } from '../types';
import Modal from './Modal';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  isApplied?: boolean;
}

export default function JobDetailModal({ job, isOpen, onClose, onApply, isApplied }: JobDetailModalProps) {
  if (!job) return null;

  const isClosed = job.status === '募集終了';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="案件の詳細">
      <div className="space-y-6">
        {/* 案件タイトル */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <p className="text-sm text-gray-500 mt-1">投稿: {job.brandName}</p>
        </div>

        {/* ステータスバッジ */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            job.status === '募集中' ? 'bg-green-100 text-green-800' :
            job.status === '進行中' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {job.status}
          </span>
          {isApplied && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              応募済み
            </span>
          )}
        </div>

        {/* 報酬 */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">報酬</span>
            <span className="text-2xl font-bold text-indigo-600">
              ¥{job.payment.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 募集人数 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">募集人数</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {job.numberOfCreators}名
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500">現在の応募数</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {job.applicants?.length || 0}名
            </p>
          </div>
        </div>

        {/* 案件詳細 */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">案件内容</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        {/* 投稿日 */}
        <div className="text-sm text-gray-500">
          投稿日: {new Date(job.createdAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            閉じる
          </button>
          {onApply && (
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              disabled={isApplied || isClosed}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                isApplied || isClosed
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isApplied ? '応募済み' : isClosed ? '募集終了' : '応募する'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
