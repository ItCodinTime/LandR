import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, FileUp, Info, Loader2, BarChart2, ThumbsUp, ThumbsDown, Download, Link as LinkIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { Project } from '@/entities/Project';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const RadialProgress = ({ percentage, label }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#374151" // gray-700
                    strokeWidth="3"
                />
                <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray={`${percentage}, 100`}
                />
                 <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{percentage}%</span>
            </div>
        </div>
        <p className="mt-2 text-sm text-gray-400">{label}</p>
    </div>
);

const FitAnalysisReport = ({ report, onBack }) => {
    const handleDownload = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
    <title>Company Fit Report - ${report.position} at ${report.companyName}</title>
    <style>
        @import url('https://rsms.me/inter/inter.css');
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #111827; background: white; margin: 0; padding: 1in; -webkit-print-color-adjust: exact; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
        .header h1 { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0; }
        .header p { font-size: 16px; color: #4b5563; margin: 0; }
        .section { margin-bottom: 30px; }
        .section h2 { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #4f46e5; padding-left: 15px; }
        .fit-metrics { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: center; margin-bottom: 30px; }
        .overall-fit .score { font-size: 48px; font-weight: 800; color: #4f46e5; margin-bottom: 10px; }
        .overall-fit .label { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
        .detailed-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .metric-label { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .metric-bar { height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
        .metric-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 4px; }
        .metric-value { font-size: 14px; font-weight: 600; color: #1f2937; }
        .strengths-weaknesses { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; }
        .strength-box, .weakness-box { padding: 20px; border-radius: 8px; border: 1px solid; }
        .strength-box { background: #f0fdf4; border-color: #dcfce7; }
        .weakness-box { background: #fef2f2; border-color: #fee2e2; }
        .strength-box h3 { color: #166534; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .weakness-box h3 { color: #b91c1c; font-size: 18px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; color: #374151; }
        .watermark { position: fixed; bottom: 20px; right: 20px; font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 5px; opacity: 0.5; }
        .watermark svg { width: 16px; height: 16px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Company Fit Analysis Report</h1>
        <p>${report.position} at ${report.companyName}</p>
    </div>

    <div class="section">
        <h2>Compatibility Assessment</h2>
        <div class="fit-metrics">
            <div class="overall-fit" style="text-align: center;">
                <div class="score">${report.fitReport.overallFit}%</div>
                <div class="label">Overall Fit</div>
            </div>
            <div class="detailed-metrics">
                <div class="metric-item">
                    <div class="metric-label">Skills Match</div>
                    <div class="metric-bar"><div class="metric-fill" style="width: ${report.fitReport.skills}%"></div></div>
                    <div class="metric-value">${report.fitReport.skills}%</div>
                </div>
                <div class="metric-item">
                    <div class="metric-label">Experience</div>
                    <div class="metric-bar"><div class="metric-fill" style="width: ${report.fitReport.experience}%"></div></div>
 
