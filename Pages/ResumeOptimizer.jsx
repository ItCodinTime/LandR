import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Presentation, Palette, Type, Download, AlertCircle, ArrowLeft, ArrowRight, Edit, Save, Layout, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InvokeLLM } from '@/integrations/Core';
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

const themes = {
    modern: {
        primary: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
        text: 'text-white',
        accent: 'text-purple-400',
        secondary: 'text-gray-300'
    },
    professional: {
        primary: 'bg-gradient-to-r from-blue-700 to-blue-900',
        text: 'text-white',
        accent: 'text-blue-200',
        secondary: 'text-blue-100'
    },
    vibrant: {
        primary: 'bg-gradient-to-tr from-purple-600 to-red-500',
        text: 'text-white',
        accent: 'text-yellow-300',
        secondary: 'text-pink-100'
    },
    minimal: {
        primary: 'bg-white',
        text: 'text-black',
        accent: 'text-blue-600',
        secondary: 'text-gray-600'
    },
    dark: {
        primary: 'bg-gray-900',
        text: 'text-white',
        accent: 'text-green-400',
        secondary: 'text-gray-300'
    }
};

const fonts = {
    inter: 'font-sans',
    roboto: 'font-mono',
    georgia: 'font-serif'
};

const Slide = ({ slide, theme, font, isEditing, onContentChange, slideOptions }) => {
    const currentTheme = themes[theme];
    const currentFont = fonts[font];

    return (
        <Card className={`w-full aspect-video flex flex-col justify-center items-center p-8 transition-all duration-300 ${currentTheme.primary} ${currentFont} relative overflow-hidden`}>
            {slideOptions.showNumbers && (
                <div className={`absolute top-4 right-4 ${currentTheme.secondary} text-sm`}>
                    {slide.slideNumber || '1'}
                </div>
            )}
            
            <div className="text-center w-full max-w-full overflow-hidden z-10">
                {isEditing ? (
                    <div className="space-y-4">
                        <Input
                            value={slide.title}
                            onChange={(e) => onContentChange('title', e.target.value)}
                            className={`text-4xl font-bold bg-transparent border-0 text-center focus:ring-0 ${currentTheme.text}`}
                            placeholder="Slide Title"
                        />
                        <Textarea
                            value={slide.content}
                            onChange={(e) => onContentChange('content', e.target.value)}
                            className={`text-lg w-full bg-transparent border-0 text-center focus:ring-0 h-48 resize-none ${currentTheme.text}`}
                            placeholder="Slide content..."
                        />
                    </div>
                ) : (
                    <>
                        <h2 className={`text-4xl font-bold mb-4 ${currentTheme.text}`}
                            style={{ fontSize: `${slideOptions.titleSize}px` }}>
                            {slide.title}
                        </h2>
                        <div className={`prose max-w-none text-lg ${currentTheme.secondary}`}
                             style={{ fontSize: `${slideOptions.contentSize}px` }}>
                            <ReactMarkdown>{slide.content}</ReactMarkdown>
                        </div>
                    </>
                )}
            </div>
            
            {slideOptions.showLogo && (
                <div className="absolute bottom-4 left-4 opacity-30">
                    <div className="text-sm font-bold">Landr</div>
                </div>
            )}
        </Card>
    );
};

