"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, Search, User, ThumbsUp, MessageSquare, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });

  useEffect(() => {
    fetch('/api/community').then(res => res.json()).then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const handlePost = async () => {
    if (!newPost.title || !newPost.content) return;
    const res = await fetch('/api/community', {
      method: 'POST',
      body: JSON.stringify({
        ...newPost,
        author: session?.user?.name || "Anonymous",
        author_image: session?.user?.image || ""
      })
    });
    if (res.ok) {
      setShowModal(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full shadow-sm mb-4">
             <MessageCircle size={14} className="text-orange-600" /> 
             <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Jan-Manch Forum</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">Discussions.</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Ask questions, share experiences, and get help from verified experts and fellow citizens.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2"
        >
          <Plus size={18} /> Ask Question
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={32}/></div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Link href={`/community/${post._id}`} key={post._id}>
              <div className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {post.author_image ? (
                      <img src={post.author_image} className="w-10 h-10 rounded-full border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><User size={20}/></div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{post.author}</p>
                      <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{post.category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{post.title}</h3>
                <p className="text-slate-500 line-clamp-2 mb-4">{post.content}</p>
                
                <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                  <span className="flex items-center gap-2"><MessageSquare size={16}/> {post.replies.length} Answers</span>
                  <span className="flex items-center gap-2"><ThumbsUp size={16}/> {post.upvotes} Helpful</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Ask Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-6">Ask the Community</h2>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500 mb-4"
              placeholder="What's your question?"
              value={newPost.title}
              onChange={e => setNewPost({...newPost, title: e.target.value})}
            />
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium outline-none focus:ring-2 focus:ring-orange-500 mb-4 h-32 resize-none"
              placeholder="Describe your issue in detail..."
              value={newPost.content}
              onChange={e => setNewPost({...newPost, content: e.target.value})}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-full">Cancel</button>
              <button onClick={handlePost} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600">Post Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}