import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { isAccessError } from "../lib/errors.js";
import { useItem } from "../hooks/useData.js";
import AnalyzingScreen from "../components/AnalyzingScreen.jsx";
import Page from "../components/Page.jsx";
import { ErrorState } from "../components/states.jsx";

/** Waits for `analyzed`, then sends the finder to their matches and the owner to My reports. */
export default function Analyzing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slow, setSlow] = useState(false);
  const { data: item, error, refresh } = useItem(id, { interval: 2500, until: (i) => i?.analyzed });

  useEffect(() => {
    if (!item?.analyzed) return undefined;
    const t = setTimeout(() => navigate(item.type === "found" ? `/found/${item.id}/matches` : "/my-reports", { replace: true }), 500);
    return () => clearTimeout(t);
  }, [item, navigate]);

  useEffect(() => {
    if (!item || item.analyzed) return undefined;
    const t = setTimeout(() => setSlow(true), item.type === "found" ? 60_000 : 20_000);
    return () => clearTimeout(t);
  }, [item?.id, item?.type, item?.analyzed]);

  useEffect(() => {
    if (error && isAccessError(error)) navigate("/forbidden", { replace: true });
  }, [error, navigate]);

  async function retry() {
    setSlow(false);
    try {
      await api.analyzeItem(id);
    } catch {
      /* the poll keeps checking and the screen offers retry again */
    }
    refresh();
    setTimeout(() => setSlow(true), item?.type === "found" ? 60_000 : 20_000);
  }

  if (error && !item && !isAccessError(error)) {
    return (
      <Page title="Analyzing">
        <ErrorState error={error} onRetry={refresh} />
      </Page>
    );
  }

  return (
    <Page title="Analyzing your report">
      <div className="py-6">
        <AnalyzingScreen type={item?.type || "found"} imageUrl={item?.imageUrl} slow={slow} onRetry={retry} />
      </div>
    </Page>
  );
}
