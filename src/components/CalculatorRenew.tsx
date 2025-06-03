import { useState } from 'react'
import { derivative, evaluate, parse } from "mathjs"; 
import { InlineMath, BlockMath } from 'react-katex';

import MathKeyboard from "./MathKeyboard";
import { CalculatorIcon } from "@heroicons/react/outline";

import { XCircleIcon } from "@heroicons/react/outline";

type RequestPayload = {
    base_function: string,
    expansion_point: number,
    order_n: number
}

type ApiResponse = {
    success: boolean,
    message?: string,
    data: {
        base_function: string,
        expansion_point: number,
        order_n: number,
        result: TaylorResult
    }
}

type TaylorResult = { 
    taylor_series: string,
    terms: string[],
    symbolic_derivatives: string[],
    evaluated_derivatives: string[]
}

type ResultModalProps = {
    calculateResult: ApiResponse
    onClose: () => void
}

function ResultModal({ calculateResult, onClose }: ResultModalProps) {
    const taylor_series_steps: Array<{
        n: number;
        derivative_form: string;
        derivative_eval: number; // Pastikan tipe ini number, bukan string dari parseFloat
        term_form: string;
    }> = [];

    // Fungsi pythonMathToLatex tetap sama seperti yang Anda berikan di prompt terakhir
    const pythonMathToLatex = (str: string): string => {
        let s = str;

        s = s.replace(/\*\*\(([^)]+)\)/g, '^{($1)}'); 
        s = s.replace(/\*\*([a-zA-Z0-9_]+)/g, '^{$1}');

        s = s.replace(/\bsin\b/g, '\\sin');
        s = s.replace(/\bcos\b/g, '\\cos');
        s = s.replace(/\btan\b/g, '\\tan');
        s = s.replace(/\bsqrt\b/g, '\\sqrt');
        s = s.replace(/\bexp\b/g, '\\exp');
        s = s.replace(/\blog\b/g, '\\ln');
        s = s.replace(/\bfactorial\b/g, '!');
        s = s.replace(/\bpi\b/g, '\\pi');

        const numPattern = `\\d+(?:\\.\\d+)?`;
        const varFuncPattern = `[a-zA-Z_]\\w*(?:\\((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*\\))?`;
        const parenPattern = `\\((?:[^)(]+|\\((?:[^)(]+|\\([^)(]*\\))*\\))*\\)`;
        const denominatorPattern = `(?:${parenPattern}|${varFuncPattern}|${numPattern})`;
        
        const fractionRegex = new RegExp(`(.+?)\\s*\\/\\s*(${denominatorPattern})`, 'g');
        s = s.replace(fractionRegex, '\\frac{$1}{$2}');

        s = s.replace(/\*/g, ''); 
        s = s.replace(/\s+/g, ' ');
        return s.trim();
    }

    for(let i = 0; i <= calculateResult.data.order_n; i++) {
        taylor_series_steps.push({
            n: i,
            derivative_form: calculateResult.data.result.symbolic_derivatives[i],
            derivative_eval: parseFloat(calculateResult.data.result.evaluated_derivatives[i]),
            term_form: calculateResult.data.result.terms[i],
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 p-4"
        >
            <div
                className="relative w-full max-w-xl flex flex-col gap-5 transform rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-indigo-700">Detail Perhitungan Deret Taylor</h3>
                    {/* Anda bisa menambahkan tombol close di sini jika diperlukan, yang memanggil fungsi dari parent */}
                    <button
                        type="button"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-700 rounded-lg text-sm p-1.5 inline-flex items-center transition-colors"
                        aria-label="Tutup modal"
                        onClick={onClose}
                    >
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Informasi Input */}
                <div className='flex flex-col items-start gap-2 p-4 bg-slate-50 rounded-md'>
                    <h4 className="text-lg font-semibold text-gray-700 mb-1">Parameter Input:</h4>
                    <p><span className='font-medium text-gray-600'>Fungsi Dasar:</span> <InlineMath math={pythonMathToLatex(calculateResult.data.base_function)} /></p>
                    <p><span className='font-medium text-gray-600'>Titik Ekspansi (a):</span> {calculateResult.data.expansion_point}</p>
                    <p><span className='font-medium text-gray-600'>Orde (N):</span> {calculateResult.data.order_n}</p>
                </div>

                {/* Langkah-langkah Perhitungan Iterasi */}
                <div className='w-full flex flex-col items-start gap-4'>
                    <h4 className="text-lg font-semibold text-gray-700">Langkah-langkah Perhitungan:</h4>
                    <div className="w-full max-h-72 overflow-y-auto space-y-4 pr-2">
                        {taylor_series_steps.map((step) => (
                            <div 
                                key={step.n} 
                                className='w-full flex flex-col items-start gap-3 text-sm border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white'
                            >
                                <p className="font-semibold text-base text-indigo-600"> 
                                    Iterasi ke-{step.n}:
                                </p>
                                <div className="w-full flex flex-col items-start gap-2 pl-2 text-gray-700">
                                    <span>
                                        <InlineMath math={`f^{(${step.n})}(x)`} />{': '}
                                        <InlineMath math={pythonMathToLatex(step.derivative_form)} />
                                    </span>
                                    <span>
                                        <InlineMath math={`f^{(${step.n})}(${calculateResult.data.expansion_point})`} />{': '} {/* Tambahkan spasi di sini */}
                                        {step.derivative_eval.toFixed(6)}
                                    </span>
                                    <span>
                                        <span className="font-medium">Suku Polinomial</span>{': '} {/* Tambahkan spasi di sini */}
                                        <InlineMath math={pythonMathToLatex(step.term_form)} />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hasil Deret Taylor */}
                <div className='flex flex-col gap-2 items-start pt-4 border-t border-gray-200'>
                    <h4 className='text-xl font-bold text-indigo-700'>Hasil Deret Taylor:</h4>
                    <div className="w-full p-3 bg-indigo-50 rounded-md text-sm overflow-x-auto">
                        {/* Menggunakan BlockMath untuk tampilan yang lebih menonjol dan terpusat */}
                        <BlockMath math={pythonMathToLatex(calculateResult.data.result.taylor_series)} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CalculatorRenew() {
    const [rawFunction, setRawFunction] = useState<string>("")
    const [expansionPoint, setExpansionPoint] = useState<number>(0.0)
    const [orderN, setOrderN] = useState<number>(1)

    // Application Feedback's State
    const [onLoading, setOnLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [calculateResult, setCalculateResult] = useState<ApiResponse | null>(null)
    
    // Helper functions
    const insert = (v: string) => setRawFunction((s) => s + v);
    const del    = ()    => setRawFunction((s) => s.slice(0, -1));
    const clear  = ()    => setRawFunction("");
    const convertToMathJS = (s: string): string => {
        let expr = s;
        expr = expr.replace(/√\s*\(/g, "sqrt(");
        expr = expr.replace(/√\s*([0-9a-zA-Zπ])/g, "sqrt($1)");
        expr = expr.replace(/π/g, "pi");
        expr = expr.replace(/×/g, "*");
        expr = expr.replace(/÷/g, "/");
        return expr;
    }

    // Action Handler
    const handleCalculate = async () => {
        try
        {
            setOnLoading(true)

            const payload: RequestPayload = {
                base_function: convertToMathJS(rawFunction),
                expansion_point: expansionPoint,
                order_n: orderN
            }

            if(payload.base_function === "")
                throw new Error("Fungsi tidak boleh kosong");

            if(isNaN(payload.expansion_point))
                throw new Error("Poin Ekspansi tidak boleh kosong");

            if(isNaN(payload.order_n))
                throw new Error("Order tidak boleh kosong");


            const response = await fetch("http://taylorseriescalculator.pradita.website/api/taylor", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": "Bearer IF231203"
                },
                body: JSON.stringify(payload),
            })

            const parsedResponse = (await response.json() ) as ApiResponse
            if(!parsedResponse.success) 
                throw new Error(parsedResponse.message);

            setCalculateResult(parsedResponse)
            setErrorMessage(null)
        }
        catch(e: any)
        {
            console.log(e.message)
            setErrorMessage(e.message)
        }
        finally
        {
            setOnLoading(false)
        }
    }

    const closeModal = () => {
        setCalculateResult(null)
    }

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
                                value={rawFunction}
                                placeholder="Please input a function (e.g. sin(x))"
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
                                readOnly
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
                            value={expansionPoint}
                            onChange={e => setExpansionPoint(parseFloat(e.target.value))}
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
                            value={orderN}
                            onChange={e => setOrderN(parseInt(e.target.value, 10))}
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
                        type='submit'
                        onClick={handleCalculate}
                        disabled={onLoading}
                        className={`w-full py-3 font-semibold rounded-lg text-white
                            ${onLoading
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200"
                            } transition`}
                    >
                        {onLoading ? "Calculating…" : "Calculate"}
                    </button>

                    {/* error */}
                    {errorMessage && <p className="text-red-500">Error: {errorMessage}</p>}
                </div>
            </div>
            {calculateResult && <ResultModal calculateResult={calculateResult} onClose={closeModal} />}
        </div>
    )
}