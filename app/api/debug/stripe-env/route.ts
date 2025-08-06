import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasEssentialsPrice = !!process.env.STRIPE_PRICE_AI_BLUEPRINT_ESSENTIALS_MONTHLY;
    const hasProfessionalPrice = !!process.env.STRIPE_PRICE_AI_BLUEPRINT_PROFESSIONAL_MONTHLY;
    
    const essentialsPrice = process.env.STRIPE_PRICE_AI_BLUEPRINT_ESSENTIALS_MONTHLY;
    const professionalPrice = process.env.STRIPE_PRICE_AI_BLUEPRINT_PROFESSIONAL_MONTHLY;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.NEXT_PUBLIC_APP_URL || 
                    'https://ai-readiness-app.vercel.app';
    
    return NextResponse.json({
      hasSecretKey,
      hasEssentialsPrice,
      hasProfessionalPrice,
      essentialsPrice: essentialsPrice ? essentialsPrice.substring(0, 10) + '...' : 'undefined',
      professionalPrice: professionalPrice ? professionalPrice.substring(0, 10) + '...' : 'undefined',
      fallbackEssentials: 'price_1Rsp7LGrA5DxvwDNHgskPPpl',
      fallbackProfessional: 'price_1Rsp7MGrA5DxvwDNUNqx3Lsf',
      baseUrl,
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'undefined',
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'undefined'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Debug error', details: error }, { status: 500 });
  }
}
