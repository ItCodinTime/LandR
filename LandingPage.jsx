import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Upload, BrainCircuit, FileDown, Star } from 'lucide-react';
import { User } from '@/entities/User';

const companyLogos = [
    { name: 'Google', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png' },
    { name: 'Microsoft', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png' },
    { name: 'Apple', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/814px-Apple_logo_black.svg.png' },
    { name: 'Netflix', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png' },
    { name: 'Tesla', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/793px-Tesla_Motors.svg.png' },
    { name: 'Amazon', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png' },
    { name: 'Meta', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png' },
    { name: 'Adobe', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.png/900px-Adobe_Corporate_Logo.png' }
];

const successStories = [
    {
        name: 'A.K.',
        role: 'Senior Product Manager at Google',
        avatar: 'https://i.pravatar.cc/150?u=sarah.chen@example.com',
        comment: 'Landr helped me craft the perfect strategic plan that landed me my dream role at Google. The AI-generated insights were incredibly detailed and relevant to my specific situation.'
    },
    {
        name: 'M.R.',
        role: 'Data Scientist at Microsoft',
        avatar: 'https://i.pravatar.cc/150?u=marcus.rodriguez@example.com',
        comment: 'The slide deck generator in Landr created presentations that impressed my Microsoft interviewers. I received an offer within just one week of my final interview!'
    },
    {
        name: 'E.W.',
        role: 'UX Director at Meta',
        avatar: 'https://i.pravatar.cc/150?u=emily.watson@example.com',
        comment: 'The company fit analysis feature in Landr was incredibly accurate. It helped me understand exactly what to focus on during my Meta interviews and preparation.'
    }
];

const Logo = ({ className }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.11269 14.8873L14.8873 9.11269M9.11269 14.8873C7.23844 16.7616 4.33333 18.2 4.33333 18.2C4.33333 18.2 5.73844 20.7616 7.61269 22.6358C9.48694 24.5101 12.392 23.1 12.392 23.1C12.392 23.1 10.9869 20.1478 9.11269 18.2736C7.23844 16.3993 4.33333 14.8873 4.33333 14.8873" stroke="url(#paint0_linear_landing)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.392 4.33333C12.392 4.33333 9.48694 2.92822 7.61269 4.80247C5.73844 6.67672 4.33333 9.58183 4.33333 9.58183C4.33333 9.58183 5.73844 12.392 7.61269 14.2662L9.11269 12.7662" stroke="url(#paint1_linear_landing)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.2 4.33333C18.2 4.33333 20.7616 5.73844 22.6358 7.61269C24.5101 9.48694 23.1 12.392 23.1 12.392C23.1 12.392 20.1478 10.9869 18.2736 9.11269" stroke="url(#paint2_linear_landing)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="paint0_linear_landing" x1="4.33333" y1="14.8873" x2="12.392" y2="23.1" gradientUnits="userSpaceOnUse"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#818CF8"/></linearGradient>
            <linearGradient id="paint1_linear_landing" x1="4.33333" y1="4.33333" x2="12.392" y2="9.58183" gradientUnits="userSpaceOnUse"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#818CF8"/></linearGradient>
            <linearGradient id="paint2_linear_landing" x1="18.2" y1="4.33333" x2="23.1" y2="12.392" gradientUnits="userSpaceOnUse"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#818CF8"/></linearGradient>
        </defs>
    </svg>
);

export default function LandingPage() {
    const handleSignIn = async () => {
        try {
            await User.login();
        } catch (error) {
            console.error('Login failed:', error);
            // Redirect to setup if login fails
            window.location.href = createPageUrl('Setup');
        }
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <Logo className="text-purple-400" />
                    <span className="font-bold text-xl">Landr</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link to={createPageUrl('Pricing')} className="hover:text-gray-300 transition-colors">Pricing</Link>
                </nav>
                <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={handleSignIn} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600">
                        Sign In with Google
                     </Button>
                     <Link to={createPageUrl('Setup')}>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">Get Started</Button>
                    </Link>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-purple-500/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)]"></div>

                    <div className="relative z-10">
                        <div className="inline-block bg-gray-800/50 border border-gray-700 rounded-full px-3 py-1 text-sm mb-4">
                            AI-Powered Career Strategy
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            The AI Platform for
                            <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Strategic Job Applications</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-gray-400 mb-8">
                            Generate high-quality, tailored strategic plans to power your job search and land your dream role. Stop sending generic applications, start telling your strategic story.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={createPageUrl('Dashboard')}>
                                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20">Start Creating Your Strategy →</Button>
                            </Link>
                        </div>
                    </div>
                     {/* Company Logos */}
                    <div className="w-full absolute bottom-10 left-0">
                        <p className="text-sm text-gray-400 mb-4">Trusted by professionals from leading companies</p>
                        <div className="relative w-full max-w-6xl mx-auto overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                            <div className="flex animate-scroll">
                                {[...companyLogos, ...companyLogos].map((logo, index) => (
                                    <div key={index} className="flex items-center justify-center mx-8 min-w-0">
                                        <img 
                                            src={logo.url} 
                                            alt={logo.name}
                                            className="h-8 max-w-32 object-contain filter brightness-100 grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section id="how-it-works" className="py-20 px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">How It Works</h2>
                        <p className="text-gray-400 mt-2">Transform your job application process with AI in three simple steps</p>
                    </div>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                        <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 text-center transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
                            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-600/20 mx-auto mb-4 border border-purple-500/30">
                                <Upload className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">1. Upload & Analyze</h3>
                            <p className="text-gray-400">Upload your resume and job description. Our AI analyzes both to understand your background and the role requirements.</p>
                        </div>
                        <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 text-center transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
                             <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-600/20 mx-auto mb-4 border border-purple-500/30">
                                <BrainCircuit className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">2. AI Strategy Generation</h3>
                            <p className="text-gray-400">Advanced AI creates a comprehensive strategic plan, resume, or cover letter tailored to your specific situation.</p>
                        </div>
                        <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 text-center transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
                             <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-600/20 mx-auto mb-4 border border-purple-500/30">
                                <FileDown className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">3. Professional Deliverables</h3>
                            <p className="text-gray-400">Download polished PDFs ready to impress hiring managers and secure your dream job.</p>
                        </div>
                    </div>
                </section>

                {/* Success Stories Section */}
                <section className="py-20 px-4 bg-gray-900/20">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">Success Stories</h2>
                        <p className="text-gray-400 mt-2">See how professionals landed their dream jobs with Landr</p>
                    </div>
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                        {successStories.map((story, index) => (
                            <div key={index} className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                </div>
                                <p className="text-gray-300 mb-6">"{story.comment}"</p>
                                <div className="flex items-center">
                                    <img src={story.avatar} alt={story.name} className="w-12 h-12 rounded-full mr-4" />
                                    <div>
                                        <p className="font-semibold">{story.name}</p>
                                        <p className="text-sm text-gray-400">{story.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
             <style>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                    display: flex;
                    width: 200%;
                }
                .bg-grid-purple-500 {
                    background-image:
                        linear-gradient(to right, rgba(167, 139, 250, 0.2) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(167, 139, 250, 0.2) 1px, transparent 1px);
                    background-size: 2rem 2rem;
                }
            `}</style>
        </div>
    );
}
