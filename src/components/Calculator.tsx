import React, { useState, useEffect } from "react";
import { evaluate, parse } from "mathjs"; 
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import MathKeyboard from "./MathKeyboard";
import { CalculatorIcon } from "@heroicons/react/outline";

type TaylorResponse = {
  taylor_series: string;
  terms_list: string[];
  derivative_symbolic: string[];       // array turunan secara simbolik
  derivative_evaluated: string[];      // array turunan yang sudah dievaluasi di titik ekspansi
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Calculator() {
  const [rawFunc, setRawFunc] = useState("");
  const [point, setPoint] = useState("0");
  const [order, setOrder] = useState("5");
  const [converted, setConverted] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaylorResponse | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Data untuk chart
  const [chartData, setChartData] = useState<{
    labels: number[];
    datasets: { label: string; data: number[]; borderColor: string; fill: boolean }[];
  } | null>(null);

  const convertToMathJS = (s: string) => {
    let expr = s;
    expr = expr.replace(/√\s*\(/g, "sqrt(");
    expr = expr.replace(/√\s*([0-9a-zA-Zπ])/g, "sqrt($1)");
    expr = expr.replace(/π/g, "pi");
    expr = expr.replace(/×/g, "*");
    expr = expr.replace(/÷/g, "/");
    return expr;
  };

  useEffect(() => {
    setConverted(convertToMathJS(rawFunc));
  }, [rawFunc]);

  // Setelah result berubah (hasil deret Taylor diterima), kita generate chartData
  useEffect(() => {
    if (!result) {
      setChartData(null);
      return;
    }

    try {
      // Parse fungsi asli dan deret Taylor-nya
      const fExp = parse(converted); // misal: "sin(x)"
      const tExp = parse(result.taylor_series); // misal: "x - x^3/6 + x^5/120"

      // array titik x (–2π sampai 2π)
      const numPoints = 200;
      const xmin = -1.5 * Math.PI;
      const xmax = 1.5 * Math.PI;
      const step = (xmax - xmin) / (numPoints - 1);
      const xArr = Array.from({ length: numPoints }, (_, i) => xmin + step * i);

      // Evaluasi f(x) dan P_n(x) di setiap titik
      const yOriginal: number[] = xArr.map((x) =>
        // evaluate(fExp, { x: x })
        fExp.evaluate({ x: x })
      );
      const yTaylor: number[] = xArr.map((x) =>
        // evaluate(tExp, { x: x })
        tExp.evaluate({ x: x })
      );

      // Siapkan data untuk Chart.js
      setChartData({
        labels: xArr,
        datasets: [
          {
            label: "Fungsi Asli",
            data: yOriginal,
            borderColor: "rgba(37, 99, 235, 1)", // biru
            fill: false,
          },
          {
            label: `Taylor Order ${order}`,
            data: yTaylor,
            borderColor: "rgba(234, 88, 12, 1)", // oranye
            fill: false,
          },
        ],
      });
    } catch (e) {
      console.error("Error generating chart data:", e);
      setChartData(null);
    }
  }, [result, converted, order]);

  const handleCalculate = async () => {
    setLoading(true);
    setErrMsg(null);
    setResult(null);
    setChartData(null);

    try {
      const res = await fetch("http://localhost:3000/hitung_deret_taylor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fungsi_str: converted,
          a: parseFloat(point),
          n: parseInt(order, 10),
        }),
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      
      // Parse JSON mentah
      const raw = (await res.json()) as {
        data: {
          result: {
            taylor_series: string;
            terms_list: string[];
            derivative_list_symbolic: string[];
            derivative_list_evaluated: string[];
          };
        };
      };

      // Mapping ke TaylorResponse
      const mapped: TaylorResponse = {
        taylor_series: raw.data.result.taylor_series,
        terms_list: raw.data.result.terms_list,
        derivative_symbolic: raw.data.result.derivative_list_symbolic,
        derivative_evaluated: raw.data.result.derivative_list_evaluated,
      };

      setResult(mapped);
    } catch (e: any) {
      setErrMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const insert = (v: string) => setRawFunc((s) => s + v);
  const del    = ()    => setRawFunc((s) => s.slice(0, -1));
  const clear  = ()    => setRawFunc("");

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 flex justify-center items-start -mt-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-visible">
        {/* Hero */}
        <div className="flex items-center space-x-4 bg-white p-6 border-b border-gray-200 rounded-t-2xl">
          <CalculatorIcon
            className="h-12 w-12 text-blue-500" 
          />
          <h1 className="text-4xl font-extrabold text-blue-600">
            Taylor Series Calculator
          </h1>
        </div>

        <div className="p-6 space-y-6">
          {/* fungsi + keyboard */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Enter a function:</label>
            <div className="flex">
              <input
                type="text"
                value={rawFunc}
                onChange={(e) => setRawFunc(e.target.value)}
                placeholder="sin(x)"
                className="
                  flex-1 
                  p-3 
                  border-2 border-gray-200 
                  rounded-l-lg
                  bg-white 
                  placeholder-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-blue-300 transition

                  dark:bg-white 
                  dark:placeholder-gray-400 
                  dark:border-gray-200

                  text-gray-900 
                  dark:text-gray-900
                "
              />
              <button
                onClick={clear}
                className="px-4 bg-blue-300 hover:bg-blue-200 rounded-r-lg
                           font-medium text-white transition"
              >
                CLR
              </button>
            </div>
            <MathKeyboard onInsert={insert} onDelete={del} onClear={clear} />
          </div>

          {/* point */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Enter a point:</label>
            <input
              type="number"
              value={point}
              onChange={e => setPoint(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-300 transition
                        dark:bg-white 
                        dark:placeholder-gray-400 
                        dark:border-gray-200
                        bg-white
                        text-gray-900 
                        dark:text-gray-900"
            />
            <p className="text-sm text-gray-500">
              For Maclaurin series, set the point to <strong>0</strong>.
            </p>
          </div>

          {/* order */}
          <div className="space-y-2">
            <label className="font-medium text-gray-700">
               Order <span className="italic text-xl">𝑛</span> =
            </label>
            <input
              type="number"
              min={1}
              value={order}
              onChange={e => setOrder(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-300 transition
                        dark:bg-white 
                        dark:placeholder-gray-400 
                        dark:border-gray-200
                        bg-white
                        text-gray-900 
                        dark:text-gray-900"
            />
          </div>

          {/* tombol Calculate */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-lg text-white
                        ${loading
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200"
                        } transition`}
          >
            {loading ? "Calculating…" : "Calculate"}
          </button>

          {/* error */}
          {errMsg && <p className="text-red-500">Error: {errMsg}</p>}

          {/* result */}
          {result && (
            <div
              style={{ animation: "fadeIn 0.5s ease-out forwards" }}
              className="bg-blue-50 rounded-lg p-4 border border-gray-200 shadow-sm space-y-4"
            >
              {/* teks Deret Taylor */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Taylor Series:
                </h3>
                <pre className="font-mono text-sm bg-white p-2 rounded">
                  {result.taylor_series}
                </pre>

                <h4 className="mt-4 font-semibold text-gray-800">Terms:</h4>
                <ul className="list-decimal list-inside font-mono text-sm space-y-1">
                  {result.terms_list.map((term, i) => (
                    <li key={i}>{term}</li>
                  ))}
                </ul>
              </div>

              {/* Turunan Simbolik */}
              <div>
                <h4 className="mt-4 font-semibold text-gray-800">
                  Derivative (Symbolic) at Each Order:
                </h4>
                <ul className="list-decimal list-inside font-mono text-sm space-y-1">
                  {result.derivative_symbolic.map((sym, idx) => (
                    <li key={`sym-${idx}`}>{sym}</li>
                  ))}
                </ul>
              </div>

              {/* Turunan Evaluated */}
              <div>
                <h4 className="mt-4 font-semibold text-gray-800">
                  Derivative (Evaluated) at x = {point}:
                </h4>
                <ul className="list-decimal list-inside font-mono text-sm space-y-1">
                  {result.derivative_evaluated.map((val, idx) => (
                    <li key={`eval-${idx}`}>{val}</li>
                  ))}
                </ul>
              </div>

              {/* Grafik */}
              {chartData && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">
                    Visualisasi Kurva
                  </h3>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "x",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "y",
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
