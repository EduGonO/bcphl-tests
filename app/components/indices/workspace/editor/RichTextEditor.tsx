import React from 'react';
import RichTextEditorQuill from './RichTextEditor.Quill';

type Props = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
};

const RichTextEditor: React.FC<Props> = (props) => <RichTextEditorQuill {...props} />;

export default RichTextEditor;
