import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CloudUpload, FileSpreadsheet, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useUploadCampaign, useCampaigns } from "@/hooks/useApi";
import type { UploadResult } from "@/lib/types";

export default function UploadLeads() {
  const navigate = useNavigate();
  const uploadMutation = useUploadCampaign();
  const { data: campaigns } = useCampaigns();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type === 'text/csv' || f.name.endsWith('.csv')) {
      setFile(f);
      setResult(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', campaignName || `Campaign ${new Date().toLocaleDateString()}`);

    try {
      const res = await uploadMutation.mutateAsync(formData);
      setResult(res);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const recentCampaigns = (campaigns || []).slice(0, 3);

  // Pre-upload state
  if (!result) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Upload Leads</h1>

        {/* Campaign name */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted-foreground block mb-2">Campaign Name (optional)</label>
          <input
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder={`Campaign ${new Date().toLocaleDateString()}`}
            className="w-full max-w-sm bg-secondary/30 border border-input rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`glass-card-hover border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer group transition-all ${
            dragging ? 'border-primary bg-primary/5' : file ? 'border-success/40' : 'border-primary/30 hover:border-primary/60'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {file ? (
            <>
              <FileSpreadsheet className="w-16 h-16 text-success/60 mb-4" />
              <p className="text-foreground font-semibold text-lg mb-1">{file.name}</p>
              <p className="text-muted-foreground text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <CloudUpload className="w-16 h-16 text-primary/60 group-hover:text-primary transition-colors mb-4" />
              <p className="text-foreground font-semibold text-lg mb-1">Drop your CSV here or click to browse</p>
              <p className="text-muted-foreground text-sm">Supports CSV up to 50MB</p>
            </>
          )}
        </div>

        {file && (
          <div className="flex justify-end mt-4">
            <button onClick={handleUpload} disabled={uploadMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50">
              {uploadMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploadMutation.isPending ? 'Uploading...' : 'Start Processing →'}
            </button>
          </div>
        )}

        {uploadMutation.isError && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {uploadMutation.error?.message || 'Upload failed'}
          </div>
        )}

        {/* Recent uploads */}
        {recentCampaigns.length > 0 && (
          <div className="mt-8">
            <h2 className="text-foreground font-semibold mb-4">Recent Campaigns</h2>
            <div className="grid grid-cols-3 gap-4">
              {recentCampaigns.map((c) => (
                <div key={c.id} className="glass-card-hover p-4 cursor-pointer"
                  onClick={() => navigate(`/research?campaignId=${c.id}`)}>
                  <div className="flex items-center gap-3 mb-3">
                    <FileSpreadsheet className="w-8 h-8 text-primary/60" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.totalLeads.toLocaleString()} leads</span>
                    <span className="status-complete">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Post-upload result
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Upload Complete</h1>

      {/* Validation Summary */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-foreground font-semibold mb-3">Processing Summary</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4" /> {result.validLeads.toLocaleString()} valid leads ready
          </span>
          <span className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" /> {result.skipped} rows skipped
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4" /> {result.duplicates} duplicates found
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(`/research?campaignId=${result.campaignId}`)}
          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200">
          View Processing Progress →
        </button>
        <button onClick={() => { setFile(null); setResult(null); }}
          className="px-6 py-3 bg-secondary/50 text-foreground font-semibold rounded-lg hover:bg-secondary/80 border border-input transition-all duration-200">
          Upload Another
        </button>
      </div>
    </div>
  );
}
