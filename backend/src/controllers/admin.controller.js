import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { APPLICATION_STATUS, ROLES } from '../constants/index.js';
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '../services/email.service.js';
import { notifyProviderApproved, notifyProviderRejected } from '../services/notification.service.js';

export const getProviders = asyncHandler(async (req, res) => {
  const { search = '', status = '', category = '', page = 1, limit = 10 } = req.query;

  const query = { role: ROLES.PROVIDER };
  if (status) query['providerProfile.status'] = status;
  if (category) query['providerProfile.categories'] = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'providerProfile.categories': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 10, 1);

  const [providers, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json(
    new ApiResponse(200, {
      providers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(Math.ceil(total / limitNum), 1),
      },
    })
  );
});

export const getProviderById = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: ROLES.PROVIDER }).select(
    '-password'
  );
  if (!provider) throw new ApiError(404, 'Provider not found');
  res.json(new ApiResponse(200, { provider }));
});

export const approveProvider = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: ROLES.PROVIDER });
  if (!provider) throw new ApiError(404, 'Provider not found');
  if (provider.providerProfile.status !== APPLICATION_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending applications can be approved');
  }

  provider.providerProfile.status = APPLICATION_STATUS.APPROVED;
  provider.providerProfile.rejectionRemarks = '';
  provider.providerProfile.reviewedAt = new Date();
  await provider.save();

  sendApplicationApprovedEmail(provider).catch(() => {});
  notifyProviderApproved(provider).catch(() => {});

  res.json(new ApiResponse(200, { provider }, 'Provider approved'));
});

export const rejectProvider = asyncHandler(async (req, res) => {
  const { remarks } = req.body;
  if (!remarks?.trim()) throw new ApiError(400, 'Rejection remarks are required');

  const provider = await User.findOne({ _id: req.params.id, role: ROLES.PROVIDER });
  if (!provider) throw new ApiError(404, 'Provider not found');
  if (provider.providerProfile.status !== APPLICATION_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending applications can be rejected');
  }

  provider.providerProfile.status = APPLICATION_STATUS.REJECTED;
  provider.providerProfile.rejectionRemarks = remarks.trim();
  provider.providerProfile.reviewedAt = new Date();
  await provider.save();

  sendApplicationRejectedEmail(provider).catch(() => {});
  notifyProviderRejected(provider).catch(() => {});

  res.json(new ApiResponse(200, { provider }, 'Provider rejected'));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const counts = await User.aggregate([
    { $match: { role: ROLES.PROVIDER } },
    { $group: { _id: '$providerProfile.status', count: { $sum: 1 } } },
  ]);

  const stats = Object.values(APPLICATION_STATUS).reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    { total: 0 }
  );

  counts.forEach(({ _id, count }) => {
    if (_id) stats[_id] = count;
    stats.total += count;
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = await User.aggregate([
    { $match: { role: ROLES.PROVIDER, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const monthlyRegistrations = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const match = monthlyAgg.find(
      (a) => a._id.year === d.getFullYear() && a._id.month === d.getMonth() + 1
    );
    return { month: d.toLocaleString('en-US', { month: 'short' }), count: match?.count || 0 };
  });

  res.json(new ApiResponse(200, { stats: { ...stats, monthlyRegistrations } }));
});
