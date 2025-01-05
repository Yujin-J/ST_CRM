import { CustomerListPage } from "../list";
import { CustomerCreateModal } from "../list/createModal";

export const CustomerCreatePage = () => {
  return (
    <CustomerListPage>
      <CustomerCreateModal />
    </CustomerListPage>
  );
};
