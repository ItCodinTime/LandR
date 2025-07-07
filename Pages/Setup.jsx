import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User as UserIcon, Briefcase, FileUp, Link as LinkIcon, Loader2, ArrowRight } from 'lucide-react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const Logo = ({ className }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.11269 14.8873L14.8873 9.11269M9.11269 14.8873C7.23844 16.7616 4.33333 18.2 4.33333 18.2C4.33333 18.2 5.73844 20.7616 7.61269 22.6358C9.48694 24.5101 12.392 23.1 12.392 23.1C12.392 23.1 10.9869 20.1478 9.11269 18.2736C7.23844 16.3993 4.33333 14.8873 4.33333 14.8873" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.392 4.33333C12.392 4.33333 9.48694 2.92822 7.61269 4.80247C5.73844 6.67672 4.33333 9.58183 4.33333 9.58183C4.33333 9.58183 5.73844 12.392 7.61269 14.2662L9.11269 12.7662" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.2 4.33333C18.2 4.33333 20.7616 5.73844 22.6358 7.61269C24.5101 9.48694 23.1 12.392 23.1 12.392C23.1 12.392 20.1478 10.9869 18.2736 9.11269" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function SetupPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        current_position: '',
        current_company: '',
        linkedin_url: '',
        resume_text: '',
        resume_url: '',
        plan: 'free'
    });

    useEffect(() => {
        // Try to get existing user
        User.me().then(currentUser => {
            setUser(currentUser);
            setProfileData(prev => ({
                ...prev,
                full_name: currentUser.full_name || '',
                email: currentUser.email || ''
            }));
        }).catch(() => {
            // User not logged in, that's okay
        });
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await User.login();
            const currentUser = await User.me();
            setUser(currentUser);
            setProfileData(prev => ({
                ...prev,
                full_name: currentUser.full_name || '',
                email: currentUser.email || ''
            }));
            setStep(2);
        } catch (error) {
            console.error('Google sign-in failed:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const result = await UploadFile({ file });
            setProfileData(prev => ({ ...prev, resume_url: result.file_url }));
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            if (user) {
                await User.updateMyUserData({
                    current_position: profileData.current_position,
                    current_company: profileData.current_company,
                    linkedin_url: profileData.linkedin_url,
                    resume_text: profileData.resume_text,
                    resume_url: profileData.resume_url,
                    plan: profileData.plan
                });
            }
            window.location.href = createPageUrl('Dashboard');
        } catch (error) {
            console.error('Profile update failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const continueAsGuest = () => {
        window.location.href = createPageUrl('Dashboard');
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <header className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <Logo className="text-purple-400" />
                    <span className="font-bold text-xl">Landr Setup</span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-8">
                {step === 1 && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl text-white">Welcome to Landr</CardTitle>
                            <p className="text-gray-400">Let's get you set up to create amazing strategic applications</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={handleGoogleSignIn} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                <UserIcon className="w-5 h-5 mr-2" />
                                Continue with Google
                            </Button>
                            <div className="text-center">
                                <span className="text-gray-500">or</span>
                            </div>
                            <Button onClick={continueAsGuest} variant="outline" className="w-full text-white border-gray-600 hover:bg-gray-800">
                                Continue as Guest
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Complete Your Profile</CardTitle>
                            <p className="text-gray-400">This information helps us create better, personalized content for you</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    placeholder="Current Position" 
                                    value={profileData.current_position}
                                    onChange={(e) => setProfileData(prev => ({...prev, current_position: e.target.value}))}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                                <Input 
                                    placeholder="Current Company" 
                                    value={profileData.current_company}
                                    onChange={(e) => setProfileData(prev => ({...prev, current_company: e.target.value}))}
                                    className="bg-gray-800 border-gray-700 text-white"
                                />
                            </div>
                            
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="LinkedIn Profile URL" 
                                    value={profileData.linkedin_url}
                                    onChange={(e) => setProfileData(prev => ({...prev, linkedin_url: e.target.value}))}
                                    className="bg-gray-800 border-gray-700 text-white pl-9"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-2">Resume</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input 
                                            type="file" 
                                            id="resume-file" 
                                            className="hidden" 
                                            onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.txt"
                                        />
                                        <label 
                                            htmlFor="resume-file" 
                                            className="cursor-pointer flex items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-lg hover:bg-gray-800/50 text-gray-400"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5 mr-2" />}
                                            {profileData.resume_url ? 'Resume Uploaded' : 'Upload Resume'}
                                        </label>
                                    </div>
                                    <Textarea 
                                        placeholder="Or paste resume text here..."
                                        value={profileData.resume_text}
                                        onChange={(e) => setProfileData(prev => ({...prev, resume_text: e.target.value}))}
                                        className="bg-gray-800 border-gray-700 text-white h-24"
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-300 mb-2">Choose Your Plan</p>
                                <Select value={profileData.plan} onValueChange={(value) => setProfileData(prev => ({...prev, plan: value}))}>
                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                        <SelectItem value="free">Free Plan (3 reports/month)</SelectItem>
                                        <SelectItem value="professional">Professional ($79/month)</SelectItem>
                                        <SelectItem value="enterprise">Enterprise ($199/month)</SelectItem>
                                    </SelectContent>
                                </Select>
 
