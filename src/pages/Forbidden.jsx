import { Lock } from "lucide-react";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import { EmptyState } from "../components/states.jsx";

export default function Forbidden() {
  return (
    <Page title="No access">
      <EmptyState icon={Lock} title="This page isn't for you" text="Only the person who reported this item can open it." action={<Button to="/my-reports">Go to my reports</Button>} />
    </Page>
  );
}
