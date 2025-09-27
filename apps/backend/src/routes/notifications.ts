import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  executeNotificationAction,
  getUnreadCount,
  markAllAsRead
} from '../controllers/notificationController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/v1/notifications
// @desc    Get notifications with filters and pagination
// @access  Private (All authenticated users)
router.get('/', getNotifications);

// @route   GET /api/v1/notifications/unread/count
// @desc    Get unread notifications count for user
// @access  Private (All authenticated users)
router.get('/unread/count', getUnreadCount);

// @route   POST /api/v1/notifications/mark-all-read
// @desc    Mark all notifications as read for user
// @access  Private (All authenticated users)
router.post('/mark-all-read', markAllAsRead);

// @route   GET /api/v1/notifications/:id
// @desc    Get single notification by ID
// @access  Private (All authenticated users)
router.get('/:id', getNotification);

// @route   POST /api/v1/notifications
// @desc    Create new notification
// @access  Private (ADMIN, FUNCIONARIO, VETERINARIO)
router.post('/', authorize('ADMIN', 'FUNCIONARIO', 'VETERINARIO'), createNotification);

// @route   PUT /api/v1/notifications/:id
// @desc    Update notification (mark as read, archive, etc.)
// @access  Private (All authenticated users)
router.put('/:id', updateNotification);

// @route   POST /api/v1/notifications/:id/action
// @desc    Execute notification action
// @access  Private (All authenticated users)
router.post('/:id/action', executeNotificationAction);

export default router;
