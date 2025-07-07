import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BotMessageSquare, Wand2, Download, FileUp, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import ReactMarkdown from 'react-markdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';

export default function CoverLetterGeneratorPage() {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [linkedInJobUrl, setLinkedInJobUrl] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [tone, setTone] = useState('Professional');
    const [file, setFile] = useState(null);
    const [user, setUser] = useState(null);
    const [isCheckingUsage, setIsCheckingUsage] = useState(true);

    useEffect(() => {
        User.me().then(setUser).catch(() => setUser(null)).finally(() => setIsCheckingUsage(false));
    }, []);
    
    useEffect(() => {
        if (!isCheckingUsage && !user) {
            User.login();
        }
    }, [isCheckingUsage, user]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        
        setIsLoading(true);
        setError('');
        try {
            const { file_url } = await UploadFile({ file: selectedFile });
            const prompt = "Extract the text content from the attached document. Return only the raw text, without any additional comments or formatting.";
            const extractedText = await InvokeLLM({ prompt, file_urls: [file_url] });
            setResumeText(extractedText.trim());
        } catch (err) {
            console.error(err);
            setError("Failed to extract text from file. Please paste the content manually.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
         if (!user) {
            User.login();
            return;
        }
        
        if (user.plan === 'free' && (user.usageCount || 0) >= 3) {
            window.location.href = createPageUrl('Pricing');
            return;
        }

        if (!resumeText || !jobDescription) {
            setError('Please provide your resume/background and the job description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedLetter('');

        const prompt = `
            As an expert career coach and professional writer, generate a concise, compelling, and high-quality cover letter based on the provided information.

            **Context:**
            - **User's Resume/Background:** ${resumeText.slice(0, 4000)}...
            - **Job Description:** ${jobDescription.slice(0, 4000)}...
            - **LinkedIn Job URL:** ${linkedInJobUrl || 'Not provided'}

            **Instructions for High-Quality Output:**
            1.  **Tone:** The tone must be strictly **${tone}**.
            2.  **Targeted Content:** Do not use generic statements. Analyze the job description for key requirements and pain points. Extract the most relevant skills and experiences from the user's resume to address these points directly.
            3.  **Highlight Accomplishments:** Weave 2-3 specific, quantifiable accomplishments from the resume into the narrative of the letter. Show, don't just tell.
            4.  **Structure:**
                *   **Opening:** A strong, engaging opening that states the role you're applying for and where you saw it.
                *   **Body Paragraphs (2-3):** Connect your specific experiences and accomplishments to the company's needs as outlined in the job description. Explain *why* your background makes you the perfect fit.
                *   **Closing:** A confident closing that reiterates your interest and includes a clear call to action (e.g., "I am eager to discuss how my experience in X can help your team achieve Y.").
            5.  **Conciseness:** Keep the letter under 350 words. Every sentence must have a purpose.
            6.  **Formatting:** Output the result in clean, professional Markdown format.

            The final letter should sound human, authentic, and be tailored enough to feel like it was written specifically for this one application.
        `;

        try {
            const result = await InvokeLLM({ prompt, add_context_from_internet: true });
            setGeneratedLetter(result);
             if (user && user.plan === 'free') {
                await User.updateMyUserData({ usageCount: (user.usageCount || 0) + 1 });
            }
        } catch (e) {
            setError('Failed to generate cover letter. The content might be too long.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Cover Letter</title>');
        printWindow.document.write('<style>@import url("https://rsms.me/inter/inter.css"); body { font-family: "Inter", sans-serif; line-height: 1.6; padding: 1in; } p { margin-bottom: 1rem; } strong { font-weight: bold; } .watermark { position: fixed; bottom: 20px; right: 20px; font-size: 12px; color: #aaa; } </style>');
        printWindow.document.write('</head><body>');
        const html = generatedLetter.replace(/\n/g, '<br />');
        printWindow.document.write(`<div class="prose">${html}</div>`);
        printWindow.document.write('<div class="watermark">Generated by Landr</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    if (isCheckingUsage) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <p className="mt-4 text-lg">Checking your access...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <BotMessageSquare className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Cover Letter Generator</h1>
                        <p className="text-gray-400">Create a company-aligned cover letter in seconds.</p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-700/50 text-red-300">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <Card className="bg-black border border-gray-800">
                        <CardHeader>
                            <CardTitle className="text-white">Your Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <p className="text-xs text-gray-500 mb-2">Note: For best results, paste your resume text directly. DOCX/PDF parsing can sometimes be inconsistent.</p>
                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:bg-gray-800/50 text-gray-400 mb-2">
                                    <FileUp className="w-5 h-5 mb-1" />
                                    <span>{file ? file.name : 'Upload Resume/Background'}</span>
                                    <span className="text-xs text-gray-500 mt-1">.pdf, .doc, .docx, .txt</span>
                                </label>
                                <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                                <Textarea
                                    placeholder="...or paste your resume or a brief background here."
                                    className="bg-gray-900 border-gray-700 text-white h-64 font-mono text-sm focus:ring-purple-500"
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                />
                            </div>
                            <Textarea
                                placeholder="Paste the job description here..."
                                className="bg-gray-900 border-gray-700 text-white h-40 font-mono text-sm focus:ring-purple-500"
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="LinkedIn Job URL (Optional)" 
                                    className="bg-gray-900 border-gray-700 text-white pl-9 focus:ring-purple-500" 
                                    value={linkedInJobUrl} 
                                    onChange={e => setLinkedInJobUrl(e.target.value)} 
                                />
                            </div>
                             <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:ring-purple-500">
                                    <SelectValue placeholder="Select a tone..." />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 text-white border-gray-700">
                                    <SelectItem value="Professional" className="hover:bg-gray-800">Professional</SelectItem>
                                    <SelectItem value="Enthusiastic" className="hover:bg-gray-800">Enthusiastic</SelectItem>
                                    <SelectItem value="Formal" className="hover:bg-gray-800">Formal</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wand2 className="w-5 h-5 mr-2"/> Generate Cover Letter</>}
                            </Button>
                            {user && user.plan === 'free' && (
                                <p className="text-sm text-center text-gray-500 mt-2">
                                    You have {Math.max(0, 3 - (user.usageCount || 0))} free uses remaining.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-black border border-gray-800 lg:sticky top-8">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-white">Generated Cover Letter</CardTitle>
                            {generatedLetter && (
                                <Button variant="outline" size="sm" onClick={handleDownload} className="text-white border-gray-700 hover:bg-gray-800 hover:border-purple-500">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="h-[720px] overflow-y-auto">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                                    <p className="mt-4 text-lg">Drafting your letter...</p>
                                </div>
                            )}
                            {generatedLetter ? (
                                <div className="prose prose-sm prose-invert max-w-none text-gray-300 prose-headings:text-white prose-strong:text-white">
                                    <ReactMarkdown>{generatedLetter}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
                                    <BotMessageSquare className="w-16 h-16 mb-4 text-gray-600"/>
                                    <p>Your AI-generated cover letter will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
