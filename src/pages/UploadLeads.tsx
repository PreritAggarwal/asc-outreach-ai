import { useState } from "react";
import { CloudUpload, FileSpreadsheet, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

const recentUploads = [
  { name: "healthcare_leads_q1.csv", date: "Mar 28, 2025", rows: 300, status: "Processed" },
  { name: "logistics_batch_02.csv", date: "Mar 22, 2025", rows: 800, status: "Processed" },
  { name: "tech_startups_leads.csv", date: "Mar 15, 2025", rows: 200, status: "Processed" },
];

const columnMappings = [
  { detected: "Name", mapped: "Name", valid: true },
  { detected: "Email", mapped: "Email", valid: true },
  { detected: "Company", mapped: "Company", valid: true },
  { detected: "LinkedIn URL", mapped: "LinkedIn URL", valid: true },
  { detected: "Job Title", mapped: "Title", valid: true },
];

export default function UploadLeads() {
  const [uploaded, setUploaded] = useState(false);

  if (!uploaded) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Upload Leads</h1>

        {/* Drop zone */}
        <div
          onClick={() => setUploaded(true)}
          className="glass-card-hover border-2 border-dashed border-primary/30 hover:border-primary/60 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer group"
        >
          <CloudUpload className="w-16 h-16 text-primary/60 group-hover:text-primary transition-colors mb-4" />
          <p className="text-foreground font-semibold text-lg mb-1">Drop your CSV here or click to browse</p>
          <p className="text-muted-foreground text-sm">Supports CSV up to 50MB</p>
        </div>

        {/* Recent uploads */}
        <div className="mt-8">
          <h2 className="text-foreground font-semibold mb-4">Recently Uploaded</h2>
          <div className="grid grid-cols-3 gap-4">
            {recentUploads.map((u) => (
              <div key={u.name} className="glass-card-hover p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileSpreadsheet className="w-8 h-8 text-primary/60" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{u.rows.toLocaleString()} rows</span>
                  <span className="status-complete">{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Column Mapping</h1>

      {/* Column mapping table */}
      <div className="glass-card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-left border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <th className="px-5 py-3 font-medium">Detected Column</th>
              <th className="px-5 py-3 font-medium">Mapped Field</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {columnMappings.map((c) => (
              <tr key={c.detected} className="border-t transition-colors hover:bg-secondary/30" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <td className="px-5 py-3 text-foreground font-medium">{c.detected}</td>
                <td className="px-5 py-3">
                  <select className="bg-secondary/50 border border-input rounded-md px-3 py-1.5 text-foreground text-sm">
                    <option>{c.mapped}</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-foreground font-semibold mb-3">Validation Summary</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2 text-success">
            <CheckCircle className="w-4 h-4" /> 2,488 valid leads ready
          </span>
          <span className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-4 h-4" /> 12 rows skipped (missing email)
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4" /> 0 duplicates found
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all duration-200">
          Start Processing →
        </button>
      </div>
    </div>
  );
}
