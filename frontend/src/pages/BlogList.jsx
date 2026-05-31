import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BLOGS } from '../data/blogs';
import SEO from '../components/SEO';

export default function BlogList() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SEO 
        title="Promptlyi Blog | AI Prompt Engineering Insights"
        description="Read the latest articles, tutorials, and insights on prompt engineering for ChatGPT, Midjourney, and more."
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="badge badge-orange mb-6 flex w-fit items-center gap-2">
              <BookOpen className="w-4 h-4" /> The Promptlyi Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              Master the art of <span className="gradient-text-dark">Prompt Engineering.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              Discover tips, tutorials, and industry insights to help you get the most out of AI models.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOGS.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <div className="badge bg-white/90 backdrop-blur-sm border-none shadow-sm text-gray-900 font-semibold">
                    Article
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-sm font-semibold text-gray-400 mb-3">{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-orange-500 transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-500 line-clamp-3 mb-6 flex-1">
                  {blog.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={blog.author.picture} alt={blog.author.name} className="w-8 h-8 rounded-full" />
                    <span className="text-sm font-semibold text-gray-700">{blog.author.name}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <ArrowRight className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
