import { useEffect, useState } from 'react';
import styles from "./posts-view.module.css";
import red from '../../assets/images/redheart.png';
import empty from '../../assets/images/emptyheart.png';
import comm from '../../assets/images/com.png';
import trash from '../../assets/images/trash.png';

function PostsView() {
    const [posts, setPosts] = useState([]);
    const username = "lela"; 
    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch("http://localhost:8080/api/posts/all");
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data = await response.json();
                setPosts(data);
                const postsWithLikes = data.map(post => ({
                    ...post,
                    isLiked: post.likesList.some(like => like.username === username)
                }));
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }

        fetchPosts();
    }, []);

    /*function toggleLike(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, isLiked: !post.isLiked } : post
        ));
    }*/async function toggleLike(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, isLiked: !post.isLiked } : post
        ));

        const post = posts.find(p => p.id === postId);
        const hasLiked = post.isLiked;

        try {
            if (hasLiked) {
                // Call removeLike on the backend
                await fetch(`http://localhost:8080/api/posts/${postId}/removeLike?username=${username}&flag=1`, {
                    method: 'POST',
                });
                setPosts(posts.map(p =>
                    p.id === postId
                        ? {
                              ...p,
                              numLikes: p.numLikes - 1,
                              likesList: p.likesList.filter(like => like.username !== username),
                              isLiked: false,
                          }
                        : p
                ));
            } else {
                // Call addLike on the backend
                await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=-1`, {
                    method: 'POST',
                });
                setPosts(posts.map(p =>
                    p.id === postId
                        ? {
                              ...p,
                              numLikes: p.numLikes + 1,
                              likesList: [...p.likesList, { username }],
                              isLiked: true,
                          }
                        : p
                ));
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    }

    function toggleComments(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, showComments: !post.showComments } : post
        ));
    }

    return (
        <div className={styles.divzaView}>
            {posts.map((post) => {
                return (
                    <div key={post.id} className={styles.objava}>
                        <button className={styles.button}>
                            <img className={styles.tr} src={trash} alt="Trash Icon" />
                        </button>
                        <div className={styles.slika}>
                            <img className={styles.photo} 
                                 src={`data:image/png;base64,${post.image.imageBase64}`} 
                                 alt="Post image" />
                        </div>
                        <div className={styles.lajkovi}>
                            <p>15</p>
                            <div className={styles.lajk}>
                                <img
                                    id={`myImage-${post.id}`}
                                    className={styles.heartR}
                                    src={post.isLiked ? red : empty}
                                    onClick={() => toggleLike(post.id)}
                                    alt="Heart Icon"
                                />
                            </div>
                            <div className={styles.com} onClick={() => toggleComments(post.id)}>
                                <img src={comm} className={styles.coment} alt="Comment Icon" />
                            </div>
                        </div>
                        <div className={styles.opis}>{post.description}</div>

                        {post.showComments && (
                            <div className={styles.commentsSection}>
                                {post.comments.map((comment, index) => (
                                    <div key={index} className={styles.comment}>
                                        <strong>{comment.description}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default PostsView;
