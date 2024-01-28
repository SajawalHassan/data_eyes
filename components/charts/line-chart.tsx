"use client";

import * as d3 from "d3";

import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type columnsDataInterface = {
  value: number;
  label: number;
};

export const LineChart = ({ file }: { file: string }) => {
  const [data, setData] = useState<null | d3.DSVRowArray<string>>(null);
  const [selection, setSelection] = useState<null | d3.Selection<SVGSVGElement | null, unknown, null, undefined>>(null);
  const [selectedYColumn, setSelectedYColumn] = useState("");
  const [selectedXColumn, setSelectedXColumn] = useState("");
  const [textSize, setTextSize] = useState("11");
  const [yTicks, setYTicks] = useState(5);
  const [xTicks, setXTicks] = useState(10);
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
        return value[selectedYColumn];
      });

      const columnData: columnsDataInterface[] = [];

      columnValues.map((val, i) => {
        if (i <= 10) console.log(val);
        const numericVal = val?.replace(/[^0-9.-]/g, "");

        const valInt = parseFloat(numericVal);

        if (isNaN(valInt)) {
          return null;
        }

        columnData.push({ label: i, value: valInt });
      });

      const yMaxValue = d3.max(columnData, (d) => d.value);
      const xMinValue = d3.min(columnData, (d) => d.label as number);
      const xMaxValue = d3.max(columnData, (d) => d.label as number);

      const x = d3.scaleLinear().domain([xMinValue!, xMaxValue!]).range([0, dimensions.chartWidth]);

      const y = d3
        .scaleLinear()
        .domain([0, yMaxValue!])
        .range([dimensions.chartHeight - 5, 0]);

      const xAxis = d3.axisBottom(x).ticks(xTicks);
      const yAxis = d3.axisLeft(y).ticks(yTicks);

      selection.append("g").call(xAxis).attr("transform", `translate(${dimensions.marginLeft},${dimensions.chartHeight})`);
      selection.append("g").call(yAxis).attr("transform", `translate(${dimensions.marginLeft},5)`);
      selection.selectAll("text").style("font-size", `${textSize}px`);

      const line = d3
        .line<columnsDataInterface>()
        .x((d) => x(d.label)!)
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      selection
        .append("path")
        .datum(columnData)
        .attr("fill", "none")
        .attr("stroke", "#f6c3d0")
        .attr("stroke-width", 4)
        .attr("class", "line")
        .attr("transform", `translate(${dimensions.marginLeft + 2}, 0)`)
        .attr("d", line);
    }
  }, [selection, selectedYColumn, textSize, dimensions, yTicks, xTicks]);

  return (
    <div className="flex items-center justify-center">
      <div className="space-y-1.5">
        <Select onValueChange={(value) => setSelectedYColumn(value)} defaultValue="">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold">Y Axis</p>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
          </div>
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

        <Select onValueChange={(value) => setSelectedXColumn(value)} defaultValue="">
          <div className="flex items-center gap-x-2">
            <p className="font-semibold">X Axis</p>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
          </div>
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
        <Input placeholder="Y ticks" value={yTicks} onChange={(e) => setYTicks(e.target.valueAsNumber)} type="number" />
        <Input placeholder="X ticks" value={xTicks} onChange={(e) => setXTicks(e.target.valueAsNumber)} type="number" />
      </div>

      <svg ref={chartRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};
