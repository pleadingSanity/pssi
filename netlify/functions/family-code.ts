/**
 * FAMILY DISCOUNT CODE SYSTEM
 * 
 * Allow users to share P.S-Full.AI with family at discounted rates
 * Features:
 * - Generate unique family codes
 * - Track family members
 * - Apply discounts
 * - Shared knowledge (optional)
 * - Family dashboard
 */

interface FamilyCode {
  code: string;
  owner: string;
  createdAt: Date;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  discount: number; // percentage
  familyMembers: FamilyMember[];
  sharedKnowledge: boolean;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  relationship: string;
  active: boolean;
}

interface Pricing {
  individual: number;
  family2: number; // 2 members
  family5: number; // 5 members
  family10: number; // 10 members
}

const PRICING: Pricing = {
  individual: 19.99, // per month
  family2: 29.99,    // 25% discount per person
  family5: 59.99,    // 40% discount per person
  family10: 99.99    // 50% discount per person
};

/**
 * Generate unique family code
 */
function generateFamilyCode(userId: string): string {
  const prefix = 'PSFULL';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const userCode = userId.substring(0, 4).toUpperCase();
  return `${prefix}-${userCode}-${random}`;
}

/**
 * Family code management
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { action, userId, code, memberInfo } = await req.json();

    switch (action) {
      case 'generate': {
        // Generate new family code
        const familyCode: FamilyCode = {
          code: generateFamilyCode(userId),
          owner: userId,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          maxUses: 10,
          currentUses: 0,
          discount: 50, // 50% off for family
          familyMembers: [],
          sharedKnowledge: true
        };

        return new Response(JSON.stringify({
          success: true,
          code: familyCode.code,
          discount: familyCode.discount,
          maxUses: familyCode.maxUses,
          pricing: {
            individual: PRICING.individual,
            withDiscount: PRICING.individual * (1 - familyCode.discount / 100),
            family2: PRICING.family2,
            family5: PRICING.family5,
            family10: PRICING.family10
          },
          message: `Family code generated! Share ${familyCode.code} with family for ${familyCode.discount}% off`,
          instructions: `
Family members can use code: ${familyCode.code}

Benefits:
✅ 50% discount on all plans
✅ Shared knowledge base (optional)
✅ Family dashboard
✅ Up to 10 family members
✅ Individual privacy maintained

Pricing:
- Individual: $${PRICING.individual}/month → $${(PRICING.individual * 0.5).toFixed(2)}/month with code
- Family (2): $${PRICING.family2}/month ($${(PRICING.family2 / 2).toFixed(2)} per person)
- Family (5): $${PRICING.family5}/month ($${(PRICING.family5 / 5).toFixed(2)} per person)
- Family (10): $${PRICING.family10}/month ($${(PRICING.family10 / 10).toFixed(2)} per person)
          `
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'validate': {
        // Validate family code
        // In production: check database
        const isValid = code && code.startsWith('PSFULL-');
        
        if (isValid) {
          return new Response(JSON.stringify({
            success: true,
            valid: true,
            discount: 50,
            message: 'Valid family code! 50% discount applied',
            pricing: {
              original: PRICING.individual,
              discounted: PRICING.individual * 0.5,
              savings: PRICING.individual * 0.5
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            valid: false,
            message: 'Invalid family code'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      case 'add_member': {
        // Add family member using code
        const member: FamilyMember = {
          id: `member_${Date.now()}`,
          name: memberInfo.name,
          email: memberInfo.email,
          joinedAt: new Date(),
          relationship: memberInfo.relationship || 'family',
          active: true
        };

        return new Response(JSON.stringify({
          success: true,
          member,
          message: `Welcome to the family! ${memberInfo.name} added successfully`,
          benefits: [
            '50% discount applied',
            'Access to shared knowledge base',
            'Family dashboard access',
            'Priority support',
            'All premium features included'
          ]
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get_family': {
        // Get family members
        return new Response(JSON.stringify({
          success: true,
          code: code,
          owner: userId,
          members: [
            {
              id: 'owner',
              name: 'You',
              email: 'owner@example.com',
              joinedAt: new Date(),
              relationship: 'owner',
              active: true
            }
          ],
          pricing: {
            currentPlan: 'individual',
            currentPrice: PRICING.individual,
            potentialSavings: {
              family2: PRICING.individual * 2 - PRICING.family2,
              family5: PRICING.individual * 5 - PRICING.family5,
              family10: PRICING.individual * 10 - PRICING.family10
            }
          },
          sharedKnowledge: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'get_pricing': {
        // Get all pricing options
        return new Response(JSON.stringify({
          success: true,
          pricing: PRICING,
          familyPlans: [
            {
              name: 'Individual',
              price: PRICING.individual,
              members: 1,
              perPerson: PRICING.individual,
              features: ['All AI features', 'Unlimited conversations', '24/7 support']
            },
            {
              name: 'Family (2)',
              price: PRICING.family2,
              members: 2,
              perPerson: PRICING.family2 / 2,
              savings: (PRICING.individual * 2 - PRICING.family2),
              discount: '25%',
              features: ['Everything in Individual', 'Shared knowledge base', 'Family dashboard']
            },
            {
              name: 'Family (5)',
              price: PRICING.family5,
              members: 5,
              perPerson: PRICING.family5 / 5,
              savings: (PRICING.individual * 5 - PRICING.family5),
              discount: '40%',
              features: ['Everything in Family (2)', 'Priority support', 'Custom AI personas']
            },
            {
              name: 'Family (10)',
              price: PRICING.family10,
              members: 10,
              perPerson: PRICING.family10 / 10,
              savings: (PRICING.individual * 10 - PRICING.family10),
              discount: '50%',
              features: ['Everything in Family (5)', 'Dedicated support', 'Advanced analytics', 'API access']
            }
          ],
          familyCodeBenefits: [
            '50% discount for all family members',
            'Shared knowledge base (optional)',
            'Family dashboard',
            'Individual privacy maintained',
            'Up to 10 family members',
            'Easy code sharing'
          ]
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Family code error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
