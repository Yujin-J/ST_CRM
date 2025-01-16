import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { DashboardTotalCountCard } from "./components/total-count-card";
import { OverallSentiment } from "./components/overall-sentiment";
import { SentimentAnalysisDashboard } from "./components/sentiment-trends";
import { DashboardRecentReviews } from "./components/recent-review";
import { fetchCollectionCount, fetchNewUsersCount } from "../../helpers/firebase/firebaseService"; // Firestore 데이터를 가져오는 함수
import CustomerRisk from "./components/customer-risk"; // 새로 추가된 컴포넌트

export const DashboardPage = () => {
  // Firestore 컬렉션 데이터 상태 관리
  const [counts, setCounts] = useState({
    customers: 0,
    contacts: 0,
    interactions: 0,
    newUsers: 0, // 신규 사용자 데이터 추가
  });
  const [isLoading, setIsLoading] = useState(true);

  // Firestore 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const customersCount = await fetchCollectionCount("customer");
        const contactsCount = await fetchCollectionCount("contact");
        const interactionsCount = await fetchCollectionCount("interaction");

        // 신규 사용자 데이터 가져오기 (이번 주 기준)
      const newUsersCount = await fetchNewUsersCount("customer", 7); // Firestore helper에 새 함수 구현 필요
      
        setCounts({
          customers: customersCount,
          contacts: contactsCount,
          interactions: interactionsCount,
          newUsers: newUsersCount, // 상태 업데이트
        });
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
<div className="page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
  <Row gutter={[32, 32]}>
    <Col xs={24} sm={24} xl={6}>
      <DashboardTotalCountCard resource="customers" isLoading={isLoading} totalCount={counts.customers} />
    </Col>
    <Col xs={24} sm={24} xl={6}>
      <DashboardTotalCountCard resource="contacts" isLoading={isLoading} totalCount={counts.contacts} />
    </Col>
    <Col xs={24} sm={24} xl={6}>
      <DashboardTotalCountCard resource="interactions" isLoading={isLoading} totalCount={counts.interactions} />
    </Col>
    <Col xs={24} sm={24} xl={6}>
      <DashboardTotalCountCard resource="newUsers" isLoading={isLoading} totalCount={counts.newUsers} />
    </Col>
  </Row>

  <Row gutter={[32, 32]} style={{ marginTop: "32px" }}>
    <Col xs={24} sm={24} xl={8} style={{ height: "430px" }}>
      <OverallSentiment />
    </Col>
    <Col xs={24} sm={24} xl={16} style={{ height: "430px" }}>
      <SentimentAnalysisDashboard />
    </Col>
  </Row>

  <Row gutter={[32, 32]} style={{ marginTop: "32px" }}>
    <Col xs={24} sm={24} xl={12} style={{ height: "400px" }}>
      <CustomerRisk />
    </Col>
    <Col xs={24} sm={24} xl={12} style={{ height: "400px" }}>
      <DashboardRecentReviews />
    </Col>
  </Row>
</div>

  );
};
