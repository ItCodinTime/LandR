import React, { useState, useEffect } from 'react';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Briefcase, ChevronDown, ChevronRight, FileText, BarChart2, CalendarCheck, Presentation, Send, Trash, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showNewProject, setShowNewProject] = useState(false);
    const [newProject, setNewProject] = useState({ companyName: '', position: '' });
    const [openFolders, setOpenFolders] = useState({});

    useEffect(() => {
        const fetchUserAndProjects = async () => {
            setIsLoading(true);
            try {
                let currentUser;
                try {
                    currentUser = await User.me();
                } catch (userError) {
                    console.log("User not authenticated, falling back to demo mode if available or empty state");
                    currentUser = { email: 'demo@landr.com', full_name: 'Demo User' };
                }
                setUser(currentUser);
                
                if (currentUser && currentUser.email) {
                    await loadProjects();
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndProjects();
    }, []);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const companyName = params.get('companyName');
        if (companyName) {
            setOpenFolders(prev => ({ ...prev, [companyName]: true }));
        }
    }, [projects]);

    const loadProjects = async () => {
        try {
            const projectList = await Project.list('-created_date');
            setProjects(projectList);
        } catch (error) {
            console.error("Error loading projects:", error);
            setProjects([]);
        }
    };

    const createProject = async () => {
        if (!newProject.companyName || !newProject.position || !user) return;
        
        try {
            await Project.create({
                ...newProject,
                status: 'planning'
            });
            
            setNewProject({ companyName: '', position: '' });
            setShowNewProject(false);
            await loadProjects();
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project. Please try again.");
        }
    };
    
    const deleteProject = async (projectId, e) => {
        e.stopPropagation();
        if(window.confirm('Are you sure you want to delete this project and all its data?')) {
            try {
                await Project.delete(projectId);
                await loadProjects();
            } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete project.");
            }
        }
    };
    
    const groupedProjects = projects.reduce((acc, project) => {
        const { companyName } = project;
        if (!acc[companyName]) {
            acc[companyName] = [];
        }
        acc[companyName].push(project);
        return acc;
    }, {});
    
    const toggleFolder = (companyName) => {
        setOpenFolders(prev => ({...prev, [companyName]: !prev[companyName]}));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Projects</h1>
                    <p className="text-gray-400">Manage your job application projects</p>
                </div>
                <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border-gray-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input 
                                placeholder="Company Name" 
                                className="bg-gray-900 border-gray-700" 
                                value={newProject.companyName} 
                                onChange={(e) => setNewProject({...newProject, companyName: e.target.value})} 
                            />
                            <Input 
                                placeholder="Position / Role" 
                                className="bg-gray-900 border-gray-700"
                                value={newProject.position}
                                onChange={(e) => setNewProject({...newProject, position: e.target.value})} 
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-white border-gray-700 hover:bg-gray-800" onClick={() => setShowNewProject(false)}>Cancel</Button>
                            <Button className="bg-purple-600 hover:bg-purple-700" onClick={createProject}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            {isLoading ? (
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full bg-gray-800" />)}
                </div>
            ) : Object.keys(groupedProjects).length === 0 ? (
                 <div className="text-center py-16 text-gray-500">
                    <Briefcase className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium text-white">No projects yet</h3>
                    <p className="mt-1">Get started by creating a new project.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(groupedProjects).map(([companyName, companyProjects]) => (
                        <Card key={companyName} className="bg-black border border-gray-800 overflow-hidden">
                            <CardHeader onClick={() => toggleFolder(companyName)} className="cursor-pointer flex flex-row items-center justify-between p-4 hover:bg-gray-900/50">
                                <div className="flex items-center gap-3">
                                    {openFolders[companyName] ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                                    <Briefcase className="w-6 h-6 text-purple-400"/>
                                    <CardTitle className="text-white">{companyName}</CardTitle>
                                </div>
                                <Badge variant="secondary" className="bg-gray-700 text-gray-300">{companyProjects.length} {companyProjects.length > 1 ? 'roles' : 'role'}</Badge>
                            </CardHeader>
                            {openFolders[companyName] && (
                                <CardContent className="p-4 space-y-3">
                                    {companyProjects.map(project => (
                                        <div key={project.id} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div className="flex-grow">
                                                <h4 className="font-semibold text-white">{project.position}</h4>
                                                <p className="text-sm text-gray-400">Created: {new Date(project.created_date).toLocaleDateString()}</p>
                                                <Badge variant="outline" className="mt-2 border-yellow-400/50 text-yellow-400 bg-yellow-900/30 capitalize">{project.status}</Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Link to={createPageUrl(`CompanyReport?project=${project.id}`)}><Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800"><BarChart2 className="w-4 h-4 mr-2"/>Report</Button></Link>
                                                <Link to={createPageUrl(`StrategicPlan?project=${project.id}`)}><Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800"><CalendarCheck className="w-4 h-4 mr-2"/>Plan</Button></Link>
                                                <Link to={createPageUrl(`SlideBuilder?project=${project.id}`)}><Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800"><Presentation className="w-4 h-4 mr-2"/>Slides</Button></Link>
                                                <Link to={createPageUrl(`Outreach?project=${project.id}`)}><Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800"><Send className="w-4 h-4 mr-2"/>Outreach</Button></Link>
                                                <Button variant="ghost" size="icon" onClick={(e) => deleteProject(project.id, e)} className="text-red-500 hover:bg-red-900/50"><Trash className="w-4 h-4"/></Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
