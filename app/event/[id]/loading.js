export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12">
            <div className="animate-pulse">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-20 bg-white/20 rounded-full"></div>
                    <div className="h-6 w-16 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="h-10 w-3/4 bg-white/20 rounded mb-3"></div>
                  <div className="h-6 w-1/2 bg-white/20 rounded mb-4"></div>
                  <div className="flex flex-wrap gap-4">
                    <div className="h-4 w-32 bg-white/20 rounded"></div>
                    <div className="h-4 w-24 bg-white/20 rounded"></div>
                    <div className="h-4 w-40 bg-white/20 rounded"></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="h-12 w-20 bg-white/20 rounded"></div>
                  <div className="h-6 w-16 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-8">
                    <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-gray-300 rounded"></div>
                      <div className="h-4 w-full bg-gray-300 rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="h-4 w-20 bg-gray-300 rounded"></div>
                          <div className="h-4 w-32 bg-gray-300 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-16 bg-gray-300 rounded"></div>
                          <div className="h-4 w-28 bg-gray-300 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-gray-300 rounded"></div>
                          <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-18 bg-gray-300 rounded"></div>
                          <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-6">
                      <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <div className="h-4 w-20 bg-gray-300 rounded"></div>
                          <div className="h-4 w-10 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="h-3 bg-gray-300 rounded-full w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-3 w-32 bg-gray-300 rounded"></div>
                    </div>

                    <div className="mb-4">
                      <div className="h-12 w-full bg-gray-300 rounded-lg"></div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="w-5 h-5 bg-blue-300 rounded mr-3 mt-0.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-blue-300 rounded mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-3 w-full bg-blue-300 rounded"></div>
                            <div className="h-3 w-3/4 bg-blue-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}