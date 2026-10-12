import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { CopilotResponse } from '../types';
import { api } from '../services/api';

interface CopilotChatProps {
  onSelectStudent: (studentId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: CopilotResponse;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'Which students need immediate academic attention?',
  'Which high-performing students have low placement readiness?',
  'Which department has the largest number of students requiring support?',
  'What are the most common academic risk indicators?',
  'Which students have declining attendance?',
  'Which interventions remain pending?',
  'Show me consistent high performers'
];

export const CopilotChat: React.FC<CopilotChatProps> = ({ onSelectStudent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am **CampusIQ Copilot**, your institutional decision-support assistant. I analyze integrated student records across academics, lecture attendance, LMS engagement, and placement testing to surface explainable intelligence. Select a suggested question below or enter your own query.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.queryCopilot(q);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer_text,
        response: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error processing analytics query: ${err.message || 'Please check backend server connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-900/50 shadow-md flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Deterministic Analytics Copilot
            </span>
            <span className="text-xs text-slate-400">Zero Hallucination Architecture</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            CampusIQ Copilot Decision Support
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Faculty and leadership can ask natural-language questions mapped to deterministic database queries. Facts, supporting numbers, student references, and recommended institutional actions are clearly distinguished.
          </p>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Quick Institutional Queries (Click to Run):
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs font-medium bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all text-left flex items-center gap-1.5"
            >
              <span>{prompt}</span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Display Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 min-h-[460px] max-h-[580px] overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none text-xs font-medium'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                <span className="font-bold">
                  {msg.sender === 'user' ? 'Faculty Advisor' : 'CampusIQ Analytics Engine'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Render formatted text */}
              <div
                className="text-xs leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />')
                }}
              />

              {/* Render Supporting Metrics Chips */}
              {msg.response && msg.response.supporting_metrics && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2 text-[11px]">
                  {Object.entries(msg.response.supporting_metrics).map(([k, v]) => (
                    <span
                      key={k}
                      className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-mono shadow-2xs"
                    >
                      <strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}
                    </span>
                  ))}
                </div>
              )}

              {/* Render Matched Students Card Grid */}
              {msg.response && msg.response.matched_students && msg.response.matched_students.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Referenced Student Records:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.response.matched_students.map((stu: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => stu.student_id && onSelectStudent(stu.student_id)}
                        className={`p-2.5 rounded-lg border bg-white hover:border-blue-400 transition-all ${
                          stu.student_id ? 'cursor-pointer hover:shadow-xs group' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600">
                            {stu.name || stu.department || stu.indicator}
                          </span>
                          {stu.student_id && (
                            <span className="font-mono text-[10px] text-blue-600 font-bold">
                              {stu.student_id}
                            </span>
                          )}
                        </div>

                        {stu.reason && (
                          <p className="text-[11px] text-rose-700 font-medium line-clamp-1 mt-0.5">
                            {stu.reason}
                          </p>
                        )}
                        {stu.affected_students !== undefined && (
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Affected: <strong>{stu.affected_students}</strong> ({stu.pct}%)
                          </p>
                        )}
                        {stu.cgpa && (
                          <div className="text-[10px] text-slate-500 flex gap-2 mt-1">
                            <span>CGPA: <strong>{stu.cgpa}</strong></span>
                            <span>Coding: <strong>{stu.coding_score}</strong></span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Render Recommended Next Steps */}
              {msg.response && msg.response.recommended_next_steps && msg.response.recommended_next_steps.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Recommended Next Actions:
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                    {msg.response.recommended_next_steps.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-none text-xs text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Querying student database and calculating deterministic analytics...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about student risk, departments, placement gaps, or trends..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
