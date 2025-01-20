import React, { useState, useEffect } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestoreDatabase_base as db } from "../../../../helpers/firebase/firebaseConfig";

type RecentFeedbackData = {
  review: string;
  sentiment: string;
  score: number;
  createdAt: string; // 추가: ISO 형식의 날짜 및 시간
};

export const DashboardRecentReviews = ({ limit = 5 }: { limit?: number }) => {
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedbackData[]>([]);

  useEffect(() => {
    const fetchRecentFeedback = async () => {
      try {
        const interactionRef = collection(db, "interaction");
        const q = query(interactionRef, orderBy("created_at", "desc")); // 수정: created_at 기준 정렬
        const querySnapshot = await getDocs(q);

        const feedbackData: RecentFeedbackData[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            review: data.notes || "", // notes 필드 가져오기
            sentiment: data.classification?.Classification || "Unknown", // classification.Classification 가져오기
            score: data.classification?.Sentiment_score || 0, // classification.Sentiment_score 가져오기
            createdAt: data.created_at || "", // created_at 필드 추가
          };
        });

        setRecentFeedback(feedbackData.slice(0, limit)); // Limit the number of feedback entries
      } catch (error) {
        console.error("Error fetching recent feedback:", error);
      }
    };

    fetchRecentFeedback();
  }, [limit]);

  const getColorBySentiment = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "negative review":
        return "red";
      case "positive review":
        return "green";
      case "neutral review":
        return "gold";
      default:
        return "black"; // 기본 색상
    }
  };

  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{
        padding: "0 1rem",
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SmileOutlined />
          <Typography.Text style={{ marginLeft: ".5rem" }}>
            Recent Feedback Highlights
          </Typography.Text>
        </div>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={recentFeedback}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text
              strong
              style={{ color: getColorBySentiment(item.sentiment) }}
            >
              {item.sentiment}:
            </Typography.Text>{" "}
            {item.review} (Score: {item.score})
            <br />
            <Typography.Text type="secondary">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : ""}
            </Typography.Text>
          </List.Item>
        )}
      />
    </Card>
  );
};
