import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center">
        <div className="text-5xl mb-2">🌟</div>
        <h1 className="font-fredoka font-bold text-3xl text-white">Parent Sign In</h1>
        <p className="font-fredoka text-white/70 mt-1">Welcome back, hero parent!</p>
      </div>
      <SignIn />
    </main>
  )
}
