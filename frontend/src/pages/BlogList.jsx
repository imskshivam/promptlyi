import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BLOGS } from '../data/blogs';
import SEO from '../components/SEO';

export default function BlogList() {
  return (
    <div className="min-h-screen bg-brand-lt_light pb-24">
      <SEO 
        title="Promptlyi Blog | AI Prompt Engineering Insights"
        description="Read the latest articles, tutorials, and insights on prompt engineering for ChatGPT, Midjourney, and more."
      />
      
      {/* Header */}
      <div className="bg-brand-lt_green pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="badge bg-brand-lt_lime/20 text-brand-lt_lime border-none mb-6 flex w-fit items-center gap-2">
              <BookOpen className="w-4 h-4" /> The Promptlyi Blog
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
              Master the art of <span className="text-brand-lt_lime">Prompt Engineering.</span>
            </h1>
            <p className="text-xl text-brand-lt_lime/80 font-medium leading-relaxed">
              Discover tips, tutorials, and industry insights to help you get the most out of AI models.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOGS.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col border-4 border-transparent hover:border-brand-lt_pink">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <div className="badge bg-brand-lt_purple text-white border-none shadow-sm font-bold">
                    Article
                  </div>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-sm font-bold text-gray-400 mb-3">{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <h3 className="text-2xl font-black text-brand-lt_purple mb-4 leading-snug group-hover:text-brand-lt_green transition-colors line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-500 font-medium line-clamp-3 mb-8 flex-1">
                  {blog.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-brand-lt_light">
                  <div className="flex items-center gap-3">
                    <img src={blog.author.picture} alt={blog.author.name} className="w-10 h-10 rounded-full" />
                    <span className="text-base font-bold text-gray-900">{blog.author.name}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-lt_lime flex items-center justify-center group-hover:bg-brand-lt_green transition-colors">
                    <ArrowRight className="w-5 h-5 text-brand-lt_green group-hover:text-brand-lt_lime transition-colors" />
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
