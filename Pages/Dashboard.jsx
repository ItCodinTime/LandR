import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, BarChart, CheckCircle, Clock, Calendar, Briefcase, Copy, Trash } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, subtext, trendIcon: TrendIcon, trendColor }) => (
    <Card className="bg-black border border-gray-800 transition-all hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
            <Icon className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
        </CardContent>
    </Card>
);

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserAndProjects = async () => {
            setIsLoading(true);
            try {
                let currentUser;
                try {
                    currentUser = await User.me();
                } catch (userError) {
                    console.log("User not authenticated, using demo mode");
                    currentUser = { email: 'demo@landr.com', full_name: 'Demo User' };
                }
                setUser(currentUser);
                
                if (currentUser && currentUser.email) {
                    const projectList = await Project.list();
                    setProjects(projectList);
                }
            } catch (error) {
                console.error("Error fetching user or projects:", error);
                setProjects([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndProjects();
    }, []);
    
    const stats = {
        totalProjects: projects.length,
        inProgress: projects.filter(p => p.status === 'in_progress' || p.status === 'planning' || p.status === 'submitted' || p.status === 'interviewing').length,
        offers: projects.filter(p => p.status === 'offer_received').length,
        thisMonth: projects.filter(p => new Date(p.created_date) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Career Dashboard</h1>
                    <p className="text-gray-400">Track your strategic job applications and career progress</p>
                </div>
                <div className="flex gap-4">
                    <Link to={createPageUrl('Projects')}>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                 {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i} className="bg-black border border-gray-800">
                            <CardHeader><Skeleton className="h-5 w-24 bg-gray-800" /></CardHeader>
                            <CardContent><Skeleton className="h-8 w-12 bg-gray-800" /><Skeleton className="h-4 w-28 mt-2 bg-gray-800" /></CardContent>
                        </Card>
                    ))
                 ) : (
                    <>
                        <StatCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} subtext="Active applications" />
                        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} subtext="Applications & interviews" />
                        <StatCard title="Offers Received" value={stats.offers} icon={CheckCircle} subtext="Successful applications" />
                        <StatCard title="This Month" value={stats.thisMonth} icon={Calendar} subtext="New projects created" />
                    </>
                 )}
            </div>

            {/* Recent Projects */}
            <Card className="bg-black border border-gray-800">
                <CardHeader className="flex justify-between items-center flex-row">
                    <CardTitle className="text-white">Recent Projects</CardTitle>
                    <Link to={createPageUrl('Projects')}>
                        <Button variant="ghost" className="text-purple-400 hover:text-purple-300">View All →</Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-gray-900/50">
                                <TableHead className="text-white">Project</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                <TableRow key={i} className="border-gray-800">
                                    <TableCell><div className="flex items-center gap-4"><Skeleton className="h-10 w-10 rounded-lg bg-gray-800" /><div className="space-y-2"><Skeleton className="h-4 w-48 bg-gray-800" /><Skeleton className="h-3 w-32 bg-gray-800" /></div></div></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full bg-gray-800" /></TableCell>
                                    <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8 rounded bg-gray-800" /><Skeleton className="h-8 w-8 rounded bg-gray-800" /></div></TableCell>
                                </TableRow>
                                ))
                            ) : projects.length === 0 ? (
                                <TableRow className="border-gray-800">
                                    <TableCell colSpan={3} className="text-center py-12 text-gray-500">
                                        No projects yet. Start by creating a new project.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projects.slice(0, 5).map(project => (
                                <TableRow key={project.id} className="border-gray-800 hover:bg-gray-900/50">
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg">
                                                <Briefcase className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{project.position} - {project.companyName}</p>
                                                <p className="text-sm text-gray-400">Created on {new Date(project.created_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-900/30 capitalize">{project.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Link to={createPageUrl('Projects') + `?companyName=${encodeURIComponent(project.companyName)}`}>
                                                <Button variant="ghost" size="icon"><FileText className="w-4 h-4 text-gray-400 hover:text-white" /></Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
