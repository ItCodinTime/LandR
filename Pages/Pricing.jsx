import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const plans = [
    {
        id: 'free',
        name: 'Starter',
        price: 0,
        features: [
            '3 reports per month (all types)',
            'Basic slide deck templates',
            'Email support',
            'PDF downloads',
        ],
        cta: 'Continue with Starter',
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 79,
        isMostPopular: true,
        features: [
            'Unlimited company reports',
            'Unlimited strategic plans',
            'Premium slide deck templates',
            'Priority email support',
            'Advanced analytics',
            'Custom branding',
            'Interview preparation guides',
        ],
        cta: 'Upgrade to Professional',
    },
    {
        id: 'enterprise',
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
        ],
        cta: 'Contact Sales',
    },
];

export default function PricingPage() {
    return (
        <div className="bg-black text-white min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-8">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" size="icon" className="mr-4 text-gray-400 hover:text-white hover:bg-gray-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold">Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Success Plan</span></h1>
                        <p className="text-gray-400 mt-2">Unlock your full potential with the right plan. Start for free, upgrade anytime.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative bg-gray-900/50 border rounded-xl p-8 transition-all ${plan.isMostPopular ? 'border-purple-500 shadow-2xl shadow-purple-500/10 scale-105' : 'border-gray-800'}`}>
                            {plan.isMostPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
                            <p className="text-4xl font-bold my-4 text-white">${plan.price}<span className="text-lg font-normal text-gray-400">/month</span></p>
                            <p className="text-gray-400 h-12">{plan.name === 'Starter' ? 'Perfect for individual job seekers getting started' : plan.name === 'Professional' ? 'Best for active job seekers and career changers' : 'For teams and career coaching services'}</p>
                            <Link to={plan.id !== 'enterprise' ? (plan.id === 'free' ? createPageUrl('Dashboard') : `${createPageUrl('Checkout')}?plan=${plan.id}`) : '#contact-sales'}>
                                 <Button className={`w-full my-8 ${plan.isMostPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}>
                                    {plan.cta}
                                </Button>
                            </Link>
                            <ul className="space-y-4">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                
                <div className="text-center mt-12">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
                            <X className="w-4 h-4 mr-2" />
                            Continue with Current Plan
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
