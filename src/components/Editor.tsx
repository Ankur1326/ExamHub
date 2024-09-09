// components/Editor.tsx
import { useRef, useEffect } from 'react';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

interface EditorProps {
    initialValue?: string;
    onEditorChange?: (content: string) => void;
    apiKey: string; // Your TinyMCE API key
}

const Editor = ({ initialValue, onEditorChange, apiKey }: EditorProps) => {
    const editorRef = useRef<any>(null);

    const handleEditorChange = (content: string) => {
        if (onEditorChange) {
            onEditorChange(content);
        }
    };

    return (
        <TinyMCEEditor
            onInit={(editor: any) => (editorRef.current = editor)}
            initialValue={initialValue}
            init={{
                
                height: 500,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount',
                    'tiny_mce_wiris', // Plugin for math and chemistry
                ],
                external_plugins: {
                    tiny_mce_wiris: 'https://www.wiris.net/demo/plugins/tiny_mce/plugin.js', // Loading the WIRIS plugin from CDN
                  },
                toolbar:
                    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry',
                content_style:
                    'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
            onEditorChange={handleEditorChange}
            apiKey={apiKey}
        />
    );
};

export default Editor;
