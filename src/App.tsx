import "./App.css";

import {
  useEffect,
  useRef,
  useState,
  DetailedHTMLProps,
  HTMLAttributes,
} from "react";
import * as d3fc from "d3fc";
import * as d3 from "d3";
import moment from "moment";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "d3fc-group": DetailedHTMLProps<
        HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >;
      "d3fc-svg": DetailedHTMLProps<
        HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >;
      "d3fc-canvas": DetailedHTMLProps<
        HTMLAttributes<HTMLCanvasElement | HTMLDivElement>,
        HTMLCanvasElement | HTMLDivElement
      >;
    }
  }
}

function App() {
  const d3CanvasCandle = useRef(null);
  const xAxis = useRef(null);
  const yAxis = useRef(null);

  const [candlestick, setCandlestick] = useState();

  const [xScale, setXScale] = useState<any>();
  const [yScale, setYScale] = useState<any>();

  const data = d3fc.randomFinancial()(50);

  useEffect(() => {
    // X axis
    const xScale = d3.scaleLinear();
    const xExtent = d3fc
      .extentLinear()
      .accessors([(d: any) => new Date(d.date).getTime()]);
    xScale.domain(xExtent(data)); // [startDate, lastDate]
    setXScale(() => xScale);

    // Y axis
    const yScale = d3.scaleLinear();
    const yExtent = d3fc
      .extentLinear()
      .accessors([(d: any) => d.high, (d: any) => d.low]);
    yScale.domain(yExtent(data));
    setYScale(() => yScale);
  }, [data.length]);

  useEffect(() => {
    const _xAxis = d3fc.axisBottom().scale(xScale);
    const canvas = d3.select(xAxis.current).select("canvas").node() as any;
    const context = canvas.getContext("2d");

    d3.select(xAxis.current).on("draw", function () {
      if (_xAxis && xScale) {
        drawXaxis(context, xScale, 3);
      }
    });
  }, [xAxis, xScale]);

  useEffect(() => {
    const _yAxis = d3fc.axisLeft().scale(yScale);
    const canvas = d3.select(yAxis.current).select("canvas").node() as any;
    const context = canvas.getContext("2d");

    d3.select(yAxis.current).on("draw", function () {
      if (_yAxis && yScale) {
        drawYaxis(context, yScale, 20);
      }
    });
  }, [yAxis, yScale]);

  const drawYaxis = (
    context: CanvasRenderingContext2D,
    yScale: d3.ScaleLinear<number, number>,
    X: number
  ) => {
    context.stroke();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "black";
    context.font = "12.425px Lexend Deca";

    const yScaleTicks = yScale.ticks();

    yScaleTicks.forEach((d: any) => {
      context.beginPath();

      context.fillText(d, X, yScale(d));
    });
  };

  const drawXaxis = (context: any, xScale: any, Y: number) => {
    let tickSize = 6;
    const xTicks = xScale.ticks();
    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);
    xTicks.forEach((d: any) => {
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillStyle = "black";
      context.font = "50 11.5px Lexend Deca";
      context.filter = " blur(0px)";

      context.beginPath();

      context.fillText(
        moment(d).subtract(utcDiffHours, "hours").format("MMM DD "),
        xScale(d),
        Y + tickSize
      );

      context.restore();
    });
  };

  useEffect(() => {
    if (xScale !== undefined && yScale !== undefined) {
      const canvasCandlestick = d3fc
        .autoBandwidth(d3fc.seriesCanvasCandlestick())
        .xScale(xScale)
        .yScale(yScale)
        .crossValue((d: any) => {
          return new Date(d.date).getTime();
        })
        .highValue((d: any) => d.high)
        .lowValue((d: any) => d.low)
        .openValue((d: any) => d.open)
        .closeValue((d: any) => d.close);

      setCandlestick(() => canvasCandlestick);
    }
  }, [xScale, yScale]);

  useEffect(() => {
    const canvas = d3
      .select(d3CanvasCandle.current)
      .select("canvas")
      .node() as any;
    const ctx = canvas.getContext("2d");

    if (candlestick) {
      d3.select(d3CanvasCandle.current)
        .on("draw", () => {
          if (data !== undefined) {
            (candlestick as any)(data);
          }
        })
        .on("measure", (event) => {
          xScale.range([0, event.detail.width]);
          yScale.range([event.detail.height, 0]);
          (candlestick as any).context(ctx);
        });
    }
  }, [data, candlestick]);

  useEffect(() => {
    render();
  }, [xScale, yScale, data]);

  // useEffect(() => {
  //   if (candlestick) {
  //     (candlestick as any).decorate((context: any, d: any) => {
  //       context.fillStyle = "red";

  //       context.strokeStyle = "blue";
  //     });
  //   }
  // }, [candlestick]);

  const render = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nd = d3.select("#d3fc_group").node() as any;
    if (nd) nd.requestRedraw();
  };

  return (
    <div className="App">
      <d3fc-group id="d3fc_group" auto-resize>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100%",
            width: "100%",
          }}
        >
          <d3fc-canvas
            style={{ flex: 15 }}
            ref={d3CanvasCandle}
            className="candle-canvas"
          ></d3fc-canvas>
          <d3fc-canvas
            ref={yAxis}
            style={{ flex: 1 }}
            className="candle-canvas"
          ></d3fc-canvas>
        </div>
        <d3fc-canvas ref={xAxis} className="candle-canvas"></d3fc-canvas>
      </d3fc-group>
    </div>
  );
}

export default App;
