import React from 'react';
import {
  Search, PenTool, CheckCircle, Share2, Play, Loader2, AlertCircle, FileText,
  ChevronRight, RefreshCw, Globe, Sparkles,
  Calendar, Clock, User, Tag, ChevronLeft, Activity, Zap, Target, MessageSquare,
} from 'lucide-react';

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
    case 'Calendar': return <Calendar className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'User': return <User className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'ChevronLeft': return <ChevronLeft className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Target': return <Target className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    default: return <FileText className={className} />;
  }
};
