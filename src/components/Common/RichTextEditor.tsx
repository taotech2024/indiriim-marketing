import React, { useEffect, useRef } from 'react';
import { Box, IconButton, Paper, Stack } from '@mui/material';
import TablerIcon from './TablerIcon';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, minHeight = 180 }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string) => {
    document.execCommand(command);
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          px: 1,
          py: 0.5,
          bgcolor: theme => theme.palette.action.hover
        }}
      >
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => exec('bold')}>
            <TablerIcon name="bold" size="sm" />
          </IconButton>
          <IconButton size="small" onClick={() => exec('italic')}>
            <TablerIcon name="italic" size="sm" />
          </IconButton>
          <IconButton size="small" onClick={() => exec('underline')}>
            <TablerIcon name="underline" size="sm" />
          </IconButton>
          <IconButton size="small" onClick={() => exec('insertUnorderedList')}>
            <TablerIcon name="list-numbers" size="sm" />
          </IconButton>
        </Stack>
      </Box>
      <Box
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        sx={{
          px: 1.5,
          py: 1,
          minHeight,
          fontSize: 14,
          outline: 'none',
          '&:empty:before': {
            content: `"${placeholder || ''}"`,
            color: 'text.disabled'
          }
        }}
      />
    </Paper>
  );
};

export default RichTextEditor;

