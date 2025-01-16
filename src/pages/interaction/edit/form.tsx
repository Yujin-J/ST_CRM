import React from "react";
import { Edit } from "@refinedev/antd";
import { Form, Input, Select, DatePicker, message } from "antd";
import { useParams, useNavigate} from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useOne, useUpdate, useList } from "@refinedev/core";
import { SelectOptionWithAvatar } from "../../../components/select-option-with-avatar";

/**
 * interaction 편집 폼
 * 
 * - contact_id: Select로 contact 리스트에서 선택
 * - date: DatePicker
 * - notes: 긴 내용 입력 위해 TextArea
 * 
 * classification, sentiment는 사용자 입력 없이 별도 로직으로 업데이트된다고 가정.
 */
export const InteractionEdit = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // 1) 수정할 interaction 가져오기
  const {
    data: interactionData,
    isLoading: isInteractionLoading,
  } = useOne({
    resource: "interaction",
    id: id ?? "",
  });
  const interaction = interactionData?.data;

  // 2) contact 목록 가져오기 (contact_id 선택 시 사용)
  const {
    data: contactsData,
    isLoading: isContactsLoading,
  } = useList({
    resource: "contact",
  });
  const contacts = contactsData?.data || [];

  // 3) interaction 업데이트 훅
  const { mutate: updateInteraction, isLoading: isUpdating } = useUpdate();

  // 4) 폼 전송 핸들러
  const onFinish = async (values: any) => {
    try {
      // datepicker의 값이 dayjs 객체이므로, DB 저장에 맞게 변환
      // 필요 없다면 그대로 values.date 만 쓰시면 됩니다.
      const formattedDate = values.date
        ? dayjs(values.date).format("YYYY-MM-DD")
        : null;

      const payload = {
        contact_id: values.contact_id,
        date: formattedDate,
        notes: values.notes ?? "",
        // classification, sentiment 등은 폼에서 입력받지 않음
      };

      updateInteraction(
        {
          resource: "interaction",
          id: id ?? "",
          values: payload,
        },
        {
          onSuccess: () => {
            message.success("Interaction updated successfully");
            navigate(-1); // 이전 페이지로 이동
          },
          onError: (error) => {
            messageApi.error("Error updating interaction");
            console.error(error);
          },
        }
      );
    } catch (error) {
      console.error("onFinish error:", error);
    }
  };

  // 5) 로딩 처리
  if (isInteractionLoading) {
    return <div>Loading...</div>;
  }

  // 6) initialValues 설정
  const initialValues = {
    contact_id: interaction?.contact_id,
    notes: interaction?.notes,
    date: interaction?.date ? dayjs(interaction.date) : null,
  };

  return (
    <>
      {contextHolder}
      <Edit
        isLoading={isInteractionLoading || isContactsLoading || isUpdating}
        saveButtonProps={{
          onClick: form.submit,
        }}
        breadcrumb={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          {/* Contact ID 선택 */}
          <Form.Item
            label="Contact"
            name="contact_id"
            rules={[{ required: true, message: "Please select a contact" }]}
          >
            <Select
              placeholder="Select a contact"
              options={contacts.map((contact) => ({
                value: contact.id ?? "",
                label: (
                  <SelectOptionWithAvatar
                    name={contact.name}
                    avatarUrl={contact.avatarUrl}
                  />
                ),
              }))}
            />
          </Form.Item>

          {/* Date */}
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select date"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          {/* Notes (긴 텍스트 입력) */}
          <Form.Item
            label="Notes"
            name="notes"
            rules={[{ required: true, message: "Please enter notes" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter your review or notes" />
          </Form.Item>
        </Form>
      </Edit>
    </>
  );
};
