import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Briefcase, FileText, CalendarCheck, Presentation, Sun, Moon, Send, Sparkles, BotMessageSquare, BadgePercent } from 'lucide-react';
import { User } from '@/entities/User';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationItems = [
    { title: 'Dashboard', url: createPageUrl('Dashboard'), icon: LayoutDashboard, tooltip: 'View your career stats.' },
    { title: 'Projects', url: createPageUrl('Projects'), icon: Briefcase, tooltip: 'Manage all your job applications.' },
    { title: 'Resume Optimizer', url: createPageUrl('ResumeOptimizer'), icon: Sparkles, tooltip: 'Tailor your resume for any job.' },
    { title: 'Cover Letter', url: createPageUrl('CoverLetterGenerator'), icon: BotMessageSquare, tooltip: 'Generate a custom cover letter.' },
    { title: 'Company Report', url: createPageUrl('CompanyReport'), icon: FileText, tooltip: 'Analyze your fit with a company.' },
    { title: 'Strategic Plan', url: createPageUrl('StrategicPlan'), icon: CalendarCheck, tooltip: 'Create a 30-60-90 day plan.' },
    { title: 'Slide Builder', url: createPageUrl('SlideBuilder'), icon: Presentation, tooltip: 'Turn plans into presentations.' },
    { title: 'Outreach', url: createPageUrl('Outreach'), icon: Send, tooltip: 'Find contacts and draft emails.' },
    { title: 'Pricing', url: createPageUrl('Pricing'), icon: BadgePercent, tooltip: 'View plans and upgrade.' },
];

const Logo = ({ className }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.11269 14.8873L14.8873 9.11269M9.11269 14.8873C7.23844 16.7616 4.33333 18.2 4.33333 18.2C4.33333 18.2 5.73844 20.7616 7.61269 22.6358C9.48694 24.5101 12.392 23.1 12.392 23.1C12.392 23.1 10.9869 20.1478 9.11269 18.2736C7.23844 16.3993 4.33333 14.8873 4.33333 14.8873" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.392 4.33333C12.392 4.33333 9.48694 2.92822 7.61269 4.80247C5.73844 6.67672 4.33333 9.58183 4.33333 9.58183C4.33333 9.58183 5.73844 12.392 7.61269 14.2662L9.11269 12.7662" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.2 4.33333C18.2 4.33333 20.7616 5.73844 22.6358 7.61269C24.5101 9.48694 23.1 12.392 23.1 12.392C23.1 12.392 20.1478 10.9869 18.2736 9.11269" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [user, setUser] = React.useState(null);
    const [isDark, setIsDark] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                // Not logged in
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    // Set light mode as default and disable toggle
    React.useEffect(() => {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }, []);
    
    // Don't render layout for landing page
    if (currentPageName === 'Landing' || currentPageName === 'Pricing' || currentPageName === 'Checkout') {
        return <>{children}</>;
    }

    if (!user) {
        return (
            <div className="flex min-h-screen bg-black text-white">
                 <aside className="w-64 flex-shrink-0 flex flex-col bg-black border-r border-gray-800 p-4">
                     <div className="flex items-center gap-2 mb-8"><div className="w-8 h-8 rounded-full bg-gray-800"></div> <div className="h-6 w-24 bg-gray-800 rounded"></div></div>
                     <div className="space-y-2">
                         {Array(8).fill(0).map((_, i) => <div key={i} className="h-9 w-full bg-gray-800 rounded-lg"></div>)}
                     </div>
                 </aside>
                 <main className="flex-1 p-8"><div className="h-full w-full bg-gray-900 rounded-lg"></div></main>
            </div>
        );
    }

    const toggleTheme = () => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    return (
        <div className={`flex min-h-screen transition-colors bg-black text-gray-200`}>
            <TooltipProvider>
            <aside className={`w-64 flex-shrink-0 flex flex-col transition-colors bg-black border-r border-gray-800 print:hidden`}>
                <div className={`p-4 flex items-center gap-3 border-b transition-colors border-gray-800`}>
                    <Logo className={'text-purple-400'} />
                    <h1 className="font-bold text-xl text-white">Landr</h1>
                </div>
                <nav className="flex-1 p-4">
                    <p className={`text-xs uppercase font-semibold tracking-wider mb-2 text-gray-500`}>Navigation</p>
                    <ul>
                        {navigationItems.map(item => (
                            <li key={item.title}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            to={item.url}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 mb-1 w-full ${
                                                location.pathname === item.url 
                                                    ? 'bg-purple-600 text-white' 
                                                    : 'hover:bg-gray-800 text-gray-300'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                                        <p>{item.tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className={`p-4 border-t transition-colors border-gray-800`}>
                    <div className="flex items-center">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 bg-gray-700`}>
                            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm text-white">{user.full_name || 'User'}</p>
                            <p className={`text-xs text-gray-500`}>{user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}</p>
                        </div>
                    </div>
                </div>
            </aside>
            </TooltipProvider>
            <main className="flex-1 overflow-auto bg-gray-900/50">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
