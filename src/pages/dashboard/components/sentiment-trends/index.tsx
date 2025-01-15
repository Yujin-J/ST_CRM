import React, { useState, useEffect } from "react";
import { SmileOutlined } from "@ant-design/icons";
import { Area, type AreaConfig } from "@ant-design/plots";
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

        setSentimentTrends(
          Object.values(trends).flatMap((trend: any) => [
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
  const sentimentConfig: AreaConfig = {
    data: sentimentTrends,
    xField: "time",
    yField: "value",
    seriesField: "type",
    smooth: true,
    animation: true,
    color: ({ type }) =>
      type === "Positive" ? "#52C41A" : type === "Neutral" ? "#FAAD14" : "#F5222D",
    areaStyle: () => ({ fillOpacity: 0.1 }),
    tooltip: {
      formatter: (data) => ({
        name: data.type,
        value: `${data.value} reviews`,
      }),
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
        <Area {...sentimentConfig} height={325} />
      </Card>
    </div>
  );
};
