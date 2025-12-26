"use client";

import { useState, useEffect } from "react";
import { User, Send, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PostDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetch(`/api/community/${params.id}`).then(res => res.json()).then(setPost);
  }, [params.id]);

  const handleReply = async () => {
    if (!reply) return;
    const res = await fetch(`/api/community/${params.id}`, {
      method: 'POST',
      body: JSON.stringify({
        content: reply,
        author: session?.user?.name || "Anonymous",
        author_image: session?.user?.image || ""
      })
    });
    if (res.ok) {
      setReply("");
      window.location.reload();
    }
  };

  if (!post) return <div className="min-h-screen pt-40 text-center font-bold text-slate-400">Loading discussion...</div>;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-4xl mx-auto">
      <Link href="/community" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Forum
      </Link>

      {/* Main Question Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 mb-8">
        <h1 className="text-3xl font-black text-slate-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-6">
           <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
             {post.author[0]}
           </div>
           <div>
             <p className="font-bold text-slate-900">{post.author}</p>
             <p className="text-xs text-slate-500">Asked on {new Date(post.createdAt).toLocaleDateString()}</p>
           </div>
        </div>
        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Answers Section */}
      <h3 className="font-bold text-slate-900 text-xl mb-6 px-2">{post.replies.length} Answers</h3>
      
      <div className="space-y-6 mb-12">
        {post.replies.map((r: any, i: number) => (
          <div key={i} className="bg-white/60 p-6 rounded-[2rem] border border-slate-200 ml-4 md:ml-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-bold text-slate-800 text-sm">{r.author}</span>
              <span className="text-xs text-slate-400">• {new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-slate-600">{r.content}</p>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-lg sticky bottom-6 flex gap-4 items-center">
        <input 
          className="flex-1 bg-slate-50 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Type your answer here..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleReply()}
        />
        <button onClick={handleReply} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-orange-500 transition-colors">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}