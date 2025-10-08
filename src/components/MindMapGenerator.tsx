import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Network } from "lucide-react";
import { toast } from "sonner";

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  level: number;
}

interface MindMapGeneratorProps {
  pdfContent: string;
  apiKey: string;
}

const MindMapGenerator = ({ pdfContent, apiKey }: MindMapGeneratorProps) => {
  const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMindMap = async () => {
    if (!pdfContent) {
      toast.error("Please upload a PDF first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Study Buddy",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: [
            {
              role: "system",
              content: `Analyze the document and create a hierarchical mind map structure. Return ONLY valid JSON in this format:
{
  "id": "root",
  "label": "Main Topic",
  "level": 0,
  "children": [
    {
      "id": "1",
      "label": "Subtopic 1",
      "level": 1,
      "children": [
        {
          "id": "1.1",
          "label": "Key Point 1.1",
          "level": 2
        }
      ]
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Create a mind map from this content:\n\n${pdfContent.slice(0, 4000)}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      setMindMap(parsed);
      toast.success("Mind map generated!");
    } catch (error) {
      console.error("Mind map generation error:", error);
      toast.error("Failed to generate mind map");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportMindMapAsPNG = () => {
    const canvas = document.getElementById("mindmap-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = "mind-map.png";
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Mind map exported!");
  };

  const renderNode = (node: MindMapNode, isExpanded = true) => {
    const [expanded, setExpanded] = useState(isExpanded);

    return (
      <div key={node.id} className="ml-6 my-2">
        <div
          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
            node.level === 0
              ? "gradient-primary text-primary-foreground font-bold"
              : node.level === 1
              ? "bg-secondary/10 border-l-4 border-secondary"
              : "bg-muted/50 border-l-2 border-muted-foreground"
          }`}
          onClick={() => node.children && setExpanded(!expanded)}
        >
          {node.children && (
            <span className="text-xs">{expanded ? "▼" : "▶"}</span>
          )}
          <span>{node.label}</span>
        </div>
        {expanded && node.children && (
          <div className="ml-4">
            {node.children.map((child) => renderNode(child, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6 shadow-soft border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Network className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Mind Map Generator</h2>
        </div>
        {mindMap && (
          <Button onClick={exportMindMapAsPNG} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>
        )}
      </div>

      {!mindMap ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Generate a visual outline of your study material
          </p>
          <Button onClick={generateMindMap} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Mind Map"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <canvas id="mindmap-canvas" className="hidden" />
          <div className="overflow-auto max-h-96 border border-border rounded-lg p-4">
            {renderNode(mindMap)}
          </div>
          <Button onClick={generateMindMap} variant="outline" className="w-full">
            Regenerate
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MindMapGenerator;
