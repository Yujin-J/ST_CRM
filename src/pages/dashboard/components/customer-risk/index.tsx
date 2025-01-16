import React, { useEffect, useState } from "react";
import { Card, List, Typography } from "antd";
import { fetchCustomerRiskData } from "../../../../helpers/firebase/firebaseService";

interface Customer {
  id: string;
  name: string;
  riskLevel: string;
  daysSinceCreation: number; // 가입 후 지난 일수
  totalRevenue: number; // 총 매출
}

export const CustomerRisk: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCustomerRiskData();

        // 고객 데이터에 추가 정보를 계산하여 포함
        const enrichedCustomers = data.map((customer) => {
          const now = new Date();
          const createdAt = new Date(customer.created_at);
          const daysSinceCreation = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            ...customer,
            daysSinceCreation,
          };
        });

        // 위험도가 높은 순으로 정렬 (High > Medium > Low)
        const sortedCustomers = enrichedCustomers.sort((a, b) => {
          const riskOrder = { High: 1, Medium: 2, Low: 3 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        });

        // 상위 limit만 저장
        setCustomers(sortedCustomers.slice(0, limit));
      } catch (err) {
        console.error("Error fetching customer risk data:", err);
        setError("Failed to fetch customer data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  // 위험도별 색상 설정
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return { color: "red", fontWeight: "bold" };
      case "Medium":
        return { color: "orange", fontWeight: "bold" };
      case "Low":
        return { color: "green", fontWeight: "bold" };
      default:
        return { color: "black", fontWeight: "bold" };
    }
  };

  if (loading) {
    return (
      <Card
        title="Customer Churn Risk"
        headStyle={{ padding: "16px" }}
        bodyStyle={{ padding: "16px" }}
      >
        Loading customer risk data...
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title="Customer Churn Risk"
        headStyle={{ padding: "16px" }}
        bodyStyle={{ padding: "16px" }}
      >
        {error}
      </Card>
    );
  }

  return (
    <Card
      title="Top 5 Customer Churn Risk"
      headStyle={{ padding: "16px" }}
      bodyStyle={{ padding: "0 1rem" }}
    >
      <List
        itemLayout="horizontal"
        dataSource={customers}
        renderItem={(customer) => (
          <List.Item>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Typography.Text strong>{customer.name}:</Typography.Text>
              <Typography.Text style={getRiskColor(customer.riskLevel)}>
                {customer.riskLevel}
              </Typography.Text>
              <Typography.Text type="secondary">
                Days: {customer.daysSinceCreation}
              </Typography.Text>
              <Typography.Text type="secondary">
                Revenue: ${customer.totalRevenue.toFixed(2)}
              </Typography.Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CustomerRisk;
