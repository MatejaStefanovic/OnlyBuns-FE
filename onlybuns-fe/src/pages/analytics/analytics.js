import React from "react";
import post from "../../assets/images/post.png";
import com from "../../assets/images/comment.png";
import styles from "./analytics.module.css";
import { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip
} from "recharts";

const AnalyticsPage = () => {
 /* const radarData = [
    { metric: "Users with Posts", percentage: 35 },
    { metric: "Users with Only Comments", percentage: 45 },
    { metric: "Inactive Users", percentage: 20 },
  ];

  */

  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/users/analytics")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); 
      })
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching user activity:", error));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const radarData = [
    { metric: "Users with Posts", percentage: data.usersWithPosts },
    { metric: "Users with Only Comments", percentage: data.usersWithOnlyComments },
    { metric: "Inactive Users", percentage: data.inactiveUsers },
  ];
  

  return (
    <div className={styles.analyticsPg}>
      <h1>App analytics</h1>
      <div className={styles.diag}>
        <RadarChart
          cx="50%"
          cy="50%"
          width={800}
          height={300}
          data={radarData}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <Radar
            name="Percentage"
            dataKey="percentage"
            stroke="#4a6fa5"
            fill="#4a6fa5"
            fillOpacity={0.6}
          />
           <Tooltip
            formatter={(value, name, entry) =>
              ` ${value}%`
            }
          />
          <Legend />
        </RadarChart>
      </div>
      <div className={styles.posts}>
        <div className={styles.weekly}>
          <h2>Posts</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg} src={post} alt="Post" />
            <p className={styles.pi}>12</p>
          </div>
          <h3 className={styles.wh3}>weekly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Posts</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg} src={post} alt="Post" />
            <p className={styles.pi}>56</p>
          </div>
          <h3 className={styles.wh3}>monthly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Posts</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg} src={post} alt="Post" />
            <p className={styles.pi}>610</p>
          </div>
          <h3 className={styles.wh3}>yearly</h3>
        </div>
      </div>
      <div className={styles.comments}>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>59</p>
          </div>
          <h3 className={styles.wh32}>weekly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>590</p>
          </div>
          <h3 className={styles.wh32}>monthly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>5900</p>
          </div>
          <h3 className={styles.wh32}>yearly</h3>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
