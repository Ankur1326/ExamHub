'use client'
import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Math from '@isaul32/ckeditor5-math/src/math';
import AutoformatMath from '@isaul32/ckeditor5-math/src/autoformatmath';

interface CustomCKEditorProps {
    content: string;
    setContent: (content: string) => void;
}

// Use dynamic import and explicitly cast the component type
const CKEditor = dynamic<any>(() =>
    import('@ckeditor/ckeditor5-react').then((module) => module.CKEditor), { ssr: false }
);

const CustomCKEditor: React.FC<CustomCKEditorProps> = ({ content, setContent }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Load MathJax
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.6/MathJax.js?config=TeX-MML-AM_CHTML';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (typeof MathJax !== 'undefined') {
                // Configure MathJax
                MathJax.Hub.Config({
                    tex2jax: {
                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                        displayMath: [['$$', '$$'], ['\\[', '\\]']]
                    }
                });
            }
        };
    }, []);

    const editorConfiguration = {
        plugins: [Math, AutoformatMath],
        toolbar: [
            'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList',
            'blockQuote', 'insertTable', 'undo', 'redo', '|', 'math'
        ],
        math: {
            engine: 'mathjax', // Use MathJax engine
            outputType: 'script', // MathJax output type
            forceOutputType: false, // Allow both script and span types
            enablePreview: true,
        },
    };

    return (
        <CKEditor
            editor={ClassicEditor}
            data={content}
            config={editorConfiguration}
            onReady={(editor: any) => {
                editorRef.current = editor;
            }}
            onChange={(event: any, editor: any) => setContent(editor.getData())}
        />
    );
}

export default CustomCKEditor;