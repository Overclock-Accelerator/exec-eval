'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Wordmark } from '@/components/Brand'

export default function QrPage() {
  const [url, setUrl] = useState('https://exec-eval.vercel.app')

  useEffect(() => {
    // Link to the survey root of wherever this is deployed.
    setUrl(window.location.origin + '/')
  }, [])

  return (
    <div className="min-h-screen dot-grid flex flex-col">
      <div className="px-6 py-5">
        <Wordmark />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-amber mb-4">
          AI Readiness Check
        </p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-10">
          Scan to <span className="text-teal">begin</span>
        </h1>

        <div className="bg-white p-6 rounded-2xl">
          <QRCodeSVG value={url} size={300} level="M" marginSize={0} />
        </div>

        <p className="mt-8 text-mute text-sm">
          or visit{' '}
          <span className="text-white font-medium">{url.replace(/^https?:\/\//, '')}</span>
        </p>
      </div>
    </div>
  )
}
