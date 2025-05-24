import React, { useEffect, useState } from 'react';
import './ChartList.css';
import { ChartSummary as Chart } from '../../../../src/models/level'; 

export const ChartList: React.FC = () => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        const fetchCharts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/charts');

                if (!response.ok) {
                    throw new Error('ネットワークエラー');
                }

                const result = await response.json();
                console.log('取得したデータ:', result);

                if (result.success) {
                    const formattedCharts = result.data.map((item: any) => {
                        const formattedTags = item.tags && Array.isArray(item.tags)
                            ? item.tags.map((tag: any) => {
                                if (tag && tag.title) {
                                    if (typeof tag.title === 'object') {
                                        return tag.title.ja || tag.title.en || 'タグ';
                                    }
                                    return tag.title;
                                }
                                return 'タグ';
                            })
                            : [];

                        return {
                            ...item,
                            tags: formattedTags
                        };
                    });

                    setCharts(formattedCharts);
                    console.log('変換後のデータ:', formattedCharts);
                } else {
                    throw new Error(result.message || 'データの取得に失敗');
                }
            } catch (err) {
                console.error('エラー:', err);
                setError(err instanceof Error ? err.message : '不明なエラー');
            } finally {
                setLoading(false);
            }
        };

        fetchCharts();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return <div className="loading-container">読込中</div>;
    }

    if (error) {
        return <div className="error-container">エラー: {error}</div>;
    }

    if (charts.length === 0) {
        return <div className="empty-container">譜面が存在しません。</div>;
    }

    return (
        <div className="chart-list-container">
            <h1 className="chart-list-title">譜面一覧</h1>
            <div className="chart-grid">
                {charts
                    .filter(chart => chart.meta?.isPublic !== false)
                    .map((chart) => (
                        <a
                            href={`/charts/${chart.name}`}
                            className="chart-card"
                            key={chart.name}
                        >
                        <div className="chart-image-container">
                            <img
                                src={chart.coverUrl !== "Unknown" ? chart.coverUrl : '/default-cover.jpg'}
                                alt={chart.title}
                                className="chart-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/default-cover.jpg';
                                }}
                            />
                        </div>
                        <div className="chart-info">
                            <h3 className="chart-title">{chart.title}</h3>
                            <p className="chart-artist">{chart.artist}</p>
                            <div className="chart-details">
                                <p className="chart-author">作者: {chart.author}</p>
                                <div className="chart-rating">
                                    難易度: <span className="difficulty-number">{chart.rating}</span>
                                </div>
                                <p className="chart-date">投稿日: {formatDate(chart.uploadDate)}</p>
                            </div>
                            <div className="chart-tags">
                                {chart.tags && chart.tags.map((tag, index) => (
                                    <span key={index} className="chart-tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ChartList;