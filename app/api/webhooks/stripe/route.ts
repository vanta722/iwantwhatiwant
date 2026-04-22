import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { awardTokens } from '@/lib/tokens'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder')
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe/webhook] Invalid signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { parentId, kidId, tokensToGrant } = session.metadata ?? {}

    if (!parentId) return NextResponse.json({ received: true })

    const tokens = tokensToGrant ? parseInt(tokensToGrant, 10) : 0

    await prisma.purchase.updateMany({
      where: { stripeSessionId: session.id },
      data: { status: 'COMPLETED', tokensGranted: tokens },
    })

    if (kidId && tokens > 0) {
      await awardTokens({
        kidId,
        amount: tokens,
        type: 'TOKEN_PURCHASE',
        description: `Purchased ${tokens} tokens`,
      })
    }
  }

  return NextResponse.json({ received: true })
}
