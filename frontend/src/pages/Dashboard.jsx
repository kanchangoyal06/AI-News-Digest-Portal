import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Download, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const fetchArticles = async () => {
  // Fetch a larger limit so we can group effectively, ignore timeframe filter as we group by date
  const { data } = await axios.get(`/news?timeframe=all&limit=100`);
  return data;
};

const Dashboard = () => {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  // Cache the generated blob URLs by date string to allow instant redownloads
  const [blobUrls, setBlobUrls] = useState({});

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  // Group articles by date fetched (createdAt)
  const groupedArticles = (data?.articles || []).reduce((acc, article) => {
    // Fallback to publishedAt if createdAt is missing for some reason
    const dateStr = format(new Date(article.createdAt || article.publishedAt), 'MMM dd, yyyy');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(article);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedArticles).sort((a, b) => new Date(b) - new Date(a));

  const downloadGroupDigest = async (dateStr, articlesInGroup) => {
    // If we already have a blob URL for this date, just redownload it instantly
    if (blobUrls[dateStr]) {
      triggerDownload(blobUrls[dateStr], dateStr);
      return;
    }

    setSending(true);
    try {
      // Sort by importance and take top 5
      const topArticles = [...articlesInGroup]
        .sort((a, b) => b.importanceScore - a.importanceScore)
        .slice(0, 5);
        
      const ids = topArticles.map(a => a._id);

      const response = await axios.post('/digests/download', {
        articleIds: ids
      }, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      setBlobUrls(prev => ({ ...prev, [dateStr]: url }));
      
      triggerDownload(url, dateStr);

      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error downloading digest', err);
      alert('Error downloading digest');
    } finally {
      setSending(false);
    }
  };

  const triggerDownload = (url, dateStr) => {
    const link = document.createElement('a');
    link.href = url;
    // Format file name safely
    const safeDateStr = format(new Date(dateStr), 'yyyy-MM-dd');
    link.setAttribute('download', `AI_News_Digest_${safeDateStr}.eml`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  useEffect(() => {
    let intervalId;
    
    if (isPolling) {
      intervalId = setInterval(async () => {
        try {
          const { data: statusData } = await axios.get('/news/status');
          if (!statusData.isCollecting) {
            setIsPolling(false);
            
            // Collection finished! Fetch latest articles
            const latestData = await fetchArticles();
            
            // Find today's group
            const todayStr = format(new Date(), 'MMM dd, yyyy');
            const newArticles = latestData?.articles?.filter(a => {
               const dStr = format(new Date(a.createdAt || a.publishedAt), 'MMM dd, yyyy');
               return dStr === todayStr;
            }) || [];
            
            if (newArticles.length > 0) {
              // Auto download for today's group
              downloadGroupDigest(todayStr, newArticles);
            } else {
               alert('News collection finished, but no new highly-relevant articles were found today.');
            }
          }
        } catch (err) {
          console.error('Error polling status', err);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling]); // Only depends on isPolling, handles internal logic independently

  const triggerCollection = async () => {
    try {
      console.log('Triggering news collection...');
      await axios.post('/news/collect');
      alert('Fetching latest news... This may take a minute. The digest will automatically download when ready.');
      setIsPolling(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error';
      console.error('Error starting news collection:', err);
      alert(`Error starting collection: ${msg}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">News Digests</h2>
          <p className="text-sm text-gray-500 mt-1">Daily AI-curated news summaries grouped by date.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={triggerCollection}
            disabled={isPolling || sending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary-hover disabled:opacity-50 rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <RefreshCw size={16} className={isPolling ? "animate-spin" : ""} />
            {isPolling ? "Fetching News..." : "Fetch Latest News"}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle2 size={20} />
          Digest file downloaded successfully!
        </div>
      )}

      {isLoading || isRefetching ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : isError ? (
        <div className="text-red-500 flex items-center justify-center gap-2 py-10">
          <AlertCircle /> Failed to load articles
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
          No articles found. Fetch some news to get started.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map(dateStr => {
            const articles = groupedArticles[dateStr];
            const hasBlob = !!blobUrls[dateStr];
            
            return (
              <div key={dateStr} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">{dateStr}</h3>
                  <button 
                    onClick={() => downloadGroupDigest(dateStr, articles)}
                    disabled={sending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm border shadow-sm ${
                      hasBlob 
                        ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50" 
                        : "bg-gray-800 text-white border-transparent hover:bg-gray-900"
                    } disabled:opacity-50`}
                  >
                    <Download size={16} />
                    {hasBlob ? "Redownload Digest" : "Download Top 5 Digest"}
                  </button>
                </div>
                
                <div className="p-4 grid gap-4">
                  {articles.map((article, idx) => (
                    <div 
                      key={article._id} 
                      className="rounded-xl border p-5 border-gray-200 hover:border-gray-300 transition-all flex gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                            <a href={article.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-2">
                              {idx + 1}. {article.title}
                              <ExternalLink size={14} className="text-gray-400" />
                            </a>
                          </h3>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Score: {article.importanceScore}/10</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                          <span className="text-primary/80">{article.source}</span>
                          <span>•</span>
                          <span>{format(new Date(article.publishedAt), 'MMM dd, yyyy h:mm a')}</span>
                        </div>
                        
                        <p className="mt-4 text-gray-700 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                          {article.summary}
                        </p>
                        
                        {article.categories && article.categories.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {article.categories.map((cat, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded text-xs">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Loader = () => (
  <div className="flex flex-col items-center gap-2 text-primary">
    <RefreshCw className="animate-spin" size={32} />
    <span className="text-sm font-medium">Loading AI Summaries...</span>
  </div>
);

export default Dashboard;
