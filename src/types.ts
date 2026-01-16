export interface APIResponse {
  items: YouTubeVideo[];
  nextPageToken?: string; // Thêm dòng này
}

// Interface YouTubeVideo giữ nguyên như cũ
export interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishTime: string;
  };
}
