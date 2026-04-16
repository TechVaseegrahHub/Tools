export const SUBSCRIPTION_PLANS = {
    FREE: {
        name: 'Free',
        label: 'Free Plan',
        priceMonthly: 0,
        priceYearly: 0,
        toolLimit: 5,
        visibility: 'normal',
        features: [
            'List up to 5 tools',
            'Normal visibility in search',
            'Basic equipment management',
            'Standard filters'
        ],
        premiumFeatures: false
    },
    BASIC: {
        name: 'Basic',
        label: 'Basic Plan',
        priceMonthly: 49,
        priceYearly: 499,
        toolLimit: 25,
        visibility: 'priority',
        features: [
            'List up to 25 tools',
            'Priority listing in search',
            'Basic analytics (views)',
            'Advanced filters access',
            'Priority email support'
        ],
        premiumFeatures: true
    },
    PRO: {
        name: 'Pro',
        label: 'Pro Plan',
        priceMonthly: 99,
        priceYearly: 999,
        toolLimit: Infinity,
        visibility: 'highlighted',
        features: [
            'Unlimited tool listings',
            'Highlighted & High ranking search results',
            'Full analytics dashboard',
            'Access to premium filters',
            'Dedicated account manager',
            'Export reports to CSV/PDF'
        ],
        premiumFeatures: true
    }
};

export const getPlanDetails = (planName) => {
    const normalized = planName?.toUpperCase() || 'FREE';
    if (['PREMIUM', 'FREE_PREMIUM'].includes(normalized)) {
        return SUBSCRIPTION_PLANS.PRO;
    }
    return SUBSCRIPTION_PLANS[normalized] || SUBSCRIPTION_PLANS.FREE;
};
