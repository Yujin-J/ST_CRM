import { useGo } from "@refinedev/core";
import { Form, Input, Modal, Select } from "antd";
import { useState } from "react";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";

const fakeUsers = [
  {
    id: "1",
    name: "John Doe",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=JS",
  },
  {
    id: "3",
    name: "Bob Wilson",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=BW",
  },
];

export const CustomerCreateModal = () => {
  const go = useGo();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

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
            options={fakeUsers.map((user) => ({
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
