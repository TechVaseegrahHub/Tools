import Organization from '../models/organization.model.js';
import Tool from '../models/tool.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    List all organizations with summary counts
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
