export default function Footer() {
  const now = new Date();
  return (
    <footer className="bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-gray-400 text-sm text-center">
              © {now.getFullYear()} LockIn. All rights reserved. Built on Ethereum.
            </p>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Powered by</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                <span className="text-xs font-medium text-gray-500">Ethereum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}