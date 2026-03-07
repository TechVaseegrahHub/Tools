import Organization from '../models/organization.model.js';
import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    List all organizations with summary counts + subscription info
// @route   GET /api/superadmin/orgs
// @access  SuperAdmin only
export const listOrgs = async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ createdAt: -1 });

        const orgsWithStats = await Promise.all(
            orgs.map(async (org) => {
                const [userCount, toolCount, transactionCount] = await Promise.all([
                    User.countDocuments({ orgId: org._id }),
                    Tool.countDocuments({ orgId: org._id }),
                    Transaction.countDocuments({ orgId: org._id }),
                ]);
                return {
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    isActive: org.isActive,
                    createdAt: org.createdAt,
                    subscriptionPlan: org.subscriptionPlan,
                    subscriptionStatus: org.subscriptionStatus,
                    currentPeriodEnd: org.currentPeriodEnd,
                    razorpaySubscriptionId: org.razorpaySubscriptionId,
                    stats: { users: userCount, tools: toolCount, transactions: transactionCount },
                };
            })
        );

        res.json(orgsWithStats);
    } catch (error) {
        console.error('Error in listOrgs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get aggregated subscription stats across all orgs
// @route   GET /api/superadmin/subscriptions
// @access  SuperAdmin only
export const getSubscriptionStats = async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ createdAt: -1 });

        const orgsWithStats = await Promise.all(
            orgs.map(async (org) => {
                const [userCount, toolCount, transactionCount] = await Promise.all([
                    User.countDocuments({ orgId: org._id }),
                    Tool.countDocuments({ orgId: org._id }),
                    Transaction.countDocuments({ orgId: org._id }),
                ]);
                return {
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    isActive: org.isActive,
                    createdAt: org.createdAt,
                    subscriptionPlan: org.subscriptionPlan || 'free',
                    subscriptionStatus: org.subscriptionStatus || 'active',
                    currentPeriodEnd: org.currentPeriodEnd,
                    razorpaySubscriptionId: org.razorpaySubscriptionId,
                    stats: { users: userCount, tools: toolCount, transactions: transactionCount },
                };
            })
        );

        const premiumCount = orgsWithStats.filter(o => o.subscriptionPlan === 'premium').length;
        const freeCount = orgsWithStats.filter(o => o.subscriptionPlan !== 'premium').length;

        res.json({
            summary: {
                total: orgsWithStats.length,
                premium: premiumCount,
                free: freeCount,
            },
            orgs: orgsWithStats,
        });
    } catch (error) {
        console.error('Error in getSubscriptionStats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a specific org's summary
// @route   GET /api/superadmin/orgs/:orgId
// @access  SuperAdmin only
export const getOrgDetails = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        const [users, toolCount, transactionCount] = await Promise.all([
            User.find({ orgId: org._id }).select('name email role createdAt'),
            Tool.countDocuments({ orgId: org._id }),
            Transaction.countDocuments({ orgId: org._id }),
        ]);

        res.json({
            org,
            stats: { users: users.length, tools: toolCount, transactions: transactionCount },
            userList: users,
        });
    } catch (error) {
        console.error('Error in getOrgDetails:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle org active status
// @route   PUT /api/superadmin/orgs/:orgId/toggle
// @access  SuperAdmin only
export const toggleOrgStatus = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        org.isActive = !org.isActive;
        await org.save();

        res.json({ message: `Organization ${org.isActive ? 'activated' : 'deactivated'}`, isActive: org.isActive });
    } catch (error) {
        console.error('Error in toggleOrgStatus:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset a user's password (SuperAdmin force-reset)
// @route   PUT /api/superadmin/users/:userId/reset-password
// @access  SuperAdmin only
export const resetUserPassword = async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = newPassword;
        await user.save();

        res.json({ message: `Password reset for ${user.name} (${user.email})` });
    } catch (error) {
        console.error('Error in resetUserPassword:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get finance stats — real revenue from Razorpay payments + client onboarding
// @route   GET /api/superadmin/finance?year=YYYY
// @access  SuperAdmin only
export const getFinanceStats = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
        const yearEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        // ── Client onboarding: orgs created this year ──────────────────
        const orgsThisYear = await Organization.find({
            createdAt: { $gte: yearStart, $lt: yearEnd },
        }).select('createdAt');

        // ── All premium orgs (with subscription IDs) ────────────────────
        const allPremiumOrgs = await Organization.find({
            subscriptionPlan: 'premium',
            razorpaySubscriptionId: { $ne: null },
        }).select('razorpaySubscriptionId paymentHistory');

        const allFreeOrgs = await Organization.countDocuments({ subscriptionPlan: 'free' });

        // ── Monthly buckets ──────────────────────────────────────────────
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            label: new Date(year, i, 1).toLocaleString('en-IN', { month: 'long' }),
            newClients: 0,
            paymentsCount: 0,
            revenue: 0,   // in rupees
        }));

        // New clients per month
        for (const org of orgsThisYear) {
            const m = new Date(org.createdAt).getUTCMonth();
            months[m].newClients += 1;
        }

        // ── Fetch REAL payments from Razorpay REST API ───────────────────
        let allTimeRevenuePaise = 0;

        await Promise.allSettled(
            allPremiumOrgs.map(async (org) => {
                for (const p of org.paymentHistory || []) {
                    allTimeRevenuePaise += p.amountPaise;
                    const paidAt = new Date(p.paidAt);
                    if (paidAt.getUTCFullYear() === year) {
                        months[paidAt.getUTCMonth()].paymentsCount += 1;
                        months[paidAt.getUTCMonth()].revenue += p.amountPaise / 100;
                    }
                }
            })
        );

        const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
        const totalNewClients = months.reduce((s, m) => s + m.newClients, 0);
        const allTimeRevenue = allTimeRevenuePaise / 100;

        const availableYears = await Organization.aggregate([
            { $group: { _id: { $year: '$createdAt' } } },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            year,
            summary: {
                yearRevenue: Math.round(totalRevenue * 100) / 100,
                yearNewClients: totalNewClients,
                allTimePremium: allPremiumOrgs.length,
                allTimeRevenue: Math.round(allTimeRevenue * 100) / 100,
                freeOrgs: allFreeOrgs,
            },
            months,
            availableYears: availableYears.map(y => y._id),
        });
    } catch (error) {
        console.error('Error in getFinanceStats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
