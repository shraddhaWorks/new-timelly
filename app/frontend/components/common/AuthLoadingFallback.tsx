"use client";

export default function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Verifying Access</h2>
        <p className="text-gray-400">Checking your authentication status...</p>
      </div>
    </div>
  );
}
