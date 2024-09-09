'use client'
import { useState } from 'react';
// import dynamic from 'next/dynamic';

export default function Dashboard() {
    const [content, setContent] = useState<string>('');
    const apiKey = 'rmu0izos7rryo0k697oqhgpm6y96bln99xlzutgii5gausl1';

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <div className="w-full h-screen flex items-center justify-center ">
            <p className="text-3xl opacity-35">
                Dashboard
            </p>
        </div>
    );
}