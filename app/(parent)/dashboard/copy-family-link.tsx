'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export function CopyFamilyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="sm" className="gap-2" onClick={copy}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copied!' : 'Copy Link'}
    </Button>
  )
}
