import { Col, Row } from "antd";
import { DashboardTotalCountCard } from "./components/total-count-card";
import { CalendarUpcomingEvents } from "./components/upcoming-events";
import { DashboardDealsChart } from "./components/deal-chart";
import { DashboardLatestActivities } from "./components/latest-activity";

const fakeTotalCounts = {
  companies: 185,
  contacts: 432,
  deals: 89,
};

export const DashboardPage = () => {
  return (
    <div className="page-container">
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="companies"
            isLoading={false}
            totalCount={fakeTotalCounts.companies}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="contacts"
            isLoading={false}
            totalCount={fakeTotalCounts.contacts}
          />
        </Col>
        <Col xs={24} sm={24} xl={8}>
          <DashboardTotalCountCard
            resource="deals"
            isLoading={false}
            totalCount={fakeTotalCounts.deals}
          />
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col
          xs={24}
          sm={24}
          xl={8}
          style={{
            height: "460px",
          }}
        >
          <CalendarUpcomingEvents />
        </Col>
        <Col
          xs={24}
          sm={24}
          xl={16}
          style={{
            height: "460px",
          }}
        >
          <DashboardDealsChart />
        </Col>
      </Row>

      <Row
        gutter={[32, 32]}
        style={{
          marginTop: "32px",
        }}
      >
        <Col xs={24}>
          <DashboardLatestActivities />
        </Col>
      </Row>
    </div>
  );
};
