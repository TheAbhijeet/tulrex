// 'use client';
// import { useState, useCallback, useEffect, useMemo } from 'react';
// import HTMLtoJSX from 'html-to-jsx';
// import TextareaInput from '@/components/ui/TextareaInput';
// import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
// import { FaCopy } from 'react-icons/fa';

// export default function HtmlToJsxConverter() {
//     const [htmlInput, setHtmlInput] = useState(
//         '<!-- Paste your HTML code here -->\n<div class="container" style="color: red;">\n  <h1>Hello!</h1>\n  <input type="text" checked disabled />\n</div>'
//     );
//     const [jsxOutput, setJsxOutput] = useState('');
//     const [createClass] = useState(false); // Option for React.createClass style
//     const [error, setError] = useState('');
//     const [copyStatus, copy] = useCopyToClipboard();
//     const converter = useMemo(() => new HTMLtoJSX({ createClass: createClass }), [createClass]);

//     const handleConvert = useCallback(() => {
//         setError('');
//         if (!htmlInput.trim()) {
//             setJsxOutput('');
//             return;
//         }
//         try {
//             const result = converter.convert(htmlInput);
//             setJsxOutput(result);
//         } catch (err) {
//             if (err instanceof Error) {
//                 setError(`Conversion failed: ${err.message}`);
//             } else {
//                 setError(`Conversion failed with Error: ${err}`);
//             }
//             console.error('HTML to JSX conversion error:', err);
//             setJsxOutput('');
//         }
//     }, [htmlInput, converter]);

//     // Auto-convert on input change
//     useEffect(() => {
//         handleConvert();
//     }, [htmlInput, handleConvert]); // Also re-run if options (converter) change

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                     <label
//                         htmlFor="html-input-jsx"
//                         className="block text-sm font-medium text-slate-300"
//                     >
//                         HTML Input:
//                     </label>
//                     {/* Optional: Add options like createClass toggle */}
//                     {/* <div className="flex items-center">
//                          <input id="create-class" type="checkbox" checked={createClass} onChange={(e) => setCreateClass(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-600 focus:ring-cyan-500"/>
//                          <label htmlFor="create-class" className="ml-2 block text-xs text-slate-300">Use React.createClass</label>
//                      </div> */}
//                 </div>
//                 <TextareaInput
//                     id="html-input-jsx"
//                     value={htmlInput}
//                     onChange={(e) => setHtmlInput(e.target.value)}
//                     placeholder="Paste HTML code here..."
//                     rows={15}
//                     className="font-mono text-xs"
//                 />
//                 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
//                 {/* <Button onClick={handleConvert}>Convert to JSX</Button> */}
//             </div>
//             <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                     <label
//                         htmlFor="jsx-output"
//                         className="block text-sm font-medium text-slate-300"
//                     >
//                         JSX Output:
//                     </label>
//                     <button
//                         onClick={() => copy(jsxOutput)}
//                         disabled={!jsxOutput}
//                         className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
//                         title="Copy JSX"
//                         aria-label="Copy JSX output"
//                     >
//                         <FaCopy className="w-4 h-4" />
//                     </button>
//                 </div>
//                 <TextareaInput
//                     id="jsx-output"
//                     value={jsxOutput}
//                     readOnly
//                     rows={15}
//                     placeholder="JSX result will appear here..."
//                     className="font-mono text-xs bg-slate-900 border-slate-700"
//                 />
//                 {copyStatus === 'copied' && (
//                     <p className="text-xs text-green-400 mt-1 text-right">Copied!</p>
//                 )}
//             </div>
//         </div>
//     );
// }
