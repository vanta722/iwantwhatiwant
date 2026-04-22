'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { AVATAR_COLORS, AVATAR_EYES } from '@/types'
import type { AvatarConfig } from '@/types'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Step = 'name' | 'age' | 'avatar' | 'pin' | 'confirm'

const INITIAL_AVATAR: AvatarConfig = {
  baseColor: 'purple',
  eyeType: 'happy',
  accessory: null,
  pet: null,
}

const ACCESSORIES: Array<AvatarConfig['accessory']> = [null, 'hat', 'glasses', 'bow', 'crown']
const PETS: Array<AvatarConfig['pet']> = [null, 'cat', 'dog', 'dragon', 'unicorn', 'robot']
const PET_LABELS: Record<string, string> = { cat: '🐱', dog: '🐶', dragon: '🐲', unicorn: '🦄', robot: '🤖' }
const ACC_LABELS: Record<string, string> = { hat: '🎩', glasses: '👓', bow: '🎀', crown: '👑' }

export default function NewKidPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [avatar, setAvatar] = useState<AvatarConfig>(INITIAL_AVATAR)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const steps: Step[] = ['name', 'age', 'avatar', 'pin', 'confirm']
  const stepIndex = steps.indexOf(step)
  const progress = ((stepIndex + 1) / steps.length) * 100

  const canProceed = () => {
    if (step === 'name') return name.trim().length >= 2
    if (step === 'age') return typeof age === 'number' && age >= 4 && age <= 12
    if (step === 'avatar') return true
    if (step === 'pin') return pin.length === 4
    if (step === 'confirm') return pinConfirm === pin
    return false
  }

  const next = () => {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
  }

  const back = () => {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  const submit = async () => {
    if (pin !== pinConfirm) {
      setError("PINs don't match!")
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/kids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), age: Number(age), pin, avatarConfig: avatar }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-fredoka font-bold text-2xl text-gray-900">Create Kid Profile</h1>
        </div>
        <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-purple to-brand-pink rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        <p className="font-fredoka text-sm text-gray-400 mt-1">Step {stepIndex + 1} of {steps.length}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {step === 'name' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">✏️</div>
                <h2 className="font-fredoka font-semibold text-2xl text-gray-900">What&apos;s their name?</h2>
                <p className="font-fredoka text-gray-500">This is what they&apos;ll see in the app</p>
              </div>
              <Input
                placeholder="e.g. Emma, Jake, Luna..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center text-xl h-14"
                autoFocus
                maxLength={20}
              />
            </div>
          )}

          {step === 'age' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎂</div>
                <h2 className="font-fredoka font-semibold text-2xl text-gray-900">How old is {name}?</h2>
                <p className="font-fredoka text-gray-500">We use this to pick the right level</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }, (_, i) => i + 4).map((a) => (
                  <motion.button
                    key={a}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAge(a)}
                    className={`h-16 rounded-3xl font-fredoka text-2xl font-semibold transition-all ${
                      age === a
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/40'
                        : 'bg-white border-2 border-purple-100 text-gray-700 hover:border-brand-purple'
                    }`}
                  >
                    {a}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {step === 'avatar' && (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎨</div>
                <h2 className="font-fredoka font-semibold text-2xl text-gray-900">Build {name}&apos;s Avatar!</h2>
              </div>
              <div className="flex justify-center">
                <AvatarDisplay config={avatar} size="xl" animate />
              </div>
              {/* Color */}
              <div>
                <p className="font-fredoka text-sm font-medium text-gray-600 mb-2">Pick a color</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(AVATAR_COLORS).map(([color, hex]) => (
                    <motion.button
                      key={color}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setAvatar((a) => ({ ...a, baseColor: color }))}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.baseColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
              {/* Eyes */}
              <div>
                <p className="font-fredoka text-sm font-medium text-gray-600 mb-2">Pick eyes</p>
                <div className="flex gap-3 flex-wrap">
                  {(Object.keys(AVATAR_EYES) as AvatarConfig['eyeType'][]).map((type) => (
                    <motion.button
                      key={type}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setAvatar((a) => ({ ...a, eyeType: type }))}
                      className={`text-3xl w-14 h-14 rounded-2xl transition-all ${
                        avatar.eyeType === type ? 'bg-brand-purple/20 ring-2 ring-brand-purple scale-110' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {AVATAR_EYES[type]}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Accessory */}
              <div>
                <p className="font-fredoka text-sm font-medium text-gray-600 mb-2">Accessory (optional)</p>
                <div className="flex gap-3 flex-wrap">
                  {ACCESSORIES.map((acc) => (
                    <motion.button
                      key={String(acc)}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setAvatar((a) => ({ ...a, accessory: acc }))}
                      className={`text-2xl w-12 h-12 rounded-2xl transition-all ${
                        avatar.accessory === acc ? 'bg-brand-purple/20 ring-2 ring-brand-purple' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {acc ? ACC_LABELS[acc] : '❌'}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Pet */}
              <div>
                <p className="font-fredoka text-sm font-medium text-gray-600 mb-2">Pet buddy (optional)</p>
                <div className="flex gap-3 flex-wrap">
                  {PETS.map((pet) => (
                    <motion.button
                      key={String(pet)}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setAvatar((a) => ({ ...a, pet }))}
                      className={`text-2xl w-12 h-12 rounded-2xl transition-all ${
                        avatar.pet === pet ? 'bg-brand-purple/20 ring-2 ring-brand-purple' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pet ? PET_LABELS[pet] : '❌'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🔒</div>
                <h2 className="font-fredoka font-semibold text-2xl text-gray-900">Create {name}&apos;s PIN</h2>
                <p className="font-fredoka text-gray-500">{name} will use this to log in</p>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-3xl tracking-[0.5em] h-16"
              />
              <p className="font-fredoka text-xs text-gray-400 text-center">
                Choose 4 numbers {name} can remember
              </p>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">✅</div>
                <h2 className="font-fredoka font-semibold text-2xl text-gray-900">Confirm PIN</h2>
                <p className="font-fredoka text-gray-500">Type the PIN one more time</p>
              </div>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN again"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="text-center text-3xl tracking-[0.5em] h-16"
              />
              {error && <p className="text-red-500 font-fredoka text-sm text-center">{error}</p>}

              {/* Preview */}
              <div className="bg-gradient-to-br from-brand-purple to-brand-blue rounded-4xl p-5 text-white mt-4">
                <div className="flex items-center gap-4">
                  <AvatarDisplay config={avatar} size="lg" />
                  <div>
                    <h3 className="font-fredoka font-bold text-2xl">{name}</h3>
                    <p className="font-fredoka text-white/70">Age {age}</p>
                    <p className="font-fredoka text-white/70 text-sm">0 🪙 tokens to start</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {stepIndex > 0 && (
          <Button variant="outline" size="lg" onClick={back} className="flex-1">
            <ArrowLeft size={18} />
            Back
          </Button>
        )}
        {step !== 'confirm' ? (
          <Button
            variant="purple"
            size="lg"
            onClick={next}
            disabled={!canProceed()}
            className="flex-1"
          >
            Next
            <ArrowRight size={18} />
          </Button>
        ) : (
          <Button
            variant="green"
            size="lg"
            onClick={submit}
            disabled={loading || pinConfirm !== pin}
            className="flex-1"
          >
            {loading ? '✨ Creating...' : (
              <>
                <Check size={18} />
                Create Profile!
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
