import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Info, Loader2, CalendarCheck, Download, FileUp, CheckCircle, Edit, Save, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StrategicPlanReport = ({ report, onBack, onEdit, isEditing, editedContent, setEditedContent, onSave }) => {
    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        // Ensure contentToPrint always refers to the 'content' field of the strategic plan object
        const contentToPrint = isEditing ? editedContent.content : report.strategicPlan.content;

        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Strategic Plan - ${report.position} at ${report.companyName}</title>
    <style>
        @import url('https://rsms.me/inter/inter.css');
        @page { size: A4; margin: 1in; }
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #111827;
            background: white;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
        }
        .content {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, strong {
            font-weight: 600;
            color: #111827;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
        }
        h1 {
            font-size: 2rem;
            margin-bottom: 0.5em;
            border-bottom: 2px solid #8B5CF6;
            padding-bottom: 0.5em;
            text-align: center;
        }
        h2 {
            font-size: 1.5rem;
            border-bottom: 1px solid #D1D5DB;
            padding-bottom: 0.3em;
        }
        h3 {
            font-size: 1.25rem;
            color: #8B5CF6;
        }
        h4 {
            font-size: 1.1rem;
            color: #374151;
        }
        p {
            margin-bottom: 1em;
            color: #374151;
            text-align: justify;
        }
        ul {
            list-style-type: disc;
            padding-left: 1.5em;
            margin-bottom: 1em;
        }
        li {
            margin-bottom: 0.5em;
            color: #374151;
        }
        strong {
            color: #111827;
            font-weight: 600;
        }
        .watermark {
            position: fixed;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #9CA3AF;
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0.7;
        }
        .watermark svg {
            width: 16px;
            height: 16px;
        }
        .toc {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .metric-highlight {
            background: #EDE9FE;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="content">
        ${contentToPrint.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                        .replace(/^- (.*$)/gm, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                        .replace(/<\/ul>\s*<ul>/g, '')
                        .replace(/\n/g, '<br/>')}
    </div>
    <div class="watermark">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.11269 14.8873L14.8873 9.11269M9.11269 14.8873C7.23844 16.7616 4.33333 18.2 4.33333 18.2C4.33333 18.2 5.73844 20.7616 7.61269 22.6358C9.48694 24.5101 12.392 23.1 12.392 23.1C12.392 23.1 10.9869 20.1478 9.11269 18.2736C7.23844 16.3993 4.33333 14.8873 4.33333 14.8873" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.392 4.33333C12.392 4.33333 9.48694 2.92822 7.61269 4.80247C5.73844 6.67672 4.33333 9.58183 4.33333 9.58183C4.33333 9.58183 5.73844 12.392 7.61269 14.2662L9.11269 12.7662" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.2 4.33333C18.2 4.33333 20.7616 5.73844 22.6358 7.61269C24.5101 9.48694 23.1 12.392 23.1 12.392C23.1 12.392 20.1478 10.9869 18.2736 9.11269" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Generated by Landr
    </div>
</body>
</html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // The planData is now always an object { content, chart }, so simplify its retrieval.
    const planData = isEditing ? editedContent : report.strategicPlan;

    return (
    <>
        <div className="flex items-center gap-4 mb-8 print:hidden">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-white">Strategic Plan</h1>
                <p className="text-gray-400">Your roadmap for success at {report.companyName}.</p>
            </div>
             <div className="ml-auto flex gap-2">
                <Button onClick={isEditing ? onSave : onEdit} variant="outline" className="text-white border-gray-700 hover:bg-gray-800 hover:border-purple-500">
                    {isEditing ? <><Save className="w-4 h-4 mr-2" />Save Plan</> : <><Edit className="w-4 h-4 mr-2" />Edit Plan</>}
                </Button>
                <Button onClick={handleDownload} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>
        </div>

        {isEditing ? (
             <ReactQuill
                theme="snow"
                value={editedContent.content}
                onChange={(content) => setEditedContent(prev => ({...prev, content}))}
                className="bg-white text-black rounded-md"
                modules={{ toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link'],
                    ['clean']
                ]}}
            />
        ) : (
            <Card className="bg-black border-gray-800">
                <CardContent className="p-8">
                     <div className="prose prose-invert max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-300 prose-strong:text-white prose-headings:text-white prose-li:text-gray-300">
                        <ReactMarkdown>{planData?.content || ''}</ReactMarkdown>
                    </div>

                    {planData?.chart && planData.chart.data && planData.chart.data.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-6 text-white">{planData.chart.title}</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={planData.chart.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis dataKey="name" stroke="#888888" />
                                    <YAxis stroke="#888888" />
                                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} cursor={{fill: 'rgba(167, 139, 250, 0.1)'}}/>
                                    <Legend wrapperStyle={{ color: '#FFFFFF' }}/>
                                    <Bar dataKey="value" fill="#A78BFA" name="Projected Metric" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </>
    );
};

export default function StrategicPlanPage() {
    const [formData, setFormData] = useState({
        companyName: '',
        position: '',
        jobDescription: '',
        companyWebsite: '',
        industry: '',
        linkedinProfileUrl: '',
        resumeText: '',
        linkedInJobUrl: '',
    });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [currentProject, setCurrentProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState({ content: '', chart: null });
    const [user, setUser] = useState(null);
    const [isCheckingUsage, setIsCheckingUsage] = useState(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('project');
        const checkUserAndLoadProject = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (projectId) {
                    const project = await Project.get(projectId);
                    if (project) {
                        setCurrentProject(project);
                        setFormData({
                            companyName: project.companyName || '',
                            position: project.position || '',
                            jobDescription: project.jobDescription || '',
                            companyWebsite: project.companyWebsite || '',
                            industry: project.industry || '',
                            linkedinProfileUrl: project.linkedinProfileUrl || '',
                            resumeText: project.resumeText || '',
                            linkedInJobUrl: project.linkedInJobUrl || '',
                        });
                        if (project.strategicPlan) {
                            // The plan is now always an object
                            setGeneratedReport({ ...project, strategicPlan: project.strategicPlan });
                            setEditedContent(project.strategicPlan);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading user or project:", err);
                setUser(null); // Force login if user or project fetch fails
            } finally {
                setIsCheckingUsage(false);
            }
        };
        checkUserAndLoadProject();
    }, []);

    useEffect(() => {
        if (!isCheckingUsage && !user) {
            User.login();
        }
    }, [isCheckingUsage, user]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setIsLoading(true);
            try {
                // The actual text extraction via LLM happens in handleGeneratePlan
                // For now, just set the file, its text will be pulled in generate.
                // The previous text extraction logic here is moved to handleGeneratePlan for better control.
                setFormData(prev => ({...prev, resumeText: ''})); // Clear previous text if a new file is selected
            } catch (err) {
                setError('Failed to process file. Please try pasting the text instead.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleGeneratePlan = async () => {
        setIsCheckingUsage(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            if (currentUser.plan === 'free' && (currentUser.usageCount || 0) >= 3) {
                window.location.href = createPageUrl('Pricing');
                return;
            }
        } catch (e) {
             window.location.href = createPageUrl('Pricing');
             return;
        } finally {
             setIsCheckingUsage(false);
        }

        setIsLoading(true);
        setError(null);

        let fileUrls = [];
        if (file) {
             try {
                const uploadResult = await UploadFile({ file });
                fileUrls = [uploadResult.file_url];
            } catch (e) {
                setError('Failed to upload or process your resume file. Please try pasting the text instead.');
                setIsLoading(false);
                return;
            }
        }

        if (!formData.companyName || !formData.position || !formData.jobDescription) {
            setError('Please fill in Company Name, Position, and Job Description.');
            setIsLoading(false);
            return;
        }

        const prompt = `You are a senior consultant at a top-tier strategy firm (e.g., McKinsey, Bain, or BCG), specializing in growth and innovation roadmaps for high-growth tech and fintech companies. Your task is to write an in-depth, sleek, and visually structured **Strategic Plan** for a candidate applying for the position of **${formData.position}** at **${formData.companyName}**.

Use the following exact format and tone. The final output must be **cleanly formatted in Markdown**, suitable for a professional preview and PDF export. It must include bullet points, subheaders, clear metrics, and deliverables.

Your final output MUST be a single JSON object matching the provided schema. The 'content' field must contain the full strategic plan in Markdown format, and the 'chart' field must contain the data for visualization.

**CONTEXT FOR THE PLAN:**
- **Company:** ${formData.companyName}
- **Position:** ${formData.position}
- **Website:** ${formData.companyWebsite || 'Not provided'}
- **Industry:** ${formData.industry || 'Not specified'}
- **Job Description:** ${formData.jobDescription.slice(0, 3000)}
- **Candidate's LinkedIn Profile:** ${formData.linkedinProfileUrl || 'Not provided'}
- **Candidate's Resume Text:** ${formData.resumeText.slice(0, 2000) || 'See uploaded file'}
- **LinkedIn Job URL:** ${formData.linkedInJobUrl || 'Not provided'}

---

### TL;DR
Provide a polished executive summary of the entire strategic plan. Include top-line goals across the 3-month, 6-month, and 12-month phases, aligned to the company’s mission and growth needs.

---

### 1. Company Overview & Research
Write a concise overview of the company based on its website and job description. Mention its business model, growth stage, industry position, and competitive edge.

**Key Challenges ${formData.companyName} Faces:**
• Challenge 1
• Challenge 2
• Challenge 3

---

### 2. Strategic 3-Month, 6-Month, and 12-Month Plan
Each time frame includes two **key actions** with structured sub-sections:
• Examples (realistic, role-specific use cases)
• Success Metrics (quantitative)
• Key Deliverables (specific outputs)
• Challenges Addressed (aligned to earlier company challenges)

#### 3-Month Plan
*Quick wins, onboarding, diagnostics*

**Key Action 1: [Descriptive Title]**
• **Examples:**
• **Success Metrics:**
• **Key Deliverables:**
• **Challenges Addressed:**

**Key Action 2: [Descriptive Title]**
(Repeat structure)

#### 6-Month Plan
*Strategic contributions and leadership*

**Key Action 1: [Descriptive Title]**
(Repeat structure)

**Key Action 2: [Descriptive Title]**
(Repeat structure)

#### 12-Month Plan
*Long-term vision, scale, and cultural integration*

**Key Action 1: [Descriptive Title]**
(Repeat structure)

**Key Action 2: [Descriptive Title]**
(Repeat structure)

---

### 3. Conclusion
Close with a confident statement tying the plan together, summarizing impact, commitment, and readiness to drive transformation and growth at ${formData.companyName}.
`;

        const responseSchema = {
            type: "object",
            properties: {
                "content": {
                    "type": "string",
                    "description": "The full, in-depth strategic plan in professional, academic-style Markdown format. This should be a comprehensive document."
                },
                "chart": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "A relevant title for a chart, e.g., 'Projected KPI Growth in Phase 1'"
                        },
                        "data": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {
                                        "type": "string",
                                        "description": "The name of the metric (e.g., 'Q1', 'Metric A')"
                                    },
                                    "value": {
                                        "type": "number",
                                        "description": "A numerical value for the metric."
                                    }
                                },
                                "required": ["name", "value"]
                            },
                            "description": "An array of 3-5 data points for a bar chart visualizing a key success metric from the plan."
                        }
                    },
                    "required": ["title", "data"]
                }
            },
            "required": ["content", "chart"]
        };

        try {
            const planContent = await InvokeLLM({
                prompt,
                response_json_schema: responseSchema,
                file_urls: fileUrls.length > 0 ? fileUrls : undefined,
                add_context_from_internet: true
            });

            const projectData = {
                ...formData,
                resumeUrl: fileUrls[0] || '',
                strategicPlan: planContent
            };

            let projectToUpdate = currentProject;
            if (projectToUpdate) {
                 await Project.update(projectToUpdate.id, projectData);
            } else {
                projectToUpdate = await Project.create({ ...projectData, status: 'planning' });
            }

            const updatedProject = { ...projectToUpdate, ...projectData };
            setGeneratedReport(updatedProject);
            setEditedContent(planContent);

            if (user.plan === 'free') {
                await User.updateMyUserData({ usageCount: (user.usageCount || 0) + 1 });
            }

        } catch (e) {
            console.error('Strategic Plan Generation Error:', e);
            setError('Failed to generate strategic plan. The AI could not process the request. Please check your inputs and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedReport) return;

        try {
            await Project.update(generatedReport.id, { strategicPlan: editedContent });
            setGeneratedReport(prev => ({...prev, strategicPlan: editedContent}));
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to save edited content:", e);
            setError("Failed to save changes. Please try again.");
        }
    };

    if (isCheckingUsage || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-white p-8">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <p className="mt-4 text-lg text-white">{isCheckingUsage ? 'Checking your access...' : 'Crafting your strategic plan...'}</p>
                <p className="text-gray-400">This involves deep research and may take a few moments.</p>
            </div>
        );
    }

    if (generatedReport) {
        return (
             <div>
                <StrategicPlanReport
                    report={generatedReport}
                    onBack={() => {
                        setGeneratedReport(null);
                        setIsEditing(false);
                    }}
                    isEditing={isEditing}
                    onEdit={() => setIsEditing(true)}
                    editedContent={editedContent}
                    setEditedContent={setEditedContent}
                    onSave={handleSave}
                />
             </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <Link to={createPageUrl(currentProject ? 'Projects' : 'Dashboard')}>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Strategic Plan Generator</h1>
                    <p className="text-gray-400">
                        {currentProject ? `For ${currentProject.position} at ${currentProject.companyName}` : 'Create a 3/6/12 month plan to showcase your value'}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-700/50 text-red-300">
                    <AlertTitle>Error Generating Plan</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="bg-black border border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white"><Info className="w-5 h-5 text-purple-400" /> Input Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input placeholder="Company Name *" className="bg-gray-900 border-gray-700 text-white focus:ring-purple-500" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                        <Input placeholder="Position / Role *" className="bg-gray-900 border-gray-700 text-white focus:ring-purple-500" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <Input placeholder="Company Website *" className="bg-gray-900 border-gray-700 text-white focus:ring-purple-500" value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} />
                        <Input placeholder="Industry Name *" className="bg-gray-900 border-gray-700 text-white focus:ring-purple-500" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
                    </div>
                    <Textarea placeholder="Job Description *" className="bg-gray-900 border-gray-700 text-white h-40 focus:ring-purple-500" value={formData.jobDescription} onChange={e => setFormData({...formData, jobDescription: e.target.value})} />

                    <div>
                        <p className="text-sm font-medium text-white mb-2">Your Background (for personalization)</p>
                        <div className="space-y-4">
                            <div className="relative">
                               <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input placeholder="LinkedIn Profile URL" className="bg-gray-900 border-gray-700 text-white pl-9 focus:ring-purple-500" value={formData.linkedinProfileUrl} onChange={e => setFormData({...formData, linkedinProfileUrl: e.target.value})} />
                            </div>
                            <div className="relative">
                               <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                               <Input placeholder="LinkedIn Job URL (Optional)" className="bg-gray-900 border-gray-700 text-white pl-9 focus:ring-purple-500" value={formData.linkedInJobUrl} onChange={e => setFormData({...formData, linkedInJobUrl: e.target.value})} />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Note: For best results, paste your resume text directly. DOCX/PDF parsing can sometimes be inconsistent.</p>
                            <div className="grid md:grid-cols-2 gap-4 items-start">
                                <div className="relative">
                                    <Input type="file" id="resumeFile" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt" />
                                    <label htmlFor="resumeFile" className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white">
                                        {isLoading && file ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5 mb-1" />}
                                        <span>{file ? (isLoading ? 'Processing...' : file.name) : 'Upload Resume'}</span>
                                        <span className="text-xs text-gray-500 mt-1">.pdf, .doc, .docx, .txt</span>
                                    </label>
                                </div>
                                <Textarea placeholder="Or paste resume/background here..." className="bg-gray-900 border-gray-700 text-white h-32 focus:ring-purple-500" value={formData.resumeText} onChange={e => setFormData({...formData, resumeText: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleGeneratePlan} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]">
                           {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CalendarCheck className="w-5 h-5 mr-2"/> Generate Plan</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
