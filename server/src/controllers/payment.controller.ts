import { Request, Response } from 'express';
import { prisma } from '../config/database';
import crypto from 'crypto';
import axios from 'axios';
import { createAndSendNotification } from './notification.controller';

const CHARGILY_SECRET_KEY = process.env.CHARGILY_SECRET_KEY || 'test_sk_xxxxxxxxxxxx';
const CHARGILY_URL = 'https://pay.chargily.net/test/api/v2';

/**
 * POST /api/payments/checkout
 * Creates a Chargily V2 checkout session and returns the redirect URL.
 */
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId, amount, studentId, successUrl, failureUrl } = req.body;

        if (!orderId || !amount) {
            res.status(400).json({ message: 'Order details missing' });
            return;
        }

        const response = await axios.post(`${CHARGILY_URL}/checkouts`, {
            amount: amount,
            currency: 'dzd',
            success_url: successUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?status=success&orderId=${orderId}`,
            failure_url: failureUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout?status=failure&orderId=${orderId}`,
            metadata: {
                order_id: orderId,
                student_id: studentId || '',
            },
        }, {
            headers: {
                'Authorization': `Bearer ${CHARGILY_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ checkout_url: response.data.checkout_url });
    } catch (error: any) {
        console.error('Chargily checkout error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Error initiating payment', details: error.response?.data });
    }
};

/**
 * POST /api/payments/webhook
 * Handles Chargily V2 webhook events with HMAC-SHA256 signature verification.
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const signature = req.headers['signature'] as string;
        const payload = JSON.stringify(req.body);

        // ── Signature Verification ──
        if (signature && CHARGILY_SECRET_KEY !== 'test_sk_xxxxxxxxxxxx') {
            const computedSignature = crypto
                .createHmac('sha256', CHARGILY_SECRET_KEY)
                .update(payload)
                .digest('hex');

            if (signature !== computedSignature) {
                console.warn('⚠️ Webhook signature mismatch!');
                res.status(403).json({ message: 'Invalid signature' });
                return;
            }
        }

        const event = req.body;
        console.log(`[Chargily Webhook] Event type: ${event.type}`);

        if (event.type === 'checkout.paid') {
            const metadataType = event.data?.metadata?.type;

            if (metadataType === 'SUBSCRIPTION') {
                const subscriptionId = event.data?.metadata?.subscription_id;
                const studentId = event.data?.metadata?.student_id;
                const planType = event.data?.metadata?.plan_type; // MONTHLY or YEARLY

                if (!subscriptionId || !studentId) {
                    console.error('[Chargily Webhook] Missing subscription data in metadata');
                    res.status(400).json({ message: 'Missing subscription data' });
                    return;
                }

                // Calculate end date
                const startDate = new Date();
                const endDate = new Date(startDate);
                if (planType === 'YEARLY') {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                } else {
                    endDate.setMonth(endDate.getMonth() + 1);
                }

                // Update Subscription
                await prisma.subscription.update({
                    where: { id: subscriptionId },
                    data: {
                        status: 'ACTIVE',
                        start_date: startDate,
                        end_date: endDate
                    }
                });

                // Update Student Profile
                await prisma.student.update({
                    where: { id: studentId },
                    data: {
                        subscription_status: 'ACTIVE',
                        subscription_end_date: endDate
                    }
                });

                // Log Payment
                await prisma.payment.create({
                    data: {
                        subscription_id: subscriptionId,
                        student_id: studentId,
                        amount: event.data.amount || (planType === 'YEARLY' ? 15000 : 1500),
                        currency: 'DZD',
                        status: 'COMPLETED',
                        payment_method: 'CHARGILY',
                        transaction_id: event.data.id || `sub_chargily_${Date.now()}`
                    }
                });

                console.log(`✅ Subscription ${subscriptionId} marked as ACTIVE via Chargily webhook`);

                // ── Notify Admins ──
                try {
                    const student = await prisma.student.findUnique({
                        where: { id: studentId },
                        include: { user: true }
                    });
                    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
                    const amount = event.data.amount || (planType === 'YEARLY' ? 15000 : 1500);
                    const studentName = student?.user ? `${student.user.first_name} ${student.user.last_name}` : 'طالب جديد';

                    for (const admin of admins) {
                        await createAndSendNotification(
                            admin.id,
                            'PAYMENT_SUCCESS',
                            '🎉 اشتراك جديد ناجح',
                            `قام الطالب ${studentName} بدفع مبلغ ${amount} دج لتفعيل اشتراكه (${planType === 'YEARLY' ? 'سنوي' : 'شهري'}).`,
                            '💳'
                        );
                    }
                } catch (notifyErr) {
                    console.error('Failed to notify admins about subscription payment:', notifyErr);
                }

            } else {
                // Handle as normal Store Order
                const orderId = event.data?.metadata?.order_id;
                const studentId = event.data?.metadata?.student_id;

                if (!orderId) {
                    console.error('[Chargily Webhook] Missing order_id in metadata');
                    res.status(400).json({ message: 'Missing order_id' });
                    return;
                }

                // ── Mark order as COMPLETED ──
                await prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'COMPLETED', payment_type: 'CHARGILY' }
                });

                // ── Log the payment ──
                await prisma.payment.create({
                    data: {
                        order_id: orderId,
                        student_id: studentId || '',
                        amount: event.data.amount || 0,
                        currency: 'DZD',
                        status: 'COMPLETED',
                        payment_method: 'CHARGILY',
                        transaction_id: event.data.id || `order_chargily_${Date.now()}`
                    }
                });

                console.log(`✅ Order ${orderId} marked as COMPLETED via Chargily webhook`);

                // ── Notify Admins ──
                try {
                    const student = studentId ? await prisma.student.findUnique({
                        where: { id: studentId },
                        include: { user: true }
                    }) : null;
                    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
                    const amount = event.data.amount || 0;
                    const studentName = student?.user ? `${student.user.first_name} ${student.user.last_name}` : 'طالب';

                    for (const admin of admins) {
                        await createAndSendNotification(
                            admin.id,
                            'ORDER_PAID',
                            '🛍️ طلب متجر مدفوع',
                            `تم دفع مبلغ ${amount} دج للطلب #${orderId.substring(0, 8)} من قبل ${studentName}.`,
                            '📦'
                        );
                    }
                } catch (notifyErr) {
                    console.error('Failed to notify admins about order payment:', notifyErr);
                }
            }

        } else if (event.type === 'checkout.failed') {
            const metadataType = event.data?.metadata?.type;
            
            if (metadataType === 'SUBSCRIPTION') {
                const subscriptionId = event.data?.metadata?.subscription_id;
                if (subscriptionId) {
                    await prisma.subscription.update({
                        where: { id: subscriptionId },
                        data: { status: 'EXPIRED' }
                    });
                    console.log(`❌ Subscription ${subscriptionId} marked as FAILED/EXPIRED`);
                }
            } else {
                const orderId = event.data?.metadata?.order_id;
                if (orderId) {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { status: 'FAILED' }
                    });
                    console.log(`❌ Order ${orderId} marked as FAILED`);
                }
            }
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook handler failed' });
    }
};
