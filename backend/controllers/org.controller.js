import Organization from '../models/organization.model.js';
import User from '../models/user.model.js';

// @desc    Get this org's settings
// @route   GET /api/org/settings
// @access  Private/Admin
export const getOrgSettings = async (req, res) => {
    try {
        const org = await Organization.findById(req.user.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });
        res.json({ _id: org._id, name: org.name, slug: org.slug, isActive: org.isActive, createdAt: org.createdAt });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update org name
// @route   PUT /api/org/settings
// @access  Private/Admin
export const updateOrgSettings = async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Organization name is required' });

    try {
        const org = await Organization.findById(req.user.orgId);
        if (!org) return res.status(404).json({ message: 'Organization not found' });

        // Regenerate slug from new name
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slugExists = await Organization.findOne({ slug, _id: { $ne: org._id } });
        if (slugExists) return res.status(400).json({ message: 'An org with a similar name already exists' });

        org.name = name.trim();
        org.slug = slug;
        await org.save();

        res.json({ message: 'Organization updated successfully', org: { name: org.name, slug: org.slug } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
