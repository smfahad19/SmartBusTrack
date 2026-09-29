import { DialogTitle, IconButton } from '@mui/material';
import { X } from 'lucide-react';

export default function DialogHeader({ children, onClose, disabled = false, id }) {
  return <DialogTitle id={id} className="dialog-title-with-close">
    <span>{children}</span>
    <IconButton type="button" className="dialog-close-button" aria-label="Close popup" title="Close" disabled={disabled} onClick={onClose}>
      <X size={20}/>
    </IconButton>
  </DialogTitle>;
}
