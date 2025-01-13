import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { DashboardTotalCountCard } from "./components/total-count-card";
import { CalendarUpcomingEvents } from "./components/upcoming-events";
import { DashboardDealsChart } from "./components/deal-chart";
import { DashboardLatestActivities } from "./components/latest-activity";
import { fetchCollectionCount } from "../../helpers/firebase/firebaseService"; // Firestore 데이터를 가져오는 함수

export const DashboardPage = () => {
  // Firestore 컬렉션 데이터 상태 관리
  const [counts, setCounts] = useState({
    customers: 0,
    contacts: 0,
    interactions: 0,
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

        setCounts({
          customers: customersCount,
          contacts: contactsCount,
          interactions: interactionsCount,
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
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="customers"
            isLoading={isLoading}
            totalCount={counts.customers}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="contacts"
            isLoading={isLoading}
            totalCount={counts.contacts}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="interactions"
            isLoading={isLoading}
            totalCount={counts.interactions}
          />
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ marginTop: "32px" }}>
        <Col xs={24} sm={24} xl={8} style={{ height: "460px" }}>
          <CalendarUpcomingEvents />
        </Col>
        <Col xs={24} sm={24} xl={16} style={{ height: "460px" }}>
          <DashboardDealsChart />
        </Col>
      </Row>

      <Row gutter={[32, 32]} style={{ marginTop: "32px" }}>
        <Col xs={24}>
          <DashboardLatestActivities />
        </Col>
      </Row>
    </div>
  );
};
