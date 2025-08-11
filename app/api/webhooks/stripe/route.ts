import { NextRequest, NextResponse } from 'next/server'
import { 
  createInstitution, 
  createBlankInstitution, 
  getInstitution,
  initializeImplementationPhases,
  addTasksToPhase,
  addDeliverabelsToPhase,
  HIGHER_ED_ASSESSMENT_TASKS,
  HIGHER_ED_ASSESSMENT_DELIVERABLES,
  logWebhookReceived,
  logError
} from '@/lib/database'
import { InstitutionSegment } from '@prisma/client'

interface StripeWebhookEvent {
  type: string
  data: {
    object: {
      id: string
      customer?: string
      metadata?: {
        institution_id?: string
        segment?: string
        contact_email?: string
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StripeWebhookEvent
    
    // Log webhook received
    await logWebhookReceived(body.type, body.data.object.metadata?.institution_id, body)
    
    console.log('Webhook received:', body.type)
    
    switch (body.type) {
      case 'checkout.session.completed':
        return await handleCheckoutCompleted(body)
      
      case 'customer.subscription.created':
        return await handleSubscriptionCreated(body)
      
      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(body)
      
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(body)
        
      case 'customer.subscription.deleted':
        return await handleSubscriptionCanceled(body)
      
      default:
        console.log(`Unhandled webhook type: ${body.type}`)
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    await logError(`Webhook processing error: ${error}`, undefined, undefined, { webhookBody: request.body })
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(event: StripeWebhookEvent) {
  try {
    const session = event.data.object
    const metadata = session.metadata || {}
    
    if (!metadata.institution_id || !metadata.segment) {
      throw new Error('Missing required metadata: institution_id or segment')
    }
    
    // Check if institution already exists
    let institution = await getInstitution(metadata.institution_id)
    
    if (!institution) {
      // Create new institution
      const segment = metadata.segment.toUpperCase() as InstitutionSegment
      const newInstitution = await createBlankInstitution(
        metadata.institution_id,
        segment
      )
      
      console.log(`Created institution: ${newInstitution.id} for segment: ${segment}`)
      
      // Initialize implementation phases
      const phases = await initializeImplementationPhases(newInstitution.id, segment)
      console.log(`Initialized ${phases.length} phases for institution ${newInstitution.id}`)
      
      // Add standard tasks to first phase if it's Higher Ed
      if (segment === InstitutionSegment.HIGHER_ED && phases.length > 0) {
        const assessmentPhase = phases[0]
        await addTasksToPhase(assessmentPhase.id, HIGHER_ED_ASSESSMENT_TASKS)
        await addDeliverabelsToPhase(assessmentPhase.id, HIGHER_ED_ASSESSMENT_DELIVERABLES)
        console.log(`Added standard tasks and deliverables to assessment phase`)
      }
      
      // Re-fetch the institution with full relations for consistent return
      institution = await getInstitution(newInstitution.id)
    }
    
    if (!institution) {
      throw new Error('Failed to create or retrieve institution')
    }
    
    // If contact email provided, we could send welcome email here
    if (metadata.contact_email) {
      console.log(`Contact email for institution ${institution.id}: ${metadata.contact_email}`)
      // TODO: Send welcome email without password (use password reset flow instead)
    }
    
    return NextResponse.json({ 
      success: true, 
      institutionId: institution.id,
      message: 'Institution setup completed'
    })
    
  } catch (error) {
    console.error('Error handling checkout completion:', error)
    await logError(`Checkout completion error: ${error}`, undefined, event.data.object.metadata?.institution_id)
    throw error
  }
}

async function handleSubscriptionCreated(event: StripeWebhookEvent) {
  try {
    const subscription = event.data.object
    console.log(`Subscription created: ${subscription.id}`)
    
    // Could update institution subscription tier here
    if (subscription.metadata?.institution_id) {
      const institution = await getInstitution(subscription.metadata.institution_id)
      if (institution) {
        console.log(`Subscription activated for institution: ${institution.name || institution.id}`)
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling subscription creation:', error)
    await logError(`Subscription creation error: ${error}`)
    throw error
  }
}

async function handlePaymentSucceeded(event: StripeWebhookEvent) {
  try {
    const invoice = event.data.object
    console.log(`Payment succeeded for invoice: ${invoice.id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling payment success:', error)
    await logError(`Payment success error: ${error}`)
    throw error
  }
}

async function handleSubscriptionUpdated(event: StripeWebhookEvent) {
  try {
    const subscription = event.data.object
    console.log(`Subscription updated: ${subscription.id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling subscription update:', error)
    await logError(`Subscription update error: ${error}`)
    throw error
  }
}

async function handleSubscriptionCanceled(event: StripeWebhookEvent) {
  try {
    const subscription = event.data.object
    console.log(`Subscription canceled: ${subscription.id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    await logError(`Subscription cancellation error: ${error}`)
    throw error
  }
}
