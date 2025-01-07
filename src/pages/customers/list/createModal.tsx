import { useGo, useList } from "@refinedev/core";
import { Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";

export const CustomerCreateModal = () => {
  const go = useGo();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  // Firestore에서 user 데이터 가져오기
  const { data: usersData, isLoading: isLoadingUsers } = useList({
    resource: "user",
  });

  const users = usersData?.data || []; // Firestore의 user 데이터

  const goToListPage = () => {
    go({
      to: { resource: "customers", action: "list" },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  const onFinish = (values: any) => {
    console.log("Created customer:", values);
    goToListPage();
  };

  const {data, isLoading} = useList({
    resource: "user"
  });

  return (
    <Modal
      open={visible}
      onOk={form.submit}
      onCancel={goToListPage}
      mask={true}
      title="Add new customer"
      width={512}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Customer name"
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder="Please enter customer name" />
        </Form.Item>
        <Form.Item
          label="Sales owner"
          name="salesOwnerId"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Please select sales owner"
            options={users.map((user) => ({
              value: user.id,
              label: (
                <SelectOptionWithAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                />
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
