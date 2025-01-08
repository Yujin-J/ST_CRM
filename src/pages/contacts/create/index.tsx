import { ContactListPage } from "../list";
import { ContactCreateModal } from "../list/createModal";

export const ContactCreatePage = () => {
  return (
    <ContactListPage>
      <ContactCreateModal />
    </ContactListPage>
  );
};
