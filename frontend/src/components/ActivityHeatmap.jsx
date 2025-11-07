import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const ActivityHeatmap = ({ username }) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, [username]);

  const fetchActivity = async () => {
    try {
      const response = await analyticsAPI.getUserActivity(username);
      setActivity(response.data.activity);
    } catch (error) {
      console.error('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const getIntensity = (count) => {
    if (count === 0) return 'empty';
    if (count <= 2) return 'low';
    if (count <= 5) return 'medium';
    if (count <= 10) return 'high';
    return 'very-high';
  };

  const generateHeatmapData = () => {
    const data = {};
    activity.forEach(item => {
      data[item._id] = item.count;
    });
    
    const heatmap = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = data[dateStr] || 0;
      
      heatmap.push({
        date: dateStr,
        count,
        intensity: getIntensity(count)
      });
    }
    
    return heatmap;
  };

  if (loading) {
    return <div className="heatmap-loading">Loading activity...</div>;
  }

  const heatmapData = generateHeatmapData();
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="activity-heatmap">
      <h3>Contribution Activity</h3>
      <div className="heatmap-container">
        <div className="heatmap-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`heatmap-day ${day.intensity}`}
                  title={`${day.date}: ${day.count} contributions`}
                ></div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-box empty"></div>
          <div className="legend-box low"></div>
          <div className="legend-box medium"></div>
          <div className="legend-box high"></div>
          <div className="legend-box very-high"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;