import React from "react";
import { SimpleEditor } from "../../../tiptap-templates/simple/simple-editor";

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

const RichTextEditorTipTap: React.FC<RichTextEditorTipTapProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = "Écrivez ici…",
  imageUploadSlug,
}) => {
  return (
    <SimpleEditor
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      imageUploadSlug={imageUploadSlug}
    />
  );
};

export default RichTextEditorTipTap;
