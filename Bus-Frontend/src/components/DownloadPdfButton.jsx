import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadReport } from '../api';
export default function DownloadPdfButton({ type, params, children = 'Download PDF' }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try { await downloadReport(type, params); }
    catch { toast.error('Unable to download PDF. Please try again.'); }
    finally { setBusy(false); }
  };
  return <button type="button" className="secondary-button" disabled={busy} aria-busy={busy} onClick={download}><Download size={16} />{busy ? 'Preparing PDF...' : children}</button>;
}
