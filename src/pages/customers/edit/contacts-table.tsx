import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MailOutlined,
  PhoneOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Select, Space, Table } from "antd";
import { Text } from "../../../components/text";
import { CustomAvatar } from "../../../components/custom-avatar";
import { ContactStatusTag } from "../../../components/tags";
import { useList } from "@refinedev/core";

const statusOptions = [
  { label: "New", value: "NEW" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Unqualified", value: "UNQUALIFIED" },
  { label: "Won", value: "WON" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Lost", value: "LOST" },
  { label: "Interested", value: "INTERESTED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Churned", value: "CHURNED" },
];

export const CustomerContactsTable = () => {
  const params = useParams(); // URL 파라미터
  const [nameFilter, setNameFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // 서버에서 데이터 가져오기
  const { data, isLoading } = useList({
    resource: "contact",
  });

  // 클라이언트 사이드에서 필터링
  const filteredContacts = useMemo(() => {
    const contacts = data?.data || [];
  
    return contacts.filter((contact) => {
      // name과 jobTitle이 존재하는지 확인
      const nameMatch = contact.name
        ? contact.name.toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      const titleMatch = contact.jobTitle
        ? contact.jobTitle.toLowerCase().includes(titleFilter.toLowerCase())
        : true;
      const statusMatch =
        statusFilter.length === 0 || statusFilter.includes(contact.status);
  
      return (
        contact.customer?.id === params?.id && nameMatch && titleMatch && statusMatch
      );
    });
  }, [data?.data, params?.id, nameFilter, titleFilter, statusFilter]);

  // 로딩 상태 처리
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 렌더링
  return (
    <Card
      headStyle={{ borderBottom: "1px solid #D9D9D9", marginBottom: "1px" }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <TeamOutlined />
          <Text>Contacts</Text>
        </Space>
      }
      extra={
        <>
          <Text className="tertiary">Total contacts: </Text>
          <Text strong>{filteredContacts.length}</Text>
        </>
      }
    >
      <Table
        dataSource={filteredContacts} // 필터링된 데이터를 테이블에 표시
        rowKey="id"
        pagination={{ showSizeChanger: false }}
      >
        <Table.Column
          title="Name"
          dataIndex="name"
          render={(_, record) => (
            <Space>
              <CustomAvatar name={record.name} src={record.avatarUrl} />
              <Text style={{ whiteSpace: "nowrap" }}>{record.name}</Text>
            </Space>
          )}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <Input
              placeholder="Search Name"
              onChange={(e) => setNameFilter(e.target.value)} // 이름 필터 적용
            />
          )}
        />
        <Table.Column
          title="Title"
          dataIndex="jobTitle"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <Input
              placeholder="Search Title"
              onChange={(e) => setTitleFilter(e.target.value)} // 직함 필터 적용
            />
          )}
        />
        <Table.Column
          title="Stage"
          dataIndex="status"
          render={(status) => <ContactStatusTag status={status} />}
          filterDropdown={(props) => (
            <Select
              style={{ width: "200px" }}
              mode="multiple"
              placeholder="Select Stage"
              options={statusOptions}
              onChange={setStatusFilter} // 상태 필터 적용
            />
          )}
        />
        <Table.Column
          dataIndex="id"
          width={112}
          render={(_, record) => (
            <Space>
              <Button
                size="small"
                href={`mailto:${record.email}`}
                icon={<MailOutlined />}
              />
              <Button
                size="small"
                href={`tel:${record.phone}`}
                icon={<PhoneOutlined />}
              />
            </Space>
          )}
        />
      </Table>
    </Card>
  );
};