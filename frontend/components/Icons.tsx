import React from 'react';
import {
  Search, PenTool, CheckCircle, Share2, Play, Loader2, AlertCircle, FileText,
  ChevronRight, RefreshCw, Globe, Sparkles,
  Calendar, Clock, User, Tag, ChevronLeft, Activity, Zap, Target, MessageSquare,
  Home, ClipboardList, Plus, Calculator, Bug, Building2, Phone, Edit2, Trash2,
  X, TrendingUp, DollarSign, Filter, MapPin, Shield, Download, Send,
  MoreVertical, ChevronDown, ChevronUp, ArrowRight, BarChart2, CheckSquare,
  Star, Package, Briefcase, Layers, Info, Check, Bell, LogOut, Settings,
  Users, FileCheck, Banknote, HelpCircle, RotateCcw,
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const p = { className };
  switch (name) {
    case 'Search': return <Search {...p} />;
    case 'PenTool': return <PenTool {...p} />;
    case 'CheckCircle': return <CheckCircle {...p} />;
    case 'Share2': return <Share2 {...p} />;
    case 'Play': return <Play {...p} />;
    case 'Loader2': return <Loader2 {...p} />;
    case 'AlertCircle': return <AlertCircle {...p} />;
    case 'FileText': return <FileText {...p} />;
    case 'ChevronRight': return <ChevronRight {...p} />;
    case 'RefreshCw': return <RefreshCw {...p} />;
    case 'Globe': return <Globe {...p} />;
    case 'Sparkles': return <Sparkles {...p} />;
    case 'Calendar': return <Calendar {...p} />;
    case 'Clock': return <Clock {...p} />;
    case 'User': return <User {...p} />;
    case 'Tag': return <Tag {...p} />;
    case 'ChevronLeft': return <ChevronLeft {...p} />;
    case 'Activity': return <Activity {...p} />;
    case 'Zap': return <Zap {...p} />;
    case 'Target': return <Target {...p} />;
    case 'MessageSquare': return <MessageSquare {...p} />;
    case 'Home': return <Home {...p} />;
    case 'ClipboardList': return <ClipboardList {...p} />;
    case 'Plus': return <Plus {...p} />;
    case 'Calculator': return <Calculator {...p} />;
    case 'Bug': return <Bug {...p} />;
    case 'Building2': return <Building2 {...p} />;
    case 'Phone': return <Phone {...p} />;
    case 'Edit2': return <Edit2 {...p} />;
    case 'Trash2': return <Trash2 {...p} />;
    case 'X': return <X {...p} />;
    case 'TrendingUp': return <TrendingUp {...p} />;
    case 'DollarSign': return <DollarSign {...p} />;
    case 'Filter': return <Filter {...p} />;
    case 'MapPin': return <MapPin {...p} />;
    case 'Shield': return <Shield {...p} />;
    case 'Download': return <Download {...p} />;
    case 'Send': return <Send {...p} />;
    case 'MoreVertical': return <MoreVertical {...p} />;
    case 'ChevronDown': return <ChevronDown {...p} />;
    case 'ChevronUp': return <ChevronUp {...p} />;
    case 'ArrowRight': return <ArrowRight {...p} />;
    case 'BarChart2': return <BarChart2 {...p} />;
    case 'CheckSquare': return <CheckSquare {...p} />;
    case 'Star': return <Star {...p} />;
    case 'Package': return <Package {...p} />;
    case 'Briefcase': return <Briefcase {...p} />;
    case 'Layers': return <Layers {...p} />;
    case 'Info': return <Info {...p} />;
    case 'Check': return <Check {...p} />;
    case 'Bell': return <Bell {...p} />;
    case 'LogOut': return <LogOut {...p} />;
    case 'Settings': return <Settings {...p} />;
    case 'Users': return <Users {...p} />;
    case 'FileCheck': return <FileCheck {...p} />;
    case 'Banknote': return <Banknote {...p} />;
    case 'HelpCircle': return <HelpCircle {...p} />;
    case 'RotateCcw': return <RotateCcw {...p} />;
    default: return <FileText {...p} />;
  }
};
