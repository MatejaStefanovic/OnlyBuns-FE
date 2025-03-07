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
  
  const [postsWeekly, setPW] = useState(0);
  const [postsMonthly, setPM] = useState(0);
  const [postsYearly, setPY] = useState(0);

  const [commentsWeekly, setCW] = useState(0);
  const [commentsMonthly, setCM] = useState(0);
  const [commentsYearly, setCY] = useState(0);


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


  useEffect(() => {
    fetch("http://localhost:8080/api/post/weekly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((weeklyPosts) => setPW(weeklyPosts))
      .catch((error) =>
        console.error("Error fetching weekly post statistics:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/comment/weekly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((weeklyComments) => setCW(weeklyComments))
      .catch((error) =>
        console.error("Error fetching weekly post statistics:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/post/monthly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((monthlyPosts) => setPM(monthlyPosts))
      .catch((error) =>
        console.error("Error fetching weekly post statistics:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/comment/monthly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((monthlyComments) => setCM(monthlyComments))
      .catch((error) =>
        console.error("Error fetching weekly post statistics:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/api/post/yearly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((yearlyPosts) => setPY(yearlyPosts))
      .catch((error) =>
        console.error("Error fetching yearly post statistics:", error)
      );
  }, []);
  useEffect(() => {
    fetch("http://localhost:8080/api/comment/yearly")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((yearlyComments) => setCY(yearlyComments))
      .catch((error) =>
        console.error("Error fetching yearly post statistics:", error)
      );
  }, []);


  const radarData = data
  ? [
      { metric: "Users with Posts", percentage: data.usersWithPosts || 0 },
      { metric: "Users with Only Comments", percentage: data.usersWithOnlyComments || 0 },
      { metric: "Inactive Users", percentage: data.inactiveUsers || 0 },
    ]
  : [];


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
            <p className={styles.pi}>{postsWeekly}</p>
          </div>
          <h3 className={styles.wh3}>weekly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Posts</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg} src={post} alt="Post" />
            <p className={styles.pi}>{postsMonthly}</p>
          </div>
          <h3 className={styles.wh3}>monthly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Posts</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg} src={post} alt="Post" />
            <p className={styles.pi}>{postsYearly}</p>
          </div>
          <h3 className={styles.wh3}>yearly</h3>
        </div>
      </div>
      <div className={styles.comments}>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>{commentsWeekly}</p>
          </div>
          <h3 className={styles.wh32}>weekly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>{commentsMonthly}</p>
          </div>
          <h3 className={styles.wh32}>monthly</h3>
        </div>
        <div className={styles.weekly}>
          <h2>Comments</h2>
          <div className={styles.inner}>
            <img className={styles.innerimg2} src={com} alt="Com" />
            <p className={styles.pi2}>{commentsYearly}</p>
          </div>
          <h3 className={styles.wh32}>yearly</h3>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
