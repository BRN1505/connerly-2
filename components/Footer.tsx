export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            © 2025 Connerly. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a 
              href="https://connerlyapp.com/legal.html" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              特定商取引法に基づく表記
            </a>
            <a 
              href="mailto:connerly.0811@gmail.com"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}