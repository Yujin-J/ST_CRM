import React, { useState } from "react";
import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
} from "@refinedev/antd";
import { useGo, useList} from "@refinedev/core";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table } from "antd";
import { PaginationTotal } from "../../../components/pagination-total";
import { CustomAvatar } from "../../../components/custom-avatar";
import { Text } from "../../../components/text";
import { currencyNumber } from "../../../utilities/currency-number";
import { useDelete } from "@refinedev/core"
import { firestoreDataProvider } from "../../../helpers/firebase/firebaseConfig"
import { Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons"

export const CustomerListPage = ({ children }: React.PropsWithChildren) => {
  const go = useGo();
  const [searchText, setSearchText] = useState("");

  // Firestore에서 customer 및 user 데이터 가져오기
  const { data, isLoading } = useList({ resource: "customer" });
  const { data: usersData, isLoading: isUsersLoading } = useList({
    resource: "user",
  });

  // 데이터 변환
  const customers = data?.data || [];
  const users = usersData?.data || [];

  // user 데이터를 Map 형태로 변환 (id를 키로 사용)
  const userMap = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  // 검색 필터링
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const {mutate: deleteCustomer } = useDelete();

  const handleDelete = (id) => {
    deleteCustomer(
      { resource: "customer", id:id },
      {
        onSuccess: () => console.log(`Customer ${id} deleted successfully.`),
        onError: (error) => console.error("Delete failed:", error),
      }
    );
  };

  return (
    <>
      <List
        breadcrumb={false}
        headerButtons={() => (
          <CreateButton
            onClick={() => go({ to: { resource: "customers", action: "create" } })}
          />
        )}
      >
        <Table
          dataSource={filteredCustomers}
          pagination={{
            total: filteredCustomers.length,
            pageSize: 12,
            pageSizeOptions: ["12", "24", "48", "96"],
          }}
          rowKey="id"
        >
          <Table.Column
            dataIndex="name"
            title="Customer Name"
            render={(_, record) => (
              <Space>
                <CustomAvatar
                  shape="square"
                  name={record.name}
                  src={record.avatarUrl}
                />
                <Text>{record.name}</Text>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="salesOwner"
            title="Sales Owner"
            render={(_, customer) => {
              const salesOwnerId = customer.salesOwner?.id;
              const salesOwner = userMap[salesOwnerId]; // userMap에서 해당 ID로 찾기

              if (!salesOwner) return "No Owner Found"; // 데이터가 없을 경우 처리

              return (
                <Space>
                  <CustomAvatar
                    shape="circle"
                    name={salesOwner.name}
                    src={salesOwner.avatarUrl} // 프로필 사진
                  />
                  <Text>{salesOwner.name}</Text> {/* 이름 */}
                </Space>
              );
            }}
          />
          <Table.Column
            fixed="right"
            dataIndex="id"
            title="Actions"
            render={(value) => (
              <Space>
                <EditButton hideText size="small" recordItemId={value} />
                <Popconfirm
                  title="Are you sure you want to delete this customer?"
                  onConfirm={() => handleDelete(value)}
                >
                  <button
                    style={{
                      background: "none",
                      border: "1px solid #d9d9d9",
                      borderRadius: "4px",
                      cursor: "pointer",
                      padding: "4px",
                      color: "red",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <DeleteOutlined />
                  </button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </List>
      {children}
    </>
  );
};