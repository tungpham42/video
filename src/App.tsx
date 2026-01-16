import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Modal,
  Spin,
  message,
  Empty,
  ConfigProvider,
  Button,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  YoutubeFilled,
  DownOutlined,
  FilterFilled,
  ReloadOutlined, // Import icon Reset
} from "@ant-design/icons";
import axios from "axios";
import { YouTubeVideo, APIResponse } from "./types";
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Meta } = Card;

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

// Hàm tiện ích giải mã HTML entities
const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const App: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // State tìm kiếm
  const [query, setQuery] = useState<string | null>(null); // Từ khóa đang kích hoạt
  const [searchInput, setSearchInput] = useState<string>(""); // Từ khóa trong ô nhập liệu (MỚI)

  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter State
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [duration, setDuration] = useState<string>("any");

  const fetchVideos = async (
    searchQuery: string | null,
    pageToken?: string,
    sortOrder: string = "relevance",
    videoDuration: string = "any"
  ) => {
    if (!API_KEY) {
      message.error("Missing API Key!");
      return;
    }

    setLoading(true);
    try {
      const q = searchQuery || "Relaxing Lo-Fi Music";

      const params: any = {
        part: "snippet",
        maxResults: 12,
        key: API_KEY,
        type: "video",
        q: q,
        pageToken: pageToken,
        order: sortOrder,
      };

      if (videoDuration !== "any") {
        params.videoDuration = videoDuration;
      }

      const response = await axios.get<APIResponse>(BASE_URL, { params });

      if (pageToken) {
        setVideos((prev) => [...prev, ...response.data.items]);
      } else {
        setVideos(response.data.items);
      }

      setNextPageToken(response.data.nextPageToken || null);
    } catch (error) {
      console.error(error);
      message.error("Could not fetch videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(query, undefined, sortBy, duration);
  }, []); // eslint-disable-line

  const onSearch = (value: string) => {
    if (value.trim()) {
      setQuery(value);
      setNextPageToken(null);
      fetchVideos(value, undefined, sortBy, duration);
    }
  };

  // --- HÀM RESET MỚI ---
  const handleReset = () => {
    setSearchInput(""); // Xóa ô tìm kiếm
    setQuery(null); // Reset query về null (sẽ load Lo-Fi)
    setSortBy("relevance"); // Reset bộ lọc
    setDuration("any"); // Reset bộ lọc
    setNextPageToken(null);

    // Gọi lại API với trạng thái mặc định
    fetchVideos(null, undefined, "relevance", "any");
    message.success("Filters reset!");
  };

  // ... (Giữ nguyên handleLoadMore, handleSortChange, handleDurationChange, handleVideoClick, handleCloseModal)
  const handleLoadMore = () => {
    if (nextPageToken) fetchVideos(query, nextPageToken, sortBy, duration);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setNextPageToken(null);
    fetchVideos(query, undefined, value, duration);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    setNextPageToken(null);
    fetchVideos(query, undefined, sortBy, value);
  };

  const handleVideoClick = (videoId: string) => {
    setSelectedVideo(videoId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Theme Config giữ nguyên
  const themeConfig = {
    token: {
      fontFamily: "'Roboto', sans-serif",
      colorPrimary: "#fa541c",
      colorBgLayout: "#fdfbf7",
      borderRadius: 12,
      colorText: "#2c3e50",
    },
    components: {
      Input: {
        activeBorderColor: "#fa541c",
        hoverBorderColor: "#ff7a45",
        controlHeightLG: 48,
      },
      Button: {
        colorPrimary: "#fa541c",
      },
      Select: {
        controlHeight: 40,
        borderRadius: 20,
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Header */}
        <Header
          className="app-header"
          style={{
            padding: "0 24px",
            height: "auto",
            minHeight: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="logo-container" onClick={handleReset}>
            {" "}
            {/* Click logo cũng reset cho tiện */}
            <YoutubeFilled style={{ fontSize: "36px", color: "#fa541c" }} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                lineHeight: 1,
              }}
            >
              <Title
                level={4}
                style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}
              >
                Tube<span style={{ color: "#fa541c" }}>Cozy</span>
              </Title>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: "600px", margin: "0 20px" }}>
            <Input
              placeholder="Search for something inspiring..."
              prefix={
                <SearchOutlined
                  style={{
                    color: "#fa541c",
                    fontSize: "20px",
                    marginRight: "8px",
                  }}
                />
              }
              allowClear
              size="large"
              // Cập nhật để input được quản lý (Controlled Input)
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => onSearch(searchInput)}
              style={{
                borderRadius: "50px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                border: "1px solid #eee",
                padding: "8px 24px",
                fontSize: "16px",
                backgroundColor: "#fff",
              }}
            />
          </div>
          <div style={{ display: "none" }} className="header-action"></div>
        </Header>

        <Content style={{ padding: "40px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Toolbar Area */}
            <div
              style={{
                marginBottom: "32px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "end",
                gap: "20px",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <Title level={2} style={{ fontWeight: 300, margin: 0 }}>
                  {query ? (
                    <span>
                      Results for{" "}
                      <span
                        style={{
                          fontWeight: 700,
                          borderBottom: "2px solid #fa541c",
                        }}
                      >
                        {query}
                      </span>
                    </span>
                  ) : (
                    <span>
                      Discover{" "}
                      <span style={{ fontWeight: 700, color: "#fa541c" }}>
                        Trending
                      </span>{" "}
                      Videos
                    </span>
                  )}
                </Title>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  {query
                    ? "We found these specifically for you."
                    : "Curated selection for a cozy viewing experience."}
                </Text>
              </div>

              {/* Filter Section with Reset Button */}
              <Space size="middle">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <FilterFilled
                    style={{ color: "#fa541c", fontSize: "18px" }}
                  />
                  <Text strong style={{ color: "#555", marginRight: "4px" }}>
                    Filters:
                  </Text>
                </div>

                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  bordered={false}
                  popupMatchSelectWidth={false}
                  dropdownStyle={{ borderRadius: "12px", padding: "8px" }}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    paddingLeft: "8px",
                    width: 140,
                  }}
                >
                  <Option value="relevance">Relevance</Option>
                  <Option value="date">Newest</Option>
                  <Option value="viewCount">Most Viewed</Option>
                  <Option value="rating">Top Rated</Option>
                </Select>

                <Select
                  value={duration}
                  onChange={handleDurationChange}
                  bordered={false}
                  dropdownStyle={{ borderRadius: "12px", padding: "8px" }}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    paddingLeft: "8px",
                    width: 140,
                  }}
                >
                  <Option value="any">Any Duration</Option>
                  <Option value="short">Short (&lt; 4m)</Option>
                  <Option value="medium">Medium (4-20m)</Option>
                  <Option value="long">Long (&gt; 20m)</Option>
                </Select>

                {/* --- NÚT RESET Ở ĐÂY --- */}
                <Tooltip title="Reset all filters & search">
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    style={{
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#888",
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  />
                </Tooltip>
              </Space>
            </div>

            {/* Grid Video (Giữ nguyên) */}
            <Row gutter={[32, 32]}>
              {videos.map((video, index) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={`${video.id.videoId}-${index}`}
                >
                  <Card
                    className="video-card"
                    hoverable
                    cover={
                      <div style={{ overflow: "hidden", height: 180 }}>
                        <img
                          alt={decodeHtml(video.snippet.title)} // Sửa cả alt cho chuẩn
                          src={
                            video.snippet.thumbnails.high?.url ||
                            video.snippet.thumbnails.medium?.url
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    }
                    onClick={() => handleVideoClick(video.id.videoId)}
                  >
                    <Meta
                      // Sửa phần Title: Dùng decodeHtml()
                      title={
                        <div
                          className="card-meta-title"
                          title={decodeHtml(video.snippet.title)}
                        >
                          {decodeHtml(video.snippet.title)}
                        </div>
                      }
                      description={
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {/* Sửa phần Channel Title: Dùng decodeHtml() nếu cần */}
                          <Text
                            strong
                            style={{ fontSize: "12px", color: "#fa541c" }}
                          >
                            {decodeHtml(video.snippet.channelTitle)}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {new Date(
                              video.snippet.publishTime
                            ).toLocaleDateString("vi")}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Load More Section (Giữ nguyên) */}
            <div
              style={{
                textAlign: "center",
                marginTop: "40px",
                paddingBottom: "20px",
              }}
            >
              {loading ? (
                <Spin size="large" tip="Loading more..." />
              ) : (
                nextPageToken &&
                videos.length > 0 && (
                  <Button
                    type="default"
                    shape="round"
                    size="large"
                    onClick={handleLoadMore}
                    icon={<DownOutlined />}
                    style={{
                      padding: "0 40px",
                      height: "50px",
                      fontSize: "16px",
                      border: "1px solid #fa541c",
                      color: "#fa541c",
                      background: "transparent",
                    }}
                  >
                    Load More
                  </Button>
                )
              )}
              {!loading && videos.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No videos found."
                />
              )}
            </div>
          </div>
        </Content>

        {/* Modal (Giữ nguyên) */}
        <Modal
          className="video-modal"
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
          width={900}
          destroyOnClose
          centered
          maskStyle={{
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          {selectedVideo && (
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </div>
          )}
        </Modal>

        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            color: "#888",
          }}
        >
          TubeCozy ©{new Date().getFullYear()} — Designed with{" "}
          <span style={{ color: "#fa541c" }}>♥</span>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
