import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center">
        <div className="text-5xl mb-2">🚀</div>
        <h1 className="font-fredoka font-bold text-3xl text-white">Create Your Account</h1>
        <p className="font-fredoka text-white/70 mt-1">Start your kid&apos;s learning adventure!</p>
      </div>
      <SignUp />
    </main>
  )
}
