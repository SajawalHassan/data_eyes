import { BarChart } from "@/components/charts/bar-chart";
import { promises as fs } from "fs";

export default async function Home() {
  const file = await fs.readFile(process.cwd() + "/data/financial-data.csv", "utf8");
  return (
    <div>
      <BarChart file={file} />
    </div>
  );
}
