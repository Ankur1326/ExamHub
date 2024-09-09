'use client'
import { useState } from 'react';
// import dynamic from 'next/dynamic';

// const Editor = dynamic(() => import("@/components/Editor"), { ssr: false })

export default function Dashboard() {
    const [content, setContent] = useState<string>('');
    const apiKey = 'rmu0izos7rryo0k697oqhgpm6y96bln99xlzutgii5gausl1';

    const handleEditorChange = (newContent: string) => {
        setContent(newContent);
    };

    return (
        <div className="w-full h-screen flex items-center justify-center ">
            {/* <p className="text-3xl opacity-35">
                Dashboard
            </p> */}

            <div>
                {/* <h1>TinyMCE Editor with Math & Chemistry Support</h1> */}
                {/* <Editor
                    initialValue="<p>This is the initial content of the editor</p>"
                    onEditorChange={handleEditorChange}
                    apiKey={apiKey}
                /> */}
                {/* <div>
                    <h2>Content Output:</h2>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div> */}
            </div>
        </div>
    );
}