export default function SlideBuilderPage() {
    const [projects, setProjects] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [theme, setTheme] = useState('modern');
    const [font, setFont] = useState('inter');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [slideOptions, setSlideOptions] = useState({
        titleSize: 32,
        contentSize: 18,
        showNumbers: true,
        showLogo: true
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsData, userData] = await Promise.all([Project.list(), User.me()]);
                setProjects(projectsData);
                setUser(userData);
            } catch (e) {
                console.error("Failed to load data", e);
                setUser({ full_name: 'Demo User' });
            }
        };
        loadData();
    }, []);

    const generateSlides = async () => {
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project || !project.strategicPlan) {
            setError('Selected project does not have a strategic plan.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSlides([]);
        setCurrentSlide(0);

        const planContent = typeof project.strategicPlan === 'string' ? project.strategicPlan : project.strategicPlan.content;
        const todaysDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const prompt = `You are a presentation design expert. Convert the following strategic plan into a JSON array of professional presentation slides.

        **Requirements:**
        1. **Title Slide:** Include:
           - Title: "Strategic Plan: ${project.position}"
           - Presenter: "${user?.full_name || 'Presenter'}"
           - Date: "${todaysDate}"
           - Company: "${project.companyName}"

        2. **Content Structure:** Create 8-12 slides total including:
           - Title slide
           - Agenda/Overview
           - Company Analysis (1-2 slides)
           - 3-Month Plan (2 slides)
           - 6-Month Plan (2 slides)
           - 12-Month Plan (2 slides)
           - Conclusion/Next Steps

        3. **Content Guidelines:**
           - Keep each slide focused and concise
           - Use bullet points and clear headings
           - Include specific metrics and deliverables
           - Make content suitable for executive presentation

        **Strategic Plan:**
        ${planContent.slice(0, 4000)}

        Return a JSON object with a "slides" array. Each slide should have:
        - title: string
        - content: string (in Markdown format)
        - slideNumber: number`;

        const responseSchema = {
            type: "object",
            properties: {
                slides: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            content: { type: "string" },
                            slideNumber: { type: "number" }
                        },
                        required: ["title", "content", "slideNumber"]
                    }
                }
            }
        };

        try {
            const result = await InvokeLLM({ prompt, response_json_schema: responseSchema });
            if (result.slides && result.slides.length > 0) {
                setSlides(result.slides);
            } else {
                setError('AI could not generate slides from this plan. Try a different project.');
            }
        } catch (e) {
            setError('An error occurred while generating slides.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<!DOCTYPE html><html><head><title>Presentation</title>');
        printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">');
        printWindow.document.write(`
            <style>
                @page { size: landscape; margin: 0; }
                body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                .slide-container {
                    page-break-after: always;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    box-sizing: border-box;
                }
                .theme-modern { background: linear-gradient(to bottom right, #374151, #1f2937, #000000); color: white; }
                .theme-professional { background: linear-gradient(to right, #1d4ed8, #1e3a8a); color: white; }
                .theme-vibrant { background: linear-gradient(to top right, #9333ea, #ef4444); color: white; }
                .theme-minimal { background: white; color: black; }
                .theme-dark { background: #111827; color: white; }
                .font-sans { font-family: ui-sans-serif, system-ui, sans-serif; }
                .font-mono { font-family: ui-monospace, monospace; }
                .font-serif { font-family: ui-serif, Georgia, serif; }
            </style>
        `);
        printWindow.document.write('</head><body>');

        slides.forEach((slideItem, index) => {
            const themeClass = `theme-${theme}`;
            const fontClass = fonts[font].replace('font-', '');
            
            printWindow.document.write(`
                <div class="slide-container ${themeClass} ${fontClass}">
                    ${slideOptions.showNumbers ? `<div style="position: absolute; top: 2rem; right: 2rem; opacity: 0.7;">${index + 1}</div>` : ''}
                    <div style="text-center; width: 100%; max-width: 100%; overflow: hidden; z-index: 10;">
                        <h2 style="font-size: ${slideOptions.titleSize}px; font-weight: bold; margin-bottom: 1rem;">${slideItem.title}</h2>
                        <div style="font-size: ${slideOptions.contentSize}px; line-height: 1.6;">${slideItem.content.replace(/\n/g, '<br>')}</div>
                    </div>
                    ${slideOptions.showLogo ? '<div style="position: absolute; bottom: 2rem; left: 2rem; opacity: 0.3; font-weight: bold;">Landr</div>' : ''}
                </div>
            `);
        });

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
    };
    
    const handleSlideContentChange = (field, value) => {
        const newSlides = [...slides];
        newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
        setSlides(newSlides);
    };

    return (
        <div className="p-8 bg-gray-900 text-white min-h-screen">
            <div className="flex justify-between items-center mb-8 print:hidden">
                <h1 className="text-3xl font-bold text-white">Slide Builder</h1>
            </div>
            
            {!slides.length && !isLoading && (
                <Card className="bg-black border-gray-800 p-8 max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Create a Presentation</h2>
                    <p className="text-gray-400 mb-6">Select a project with a strategic plan to begin.</p>
                     {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <div className="flex gap-4">
                        <Select onValueChange={setSelectedProjectId} value={selectedProjectId}>
                            <SelectTrigger className="bg-gray-900 border-gray-700 w-full text-white">
                                <SelectValue placeholder="Select a project..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id} disabled={!p.strategicPlan}>{p.companyName} - {p.position}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={generateSlides} disabled={!selectedProjectId} className="bg-purple-600 hover:bg-purple-700">
                            <Presentation className="w-4 h-4 mr-2" /> Generate
                        </Button>
                    </div>
                </Card>
            )}

            {isLoading && (
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-500" />
                    <p className="mt-4 text-white">AI is building your slides...</p>
                </div>
            )}
            
            {slides.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow">
                         <Slide 
                            slide={slides[currentSlide]} 
                            theme={theme} 
                            font={font} 
                            isEditing={isEditing}
                            onContentChange={handleSlideContentChange}
                            slideOptions={slideOptions}
                        />
                    </div>
                    <div className="lg:w-80 flex-shrink-0 space-y-6 print:hidden">
                        <Card className="bg-black border-gray-800 p-4">
                            <h3 className="text-lg font-semibold mb-4 text-white">Controls</h3>
                             <div className="flex items-center justify-between mb-4">
                                <Button variant="outline" onClick={() => setCurrentSlide(s => Math.max(0, s-1))} disabled={currentSlide === 0} className="text-white border-gray-600">
                                    <ArrowLeft className="w-4 h-4"/>
                                </Button>
                                <span className="text-gray-400">{currentSlide + 1} / {slides.length}</span>
                                <Button variant="outline" onClick={() => setCurrentSlide(s => Math.min(slides.length-1, s+1))} disabled={currentSlide === slides.length-1} className="text-white border-gray-600">
                                    <ArrowRight className="w-4 h-4"/>
                                </Button>
                            </div>
                            <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="w-full text-white border-gray-600">
                                {isEditing ? <><Save className="w-4 h-4 mr-2" />Save</> : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                            </Button>
                        </Card>
                        
                        <Tabs defaultValue="design" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                                <TabsTrigger value="design" className="text-white data-[state=active]:bg-purple-600">Design</TabsTrigger>
                                <TabsTrigger value="options" className="text-white data-[state=active]:bg-purple-600">Options</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="design" className="space-y-4">
                                <Card className="bg-black border-gray-800 p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Theme & Style</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm mb-2 text-white"><Palette className="w-4 h-4"/> Theme</label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger className="bg-gray-900 border-gray-700 text-white"><SelectValue/></SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                                    <SelectItem value="modern">Modern Dark</SelectItem>
                                                    <SelectItem value="professional">Professional Blue</SelectItem>
                                                    <SelectItem value="vibrant">Vibrant</SelectItem>
                                                    <SelectItem value="minimal">Minimal Light</SelectItem>
                                                    <SelectItem value="dark">Simple Dark</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-sm mb-2 text-white"><Type className="w-4 h-4"/> Font</label>
                                            <Select value={font} onValueChange={setFont}>
                                                <SelectTrigger className="bg-gray-900 border-gray-700 text-white"><SelectValue/></SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                                    <SelectItem value="inter">Inter (Sans)</SelectItem>
                                                    <SelectItem value="roboto">Roboto (Mono)</SelectItem>
                                                    <SelectItem value="georgia">Georgia (Serif)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="options" className="space-y-4">
                                <Card className="bg-black border-gray-800 p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-white">Slide Options</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-white mb-2 block">Title Size: {slideOptions.titleSize}px</label>
                                            <Slider
                                                value={[slideOptions.titleSize]}
                                                onValueChange={([value]) => setSlideOptions(prev => ({...prev, titleSize: value}))}
                                                min={24}
                                                max={48}
                                                step={2}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-white mb-2 block">Content Size: {slideOptions.contentSize}px</label>
                                            <Slider
                                                value={[slideOptions.contentSize]}
                                                onValueChange={([value]) => setSlideOptions(prev => ({...prev, contentSize: value}))}
                                                min={14}
                                                max={24}
                                                step={1}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="showNumbers"
                                                checked={slideOptions.showNumbers}
                                                onChange={(e) => setSlideOptions(prev => ({...prev, showNumbers: e.target.checked}))}
                                                className="rounded"
                                            />
                                            <label htmlFor="showNumbers" className="text-sm text-white">Show slide numbers</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="showLogo"
                                                checked={slideOptions.showLogo}
                                                onChange={(e) => setSlideOptions(prev => ({...prev, showLogo: e.target.checked}))}
                                                className="rounded"
                                            />
                                            <label htmlFor="showLogo" className="text-sm text-white">Show Landr logo</label>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                        
                        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleDownload}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
