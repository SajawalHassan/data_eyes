"use client";

import * as d3 from "d3";

import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "../ui/input";

interface columnsDataInterface {
  value: string;
  num: number;
}

export const BarChart = ({ file }: { file: string }) => {
  const [data, setData] = useState<null | d3.DSVRowArray<string>>(null);
  const [selection, setSelection] = useState<null | d3.Selection<SVGSVGElement | null, unknown, null, undefined>>(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [textSize, setTextSize] = useState("11");
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 400,
    chartWidth: 700,
    chartHeight: 300,
    marginLeft: 100,
  });

  const chartRef = useRef<null | SVGSVGElement>(null);

  useEffect(() => {
    setData(d3.csvParse(file));
  }, []);

  useEffect(() => {
    if (!data) setData(d3.csvParse(file));
    if (!selection) {
      setSelection(d3.select(chartRef.current));
    } else {
      selection.selectAll("*").remove();

      const columnValues = data!.map((value) => {
        return value[selectedColumn];
      });

      const uniqueColummnValues = Array.from(new Set(columnValues));

      const columnData: columnsDataInterface[] = [];

      uniqueColummnValues.map((value) => {
        columnData.push({ value, num: 1 });
      });

      columnValues.map((value) => {
        columnData.map((columnData) => {
          if (columnData.value === value) {
            columnData.num++;
          }
        });
      });

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(columnData, (d) => d.num)!])
        .range([dimensions.chartHeight - 5, 0]);

      const x = d3
        .scaleBand()
        .domain(columnData.map((columnData) => columnData.value))
        .range([0, dimensions.chartWidth])
        .paddingInner(0.05);

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      selection.append("g").call(xAxis).attr("transform", `translate(${dimensions.marginLeft},${dimensions.chartHeight})`);
      selection.append("g").call(yAxis).attr("transform", `translate(${dimensions.marginLeft},5)`);

      selection.selectAll("text").style("font-size", `${textSize}px`);

      selection
        .append("g")
        .attr("transform", `translate(${dimensions.marginLeft}, 0)`)
        .selectAll("rect")
        .data(columnData)
        .enter()
        .append("rect")
        .attr("width", x.bandwidth())
        .attr("height", (d) => dimensions.chartHeight - y(d.num))
        .attr("y", (d) => y(d.num))
        .attr("fill", "orange")
        .attr("x", (d) => x(d.value)!)
        .style("font-size", "11px");
    }
  }, [selection, selectedColumn, textSize, dimensions]);

  return (
    <div className="flex items-center justify-center min-h-screen min-w-full">
      <div className="space-y-1 5">
        <Select onValueChange={(value) => setSelectedColumn(value)} defaultValue="">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a column" />
          </SelectTrigger>
          <SelectContent>
            {data?.columns.map(
              (column, i) =>
                column && (
                  <SelectItem value={column} key={i}>
                    {column}
                  </SelectItem>
                )
            )}
          </SelectContent>
        </Select>
        <Input placeholder="Text size" value={textSize} onChange={(e) => setTextSize(e.target.value)} />
        <Input
          placeholder="Width"
          value={dimensions.chartWidth}
          onChange={(e) => setDimensions({ ...dimensions, chartWidth: e.target.valueAsNumber, width: e.target.valueAsNumber + 100 })}
          type="number"
        />
        <Input
          placeholder="Height"
          value={dimensions.chartHeight}
          onChange={(e) => setDimensions({ ...dimensions, chartHeight: e.target.valueAsNumber, height: e.target.valueAsNumber + 100 })}
          type="number"
        />
      </div>

      <svg ref={chartRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};
