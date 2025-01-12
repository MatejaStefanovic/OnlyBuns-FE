import React, { useState, useEffect } from 'react';
import './trends.css';

const TrendsPage = () => {
  const [activeSection, setActiveSection] = useState('topLastWeek');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (section) => {
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      if (section === 'topLastWeek') {
        endpoint = 'http://localhost:8080/api/post/trending/lastWeek';
      } else if (section === 'topAllTime') {
        endpoint = 'http://localhost:8080/api/post/trending/allTime';
      } else if (section === 'mostActiveUsers') {
        endpoint = 'http://localhost:8080/api/trends/mostActiveUsers';
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch data');

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeSection);
  }, [activeSection]);

  return (
    <div>
      <div className="header-container">
        <div className="button-group">
          <button
            onClick={() => setActiveSection('topLastWeek')}
            className={activeSection === 'topLastWeek' ? 'active' : ''}
          >
            Top Posts Last Week
          </button>
          <button
            onClick={() => setActiveSection('topAllTime')}
            className={activeSection === 'topAllTime' ? 'active' : ''}
          >
            Top Posts of All Time
          </button>
          <button
            onClick={() => setActiveSection('mostActiveUsers')}
            className={activeSection === 'mostActiveUsers' ? 'active' : ''}
          >
            Most Active Users
          </button>
        </div>
      </div>

      <div>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && data.length === 0 && <p>No data available.</p>}
        {!loading && !error && data.length > 0 && (
          <div>
            {activeSection === "mostActiveUsers" ? (
              <ul>
                {data.map((user) => (
                  <li key={user.id}>
                    {user.username} - {user.activityCount} actions
                </li>
                ))}
              </ul>
            ) : (
                <div className="card-container">
                  {data.map((post) => (
                    <div key={post.id} className="individual-card">
                      <div className="card-header">
                        <h3 className="card-title">{post.description}</h3>
                        <p className="card-date">
                          <strong>Created On:</strong> {new Date(post.creationDateTime).toLocaleString()}
                        </p>
                      </div>
                      {post.image && (
                        <div className="card-image">
                          <img
                            src={`data:image/jpeg;base64,${post.image.imageBase64}`}
                            alt={post.image.relativePath}
                          />
                        </div>
                      )}
                      <div className="card-details">
                        <p>
                          <strong>Location:</strong> {post.location.city}, {post.location.street},{" "}
                          {post.location.country}
                        </p>
                        <p>
                          <strong>Likes:</strong> {post.likes}
                        </p>
                        <p>
                          <strong>Comments:</strong> {post.comments.length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsPage;