import { useState } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PDFUploaderProps {
  onUpload: (file: File) => void;
  uploadedFiles: File[];
  onRemove: (index: number) => void;
}

const PDFUploader = ({ onUpload, uploadedFiles, onRemove }: PDFUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");
    
    if (pdfFile) {
      onUpload(pdfFile);
      toast.success(`Uploaded ${pdfFile.name}`);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onUpload(file);
      toast.success(`Uploaded ${file.name}`);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-8 border-2 border-dashed transition-all ${
          isDragging
            ? "border-primary bg-primary/5 shadow-medium"
            : "border-border hover:border-primary/50 shadow-soft"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full gradient-primary">
            <Upload className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-1">Upload your coursebook</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your PDF here or click to browse
            </p>
            <input
              type="file"
              id="pdf-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileInput}
            />
            <Button asChild variant="default" className="shadow-soft">
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>
        </div>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card className="p-4 shadow-soft">
          <h4 className="font-semibold mb-3">Uploaded PDFs</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PDFUploader;
