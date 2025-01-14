import { useGo, useList, useCreate } from "@refinedev/core";
import { Form, Input, Modal, Select, DatePicker } from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";

export const InteractionCreateModal = () => {
  const go = useGo();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  // 1) contacts 데이터 가져오기 (이름 + 아바타용)
  const { data: contactsData } = useList({
    resource: "contact",
  });
  const contacts = contactsData?.data || [];

  // 2) interaction 생성 useCreate 훅
  const { mutate: createInteraction } = useCreate();

  // 모달 닫고 리스트 페이지로 이동
  const goToInteractionListPage = () => {
    go({
      to: { resource: "interaction", action: "list" },
      options: { keepQuery: true },
      type: "replace",
    });
  };

  // 폼 전송 처리
  const onFinish = (values: any) => {
    // 날짜를 Date 객체 혹은 문자열로 저장하고 싶다면 이곳에서 변환
    // 예) 문자열로 저장할 경우:
    const dateValue = values.date ? dayjs(values.date).format("YYYY-MM-DD") : "";

    // interaction에 필요한 필드만 추출
    const payload = {
      contact_id: values.contact_id || "",
      date: dateValue,
      notes: values.notes || "",
      // classification, sentiment 등의 필드는 사용자가 직접 입력하지 않으므로 생략
      // 예: classification: "",
      //     sentiment: "",
    };

    createInteraction(
      {
        resource: "interaction",
        values: payload,
      },
      {
        onSuccess: () => {
          console.log("Interaction created successfully:", payload);
          goToInteractionListPage(); // 생성 후 이동
        },
        onError: (error) => {
          console.error("Failed to create interaction:", error);
        },
      }
    );
  };

  return (
    <Modal
      open={visible}
      onOk={form.submit}
      onCancel={goToInteractionListPage}
      mask={true}
      title="Add New Interaction"
      width={512}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Contact 선택 */}
        <Form.Item
          label="Contact"
          name="contact_id"
          rules={[{ required: true, message: "Please select a contact" }]}
        >
          <Select
            placeholder="Select a contact"
            // contact db에 있는 name, avatarUrl 정보를 띄워주고 value는 contact의 id
            options={contacts.map((contact) => ({
              value: contact.id ?? "",
              label: (
                <SelectOptionWithAvatar
                  name={contact.name}
                  avatarUrl={contact.avatarUrl} // 없으면 placeholder 또는 이니셜처리
                />
              ),
            }))}
          />
        </Form.Item>

        {/* Date 입력 */}
        <Form.Item
          label="Date"
          name="date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select date"
            // 날짜 형식 지정 예시
            format="YYYY-MM-DD"
          />
        </Form.Item>

        {/* Notes 입력 (리뷰) */}
        <Form.Item
          label="Notes"
          name="notes"
          rules={[{ required: true, message: "Please enter a review" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter your review or notes here"
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
