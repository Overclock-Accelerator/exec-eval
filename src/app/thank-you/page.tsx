import { Wordmark } from '@/components/Brand'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen dot-grid flex flex-col">
      <div className="px-6 py-5">
        <Wordmark />
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="text-center max-w-sm" style={{ animation: 'fade-up 0.5s ease both' }}>
          <div className="w-14 h-14 rounded-full border-2 border-teal flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-3">You&rsquo;re in.</h1>
          <p className="text-mute leading-relaxed">
            Your responses are recorded. Hang tight — we&rsquo;ll reveal where the
            room lands together.
          </p>
        </div>
      </div>
    </div>
  )
}
