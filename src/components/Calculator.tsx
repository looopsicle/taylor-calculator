// src/components/Calculator.tsx
import React, { useState, useEffect } from "react";
import MathKeyboard from "./MathKeyboard";
import { CalculatorIcon } from "@heroicons/react/outline";

type TaylorResponse = {
  deret_taylor: string;
  suku_suku: string[];
};

export default function Calculator() {
  const [rawFunc, setRawFunc] = useState("");
  const [point, setPoint] = useState("0");
  const [order, setOrder] = useState("5");
  const [converted, setConverted] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaylorResponse | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

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

  const handleCalculate = async () => {
    setLoading(true);
    setErrMsg(null);
    setResult(null);
    try {
      const res = await fetch("http://localhost:/hitung_deret_taylor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fungsi_str: converted,
          a: parseFloat(point),
          n: parseInt(order, 10),
        }),
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data = (await res.json()) as TaylorResponse;
      setResult(data);
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
          <h1 className="text-2xl font-extrabold text-blue-600 mt-3">
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
                readOnly
                value={rawFunc}
                placeholder="sin(x)"
                className="flex-1 p-3 border-2 border-gray-200 rounded-l-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              />
              <button
                onClick={clear}
                className="px-4 bg-blue-300 hover:bg-blue-200 rounded-r-lg
                           font-medium text-blue-500 transition"
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
                         focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
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
                         focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>

          {/* tombol Calculate */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-lg text-blue-700
                        ${loading
                          ? "bg-blue-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200"
                        } transition`}
          >
            {loading ? "Calculating…" : "Calculate"}
          </button>

          {/* error & hasil */}
          {errMsg && <p className="text-red-500">Error: {errMsg}</p>}

          {result && (
            <div
              // contoh custom fade-in dengan inline style
              style={{ animation: "fadeIn 0.5s ease-out forwards" }}
              className="bg-blue-50 rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Taylor Series:
              </h3>
              <pre className="font-mono text-sm bg-white p-2 rounded">
                {result.deret_taylor}
              </pre>
              <h4 className="mt-4 font-semibold text-gray-800">Terms:</h4>
              <ul className="list-decimal list-inside font-mono text-sm space-y-1">
                {result.suku_suku.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
