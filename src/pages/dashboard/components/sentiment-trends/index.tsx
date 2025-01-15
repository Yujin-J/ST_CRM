import React, { useState, useEffect } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Line, type LineConfig } from "@ant-design/plots";
import { Card, Typography } from "antd";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestoreDatabase_base as db } from "../../../../helpers/firebase/firebaseConfig";

type InteractionData = {
  classification: { Classification: string; Sentiment_score: number };
  date: string;
  notes: string;
};

export const SentimentAnalysisDashboard = () => {
  const [sentimentTrends, setSentimentTrends] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interactionRef = collection(db, "interaction");
        const q = query(interactionRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const data: InteractionData[] = querySnapshot.docs.map((doc) => doc.data() as InteractionData);

        // **2. Sentiment Trends**
        const trends = data.reduce((acc, curr) => {
          const date = curr.date;
          const classification = curr.classification.Classification;
          if (!acc[date]) acc[date] = { date, Positive: 0, Neutral: 0, Negative: 0 };
          acc[date][classification.split(" ")[0]] += 1; // Positive, Neutral, Negative
          return acc;
        }, {} as Record<string, any>);

        const sortedTrends = Object.values(trends).sort(
          (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setSentimentTrends(
          sortedTrends.flatMap((trend: any) => [
            { time: trend.date, value: trend.Positive, type: "Positive" },
            { time: trend.date, value: trend.Neutral, type: "Neutral" },
            { time: trend.date, value: trend.Negative, type: "Negative" },
          ])
        );
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchData();
  }, []);

  // **Sentiment Trends Line Graph Configuration**
  const sentimentConfig: LineConfig = {
    data: sentimentTrends,
    xField: "time",
    yField: "value",
    seriesField: "type",
    smooth: false, // 부드러운 곡선을 제거
    animation: true,
    color: ({ type }) =>
      type === "Positive" ? "#52C41A" : type === "Neutral" ? "#FAAD14" : "#F5222D",
    point: {
      size: 5,
      shape: "circle",
    },
    lineStyle: {
      lineDash: [0, 0], // 점선 제거
    },
    tooltip: {
      formatter: (data) => ({
        name: data.type,
        value: `${data.value} reviews`,
      }),
    },
    yAxis: {
      min: 0,
      max: 5, // 모든 그래프가 동일한 최대값 사용
    },
  };

  return (
    <div>
      {/* Sentiment Trends */}
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SmileOutlined />
            <Typography.Text>Sentiment Trends</Typography.Text>
          </div>
        }
        style={{ marginBottom: "16px" }}
      >
        <Line {...sentimentConfig} height={325} />
      </Card>
    </div>
  );
};
