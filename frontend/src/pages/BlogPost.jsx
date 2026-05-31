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

  const shareUrl = `https://promptlyi.com/blog/${blog.slug}`;

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title={`${blog.title} | Promptlyi Blog`}
        description={blog.description}
        image={blog.coverImage}
        url={shareUrl}
      />
      
      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
          {blog.title}
        </h1>
        
        <div className="flex items-center justify-between border-y border-gray-100 py-6 mb-12">
          <div className="flex items-center gap-4">
            <img src={blog.author.picture} alt={blog.author.name} className="w-12 h-12 rounded-full ring-2 ring-gray-100" />
            <div>
              <div className="font-bold text-gray-900">{blog.author.name}</div>
              <div className="text-sm text-gray-500">{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${blog.title}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-200 transition-all">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="aspect-[2/1] rounded-3xl overflow-hidden shadow-sm">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        <div className="prose prose-lg prose-orange max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-black text-gray-900 mt-12 mb-6" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-black text-gray-900 mt-10 mb-5" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4" {...props} />,
              p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-6" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2" {...props} />,
              li: ({node, ...props}) => <li {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-orange-500 pl-6 italic text-gray-700 my-8 bg-orange-50/50 py-4 rounded-r-xl" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
