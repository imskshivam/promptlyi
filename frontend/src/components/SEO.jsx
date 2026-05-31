import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = "Promptlyi · The Creator Economy for Prompt Engineers",
  description = "Discover, buy, and sell highly optimized AI prompts. Promptlyi is the premier marketplace for ChatGPT, Midjourney, and more.",
  keywords = "AI, Prompt Engineering, Prompt Marketplace, ChatGPT prompts, Midjourney prompts, AI tools",
  url = "https://promptlyi.com",
  image = "https://promptlyi.com/logo192.png"
}) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
