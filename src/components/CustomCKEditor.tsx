'use client'
import React from 'react';
import dynamic from 'next/dynamic';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CustomCKEditorProps {
    content: string;
    setContent: (content: string) => void;
}

// Use dynamic import and explicitly cast the component type
const CKEditor = dynamic<any>(() =>
    import('@ckeditor/ckeditor5-react').then((module) => module.CKEditor), { ssr: false }
);

const CustomCKEditor: React.FC<CustomCKEditorProps> = ({ content, setContent }) => {
    return (
        <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event: any, editor: any) => setContent(editor.getData())}
        />
    );
}

export default CustomCKEditor;