import React from 'react';
import { Search, PenTool, CheckCircle, Share2, Play, Loader2, AlertCircle, FileText, ChevronRight, RefreshCw, Globe, Sparkles } from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  switch (name) {
    case 'Search': return <Search className={className} />;
    case 'PenTool': return <PenTool className={className} />;
    case 'CheckCircle': return <CheckCircle className={className} />;
    case 'Share2': return <Share2 className={className} />;
    case 'Play': return <Play className={className} />;
    case 'Loader2': return <Loader2 className={className} />;
    case 'AlertCircle': return <AlertCircle className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'ChevronRight': return <ChevronRight className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return <FileText className={className} />;
  }
};
