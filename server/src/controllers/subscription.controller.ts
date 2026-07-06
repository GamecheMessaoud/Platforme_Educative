import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import axios from 'axios';

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || 'test_sk_xxxxxxxxxxxx';
const CHARGILY_URL = 'https://pay.chargily.net/test/api/v2';

export const createSubscriptionCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { planType, successUrl, failureUrl } = req.body; // 'MONTHLY' | 'YEARLY'

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }

        if (planType !== 'MONTHLY' && planType !== 'YEARLY') {
            res.status(400).json({ error: 'Invalid plan type' });
            return;
        }

        const amount = planType === 'YEARLY' ? 15000 : 1500;

        // Create pending subscription record
        const subscription = await prisma.subscription.create({
            data: {
                student_id: student.id,
                plan_type: planType,
                status: 'PENDING',
            }
        });

        // Initialize Chargily Checkout
        const response = await axios.post(`${CHARGILY_URL}/checkouts`, {
            amount: amount,
            currency: 'dzd',
            success_url: successUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-dashboard?subscription=success`,
            failure_url: failureUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/student-dashboard?subscription=failure`,
            metadata: {
                type: 'SUBSCRIPTION',
                subscription_id: subscription.id,
                student_id: student.id,
                plan_type: planType,
            },
        }, {
            headers: {
                'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ checkout_url: response.data.checkout_url });
    } catch (error: any) {
        console.error('Subscription checkout error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Error initiating subscription payment' });
    }
};

export const getCurrentSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({
            where: { user_id: userId },
            include: {
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    orderBy: { end_date: 'desc' },
                    take: 1
                }
            }
        });

        res.json({
            subscription_status: student?.subscription_status || 'NONE',
            subscription_end_date: student?.subscription_end_date || null,
            active_subscription: student?.subscriptions?.[0] || null
        });
    } catch (error: any) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Error fetching subscription data' });
    }
};

export const verifySubscriptionTesting = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const student = await prisma.student.findUnique({ where: { user_id: userId } });
        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        const pendingSubscription = await prisma.subscription.findFirst({
            where: { student_id: student.id, status: 'PENDING' },
            orderBy: { created_at: 'desc' }
        });

        if (!pendingSubscription) {
            res.status(404).json({ error: 'No pending subscription found to verify' });
            return;
        }

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (pendingSubscription.plan_type === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        await prisma.subscription.update({
            where: { id: pendingSubscription.id },
            data: {
                status: 'ACTIVE',
                start_date: startDate,
                end_date: endDate
            }
        });

        await prisma.student.update({
            where: { id: student.id },
            data: {
                subscription_status: 'ACTIVE',
                subscription_end_date: endDate
            }
        });

        res.json({ success: true, message: 'Subscription successfully activated for testing!' });
    } catch (error: any) {
        res.status(500).json({ error: 'Error verifying subscription' });
    }
};
