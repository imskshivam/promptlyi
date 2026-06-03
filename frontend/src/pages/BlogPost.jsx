import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Share2, Twitter, Linkedin } from 'lucide-react';
import { BLOGS } from '../data/blogs';
import SEO from '../components/SEO';

export default function BlogPost() {
  const { slug } = useParams();
  const blog = BLOGS.find(b => b.slug === slug);

  if (!blog) {
    return <Navigate to="/blog" replace />;
  }

  const shareUrl = `https://promtlyi.com/blog/${blog.slug}`;

  return (
    <div className="min-h-screen bg-brand-lt_light">
      <SEO 
        title={`${blog.title} | Promptlyi Blog`}
        description={blog.description}
        image={blog.coverImage}
        url={shareUrl}
      />
      
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-black text-brand-lt_purple hover:text-brand-lt_green transition-colors mb-10 bg-brand-lt_pink px-4 py-2 rounded-full">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>
        
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-brand-lt_purple tracking-tight leading-[1.1] mb-8">
          {blog.title}
        </h1>
        
        <div className="flex items-center justify-between border-y-4 border-brand-lt_pink py-6 mb-12">
          <div className="flex items-center gap-4">
            <img src={blog.author.picture} alt={blog.author.name} className="w-14 h-14 rounded-full ring-4 ring-brand-lt_lime" />
            <div>
              <div className="font-black text-brand-lt_purple text-lg">{blog.author.name}</div>
              <div className="text-sm font-bold text-gray-500">{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-brand-lt_pink flex items-center justify-center text-brand-lt_purple hover:bg-brand-lt_purple hover:text-white transition-all font-bold">
              <Share2 className="w-5 h-5" />
            </button>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${blog.title}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-brand-lt_pink flex items-center justify-center text-brand-lt_purple hover:bg-brand-lt_purple hover:text-white transition-all font-bold">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="aspect-[2/1] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-brand-lt_pink">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <div className="prose prose-lg prose-purple max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-4xl font-black text-brand-lt_purple mt-12 mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-3xl font-black text-brand-lt_purple mt-10 mb-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-2xl font-black text-brand-lt_purple mt-8 mb-4" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-6 font-medium" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2 font-medium" {...props} />,
              li: ({node, ...props}) => <li {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-8 border-brand-lt_purple pl-6 italic text-brand-lt_purple font-bold my-8 bg-brand-lt_pink py-6 pr-6 rounded-r-3xl" {...props} />,
              strong: ({node, ...props}) => <strong className="font-black text-brand-lt_purple" {...props} />,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
