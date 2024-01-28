import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { promises as fs } from "fs";

export default async function Home() {
  const file = await fs.readFile(process.cwd() + "/data/timeseries-data.csv", "utf8");
  return (
    <div className="flex items-center flex-col justify-center min-h-screen">
      <BarChart file={file} />
      <LineChart file={file} />
    </div>
  );
}
