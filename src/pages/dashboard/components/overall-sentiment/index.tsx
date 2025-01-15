import { Pie, type PieConfig } from "@ant-design/plots";
import { Card, Typography } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { firestoreDatabase_base as db } from "../../../../helpers/firebase/firebaseConfig";

export const OverallSentiment = () => {
  const [overallSentiment, setOverallSentiment] = useState<{ type: string; value: number }[]>([]);

  useEffect(() => {
    const fetchOverallSentiment = async () => {
      try {
        const interactionRef = collection(db, "interaction");
        const q = query(interactionRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => doc.data());

        const sentimentCounts = data.reduce(
          (acc, curr) => {
            const classification = curr.classification.Classification;
            if (classification === "Positive Review") acc.Positive += 1;
            else if (classification === "Neutral Review") acc.Neutral += 1;
            else if (classification === "Negative Review") acc.Negative += 1;
            return acc;
          },
          { Positive: 0, Neutral: 0, Negative: 0 }
        );

        const total = sentimentCounts.Positive + sentimentCounts.Neutral + sentimentCounts.Negative;

        setOverallSentiment([
          { type: "Positive", value: (sentimentCounts.Positive / total) * 100 },
          { type: "Neutral", value: (sentimentCounts.Neutral / total) * 100 },
          { type: "Negative", value: (sentimentCounts.Negative / total) * 100 },
        ]);
      } catch (error) {
        console.error("Error fetching overall sentiment:", error);
      }
    };

    fetchOverallSentiment();
  }, []);

  const overallSentimentConfig: PieConfig = {
    data: overallSentiment,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    label: {
      type: "inner",
      content: ({ percent }) => `${Math.round(percent * 100)}%`,
      style: { fontSize: 14, fontWeight: "bold", textAlign: "center", lineHeight: "1" },
      autoRotate: false,
    },
    color: ({ type }) =>
      type === "Positive" ? "#52C41A" : type === "Neutral" ? "#FAAD14" : "#F5222D",
    tooltip: {
      formatter: (data) => ({
        name: data.type,
        value: `${Math.round(data.value)}%`,
      }),
    },
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SmileOutlined />
          <Typography.Text>Overall Sentiment</Typography.Text>
        </div>
      }
    >
      <Pie {...overallSentimentConfig} height={200} />
    </Card>
  );
};
