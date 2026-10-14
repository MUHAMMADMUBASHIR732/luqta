import { Compass } from "lucide-react";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";
import { EmptyState } from "../components/states.jsx";

export default function NotFound() {
  return (
    <Page title="Not found">
      <EmptyState icon={Compass} title="We couldn't find that page" text="The link may be old or mistyped." action={<Button to="/">Go to the start</Button>} />
    </Page>
  );
}
