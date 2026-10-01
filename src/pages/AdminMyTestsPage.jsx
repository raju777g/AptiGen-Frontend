import AdminWorkspaceLayout from "../components/AdminWorkspaceLayout";
import MyTestsPage from "./MyTestsPage";

export default function AdminMyTestsPage() {
  return (
    <AdminWorkspaceLayout title="My Tests">
      <MyTestsPage adminMode />
    </AdminWorkspaceLayout>
  );
}
