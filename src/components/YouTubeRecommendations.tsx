import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface YouTubeRecommendationsProps {
  pdfContent: string;
  apiKey: string;
  openRouterKey: string;
}

const YouTubeRecommendations = ({ pdfContent, apiKey, openRouterKey }: YouTubeRecommendationsProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customTopic, setCustomTopic] = useState("");

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      let topics = customTopic;
      
      // If no custom topic provided, use AI to extract topics from PDF
      if (!customTopic && pdfContent) {
        const topicsResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Study Buddy",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
              {
                role: "system",
                content: "Extract 3-5 key educational topics from this content. Return only comma-separated topics, nothing else.",
              },
              {
                role: "user",
                content: pdfContent.slice(0, 2000),
              },
            ],
          }),
        });

        const topicsData = await topicsResponse.json();
        topics = topicsData.choices[0].message.content;
      }

      // Search YouTube for educational videos on these topics
      const youtubeResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          topics + " educational tutorial"
        )}&type=video&maxResults=6&key=${apiKey}`
      );

      if (!youtubeResponse.ok) {
        throw new Error("Failed to fetch YouTube videos");
      }

      const youtubeData = await youtubeResponse.json();
      const videoList: YouTubeVideo[] = youtubeData.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
      }));

      setVideos(videoList);
      toast.success("Found recommended videos!");
    } catch (error) {
      console.error("YouTube recommendations error:", error);
      toast.error("Failed to fetch video recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-soft border-border/50">
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Youtube className="h-5 w-5 text-destructive" />
          Video Recommendations
        </h2>
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter specific topic (optional)"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={getRecommendations}
            disabled={isLoading || (!pdfContent && !customTopic)}
            className="shadow-soft"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding...
              </>
            ) : (
              "Get Videos"
            )}
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {pdfContent ? "Click 'Get Videos' to find educational content" : "Upload a PDF first"}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-medium transition-shadow border-border/50">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};

export default YouTubeRecommendations;
