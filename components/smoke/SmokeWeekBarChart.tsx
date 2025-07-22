import { ResponsiveBar } from "@nivo/bar";
import { SmokeLog } from "@/types/smokeLog";
import { DAYS } from "./SmokeHeatmapResponsive";

interface Props { logs: SmokeLog[] }

export function SmokeWeekBarChart({ logs }: Props) {
  const data = DAYS.map(d => ({
    day: d.label,
    count: logs.filter(l => l.timestamp.getDay() === d.key).length,
  }));

  return (
    <div style={{ height: 200 }}>
      <ResponsiveBar
        data={data}
        keys={["count"]}
        indexBy="day"
        margin={{ top: 20, right: 20, bottom: 50, left: 40 }}
        padding={0.2}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: false }}
        colors={[ "#BAF8D0" ]}
        enableLabel={false}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Dag",
          legendPosition: "middle",
          legendOffset: 30,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          legend: "Aantal",
          legendPosition: "middle",
          legendOffset: -30,
        }}
      />
    </div>
  );
}
