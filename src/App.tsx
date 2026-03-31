/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Sparkles, 
  Copy, 
  Check, 
  Info, 
  RefreshCw,
  Layout,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeAndMimicStyle, generateViralDescription } from './services/geminiService';

type AppFunction = 'mimic' | 'viral';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppFunction>('mimic');
  const [extraInfo, setExtraInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Video states
  const [styleVideo, setStyleVideo] = useState<File | null>(null);
  const [targetVideo, setTargetVideo] = useState<File | null>(null);
  const [viralVideo, setViralVideo] = useState<File | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProcess = async () => {
    setLoading(true);
    setResult('');
    try {
      if (activeTab === 'mimic') {
        if (!styleVideo || !targetVideo) {
          alert('Vui lòng tải lên cả video phong cách và video mục tiêu!');
          setLoading(false);
          return;
        }
        const styleBase64 = await fileToBase64(styleVideo);
        const targetBase64 = await fileToBase64(targetVideo);
        const desc = await analyzeAndMimicStyle(styleBase64, targetBase64, extraInfo);
        setResult(desc);
      } else {
        if (!viralVideo) {
          alert('Vui lòng tải lên video cần viết mô tả!');
          setLoading(false);
          return;
        }
        const videoBase64 = await fileToBase64(viralVideo);
        const desc = await generateViralDescription(videoBase64, extraInfo);
        setResult(desc);
      }
    } catch (error) {
      console.error(error);
      setResult('Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1a1a] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              <Zap size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Rental AI</h1>
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Bản quyền thuộc về Thùy Ngân
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-3xl font-light leading-tight mb-6">
                Tạo mô tả <span className="italic serif font-medium text-orange-600">viral</span> cho video của bạn
              </h2>
              
              <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                <button 
                  onClick={() => setActiveTab('mimic')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'mimic' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Bắt chước phong cách
                </button>
                <button 
                  onClick={() => setActiveTab('viral')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'viral' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sáng tạo xu hướng
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'mimic' ? (
                    <motion.div 
                      key="mimic"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <VideoUpload 
                        label="Video phong cách (Viral)" 
                        file={styleVideo} 
                        setFile={setStyleVideo} 
                        icon={<Sparkles className="text-orange-500" />}
                      />
                      <VideoUpload 
                        label="Video của bạn (Mục tiêu)" 
                        file={targetVideo} 
                        setFile={setTargetVideo} 
                        icon={<Video className="text-blue-500" />}
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="viral"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <VideoUpload 
                        label="Video của bạn" 
                        file={viralVideo} 
                        setFile={setViralVideo} 
                        icon={<Zap className="text-yellow-500" />}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Info size={14} /> Thông tin bổ sung
                  </label>
                  <textarea 
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                    placeholder="Nhập giá phòng, diện tích, tiện ích, dịch vụ đi kèm..."
                    className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <button 
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Tạo mô tả ngay
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm min-h-[500px] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Layout size={16} className="text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Kết quả tạo bởi AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase tracking-tighter">
                      © Thùy Ngân
                    </div>
                    {result && (
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 flex items-center gap-2 text-xs font-medium"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                        {copied ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto">
                  {loading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 text-gray-400">
                      <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                      <p className="text-sm italic">Đang xem video và sáng tạo nội dung...</p>
                    </div>
                  ) : result ? (
                    <div className="prose prose-orange max-w-none">
                      <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800 font-serif">
                        {result}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Sparkles size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-400">Chưa có nội dung</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">
                          Tải video lên và nhấn nút tạo để bắt đầu hành trình viral của bạn.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-4 items-start">
                <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm">
                  <Info size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Mẹo nhỏ</p>
                  <p className="text-xs text-orange-700 leading-relaxed">
                    Hãy cung cấp thông tin giá cả và diện tích thật chi tiết để AI lồng ghép vào các đoạn chuyển cảnh phù hợp nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-400">
            © 2026 AI Rental Video Describer. All rights reserved.
          </div>
          <div className="font-serif italic text-gray-500">
            Bản quyền thuộc về Thùy Ngân
          </div>
        </div>
      </footer>
    </div>
  );
}

function VideoUpload({ 
  label, 
  file, 
  setFile, 
  icon 
}: { 
  label: string, 
  file: File | null, 
  setFile: (f: File | null) => void,
  icon: React.ReactNode
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
        {icon} {label}
      </label>
      <div 
        onClick={() => inputRef.current?.click()}
        className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-orange-500 bg-orange-50/30' : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'}`}
      >
        <input 
          type="file" 
          ref={inputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept="video/*"
          className="hidden" 
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle2 className="text-orange-500" size={24} />
            <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]">{file.name}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500"
            >
              Thay đổi
            </button>
          </div>
        ) : (
          <>
            <Upload className="text-gray-300 mb-2" size={24} />
            <span className="text-xs text-gray-400">Kéo thả hoặc nhấn để tải video</span>
          </>
        )}
      </div>
    </div>
  );
}
