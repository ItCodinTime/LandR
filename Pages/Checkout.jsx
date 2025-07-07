import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check, CreditCard, Lock } from 'lucide-react';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';

const plans = {
    professional: {
        name: 'Professional',
        price: 79,
        features: [
            'Unlimited company reports',
            'Unlimited strategic plans',
            'Premium slide deck templates',
            'Priority email support',
            'Advanced analytics',
            'Custom branding',
            'Interview preparation guides',
        ]
    },
    enterprise: {
        name: 'Enterprise',
        price: 199,
        features: [
            'Everything in Professional',
            'Team collaboration tools',
            'White-label solution',
            'Dedicated account manager',
            'Custom integrations',
            'Advanced reporting',
            'Phone support',
            'Training sessions',
        ]
    }
};

export default function CheckoutPage() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: '',
        email: ''
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('plan');
        if (planId && plans[planId]) {
            setSelectedPlan(plans[planId]);
        }
        
        User.me().then(setUser).catch(() => setUser(null));
    }, []);

    const handlePayment = async () => {
        if (!selectedPlan || !user) return;
        
        setIsProcessing(true);
        
        // Simulate payment processing
        setTimeout(async () => {
            try {
                await User.updateMyUserData({ 
                    plan: selectedPlan.name.toLowerCase(),
                    usageCount: 0 // Reset usage count on upgrade
                });
                
                alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
                window.location.href = createPageUrl('Dashboard');
            } catch (e) {
                alert('Payment failed. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        }, 2000);
    };

    if (!selectedPlan) {
        return (
            <div className="bg-black text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Invalid Plan</h1>
                    <p className="text-gray-400 mb-4">Please select a valid plan to continue.</p>
                    <Button onClick={() => window.location.href = createPageUrl('Pricing')} className="bg-purple-600 hover:bg-purple-700">
                        View Plans
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Complete Your Purchase</h1>
                
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">{selectedPlan.name} Plan</span>
                                    <span className="text-white font-bold">${selectedPlan.price}/month</span>
                                </div>
                                <div className="border-t border-gray-800 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-white">Total</span>
                                        <span className="text-lg font-bold text-white">${selectedPlan.price}/month</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">What's included:</p>
                                    {selectedPlan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center">
                                            <Check className="w-4 h-4 text-green-500 mr-2" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                                <Input 
                                    placeholder="1234 5678 9012 3456"
                                    value={paymentData.cardNumber}
                                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                                    <Input 
                                        placeholder="MM/YY"
                                        value={paymentData.expiryDate}
                                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
                                    <Input 
                                        placeholder="123"
                                        value={paymentData.cvv}
                                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                                        className="bg-gray-800 border-gray-700 text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cardholder Name</label>
                                <Input 
                                    placeholder="John Doe"
                                    value={paymentData.name}
                                    onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <Input 
                                    placeholder="john@example.com"
                                    value={paymentData.email}
                                    onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            
                            <Button 
                                onClick={handlePayment} 
                                disabled={isProcessing}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                {isProcessing ? 'Processing...' : `Subscribe to ${selectedPlan.name} - $${selectedPlan.price}/month`}
                            </Button>
                            
                            <div className="flex items-center justify-center text-sm text-gray-400">
                                <Lock className="w-4 h-4 mr-1" />
                                Secure payment powered by Stripe
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
