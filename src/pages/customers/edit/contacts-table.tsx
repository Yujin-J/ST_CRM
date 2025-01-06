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

const fakeContacts = [
  {
    id: "1",
    name: "John Smith",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JS",
    email: "john@example.com",
    phone: "+1234567890",
    jobTitle: "Sales Manager",
    status: "QUALIFIED",
    customer: { id: "1" },
  },
  {
    id: "2",
    name: "Emma Wilson",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=EW",
    email: "emma@example.com",
    phone: "+1234567891",
    jobTitle: "Account Executive",
    status: "NEW",
    customer: { id: "1" },
  },
  {
    id: "3",
    name: "Michael Brown",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MB",
    email: "michael@example.com",
    phone: "+1234567892",
    jobTitle: "Sales Representative",
    status: "NEGOTIATION",
    customer: { id: "1" },
  },
];

const statusOptions = [
  { label: "New", value: "NEW" },
  {
    label: "Qualified",
    value: "QUALIFIED",
  },
  {
    label: "Unqualified",
    value: "UNQUALIFIED",
  },
  {
    label: "Won",
    value: "WON",
  },
  {
    label: "Negotiation",
    value: "NEGOTIATION",
  },
  {
    label: "Lost",
    value: "LOST",
  },
  {
    label: "Interested",
    value: "INTERESTED",
  },
  {
    label: "Contacted",
    value: "CONTACTED",
  },
  {
    label: "Churned",
    value: "CHURNED",
  },
];

export const CustomerContactsTable = () => {
  const params = useParams();
  const [nameFilter, setNameFilter] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Fetch contacts data from Firebase
  const { data, isLoading } = useList({
    resource: "contact",
    filters: [
      {
        field: "customer",
        operator: "eq",
        value: params?.id,
      },
    ],
  });

  // Apply client-side filtering
  const filteredContacts = useMemo(() => {
    const contacts = data?.data || [];

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        contact.jobTitle.toLowerCase().includes(titleFilter.toLowerCase()) &&
        (statusFilter.length === 0 || statusFilter.includes(contact.status))
    );
  }, [data?.data, nameFilter, titleFilter, statusFilter]);

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
        dataSource={filteredContacts}
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
              onChange={(e) => setNameFilter(e.target.value)}
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
              onChange={(e) => setTitleFilter(e.target.value)}
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
              onChange={setStatusFilter}
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
