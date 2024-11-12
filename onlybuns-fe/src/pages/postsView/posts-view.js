import { useEffect, useState } from 'react';
import styles from "./posts-view.module.css";
import red from '../../assets/images/redheart.png';
import empty from '../../assets/images/emptyheart.png';
import comm from '../../assets/images/com.png';
import trash from '../../assets/images/trash.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

function PostsView() {
    const [posts, setPosts] = useState([]);
    const { user, token } = useUser();
    const navigate = useNavigate();
    const username = user ?.username;
    async function addComment(postId, commentText) {
        if (!commentText.trim()) return;

        try {
            await fetch(`http://localhost:8080/api/posts/${postId}/comment?username=${username}&description=${commentText}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include JWT token in Authorization header
                }
            });

            setPosts(posts.map(post =>
                post.id === postId

                    ? {
                        ...post,
                        comments: [...post.comments, { description: commentText, user: { username } }],
                    }
                    : post
            ));
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    }

    /*useEffect(() => {
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
    }, []);*/

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch("http://localhost:8080/api/posts/all", {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include JWT token in Authorization header
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data = await response.json();

                // Sort posts by creationDateTime in descending order (newest first)
                const sortedPosts = data
                    .sort((a, b) => new Date(b.creationDateTime) - new Date(a.creationDateTime))
                    .map(post => ({
                        ...post,
                        isLiked: post.likesList.some(like => like.username === username)
                    }));

                setPosts(sortedPosts); // Set the sorted posts with the isLiked property
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }

        fetchPosts();
    }, [token, username]);

    async function deletePost(postId) {
        try {
            await fetch(`http://localhost:8080/api/posts/${postId}/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include JWT token in Authorization header
                }
            });
            setPosts(posts.filter(post => post.id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }

    /*function toggleLike(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, isLiked: !post.isLiked } : post
        ));

        
    }*/
    function editPost(postId) {
        navigate(`/post`);
    }

    async function toggleLike(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, isLiked: !post.isLiked } : post
        ));

        const post = posts.find(p => p.id === postId);
        const hasLiked = post.isLiked;

        try {
            if (hasLiked) {

                await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=-1`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include JWT token in Authorization header
                    }
                });

                setPosts(posts.map(p =>
                    p.id === postId
                        ? {
                            ...p,
                            likes: p.likes - 1,
                            likesList: p.likesList.filter(like => like.username !== username),
                            isLiked: false,
                        }
                        : p
                ));
            } else {
                await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=1`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include JWT token in Authorization header
                    }
                });
                setPosts(posts.map(p =>
                    p.id === postId
                        ? {
                            ...p,
                            likes: p.likes + 1,
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
                        {post.user ?.username === username && (
                            <button className={styles.button} onClick={() => deletePost(post.id)}>
                                <img className={styles.tr} src={trash} alt="Trash Icon" />
                            </button>
                        )}

                        <div className={styles.slika}>
                            {post.image ?.imageBase64 ? (
                                <img
                                    className={styles.photo}
                                    src={`data:image/png;base64,${post.image.imageBase64}`}
                                    alt="Post image"
                                />
                            ) : (
                                    <img
                                        className={styles.photo}
                                        src={red}
                                        alt="Default image"
                                    />
                                )}
                        </div>
                        <p 
                            className={styles.p11} 
                            onClick={() => navigate(`/profile/${post.user?.username}`)}
                            style={{ cursor: 'pointer' }} // Optional, shows a pointer cursor on hover
                        >
                            @{post.user?.username}
                        </p>
                        <div className={styles.lajkovi}>

                            <p>{post.likes}</p>
                            <div className={styles.lajk}>
                                {user ? (
                                    <img
                                        id={`myImage-${post.id}`}
                                        className={styles.heartR}
                                        src={post.isLiked ? red : empty}
                                        onClick={() => toggleLike(post.id)}
                                        alt="Heart Icon"
                                    />
                                ) : (
                                        <p></p>
                                    )}

                            </div>
                            <div className={styles.com} onClick={() => toggleComments(post.id)}>
                                {user ? (
                                    <img src={comm} className={styles.coment} alt="Comment Icon" />
                                ) : (
                                        <p></p>
                                    )}

                            </div>
                            {post.user ?.username === username && (
                                <button className={styles.button2} onClick={() => editPost(post.id)}>
                                    edit
                                </button>
                            )}
                        </div>
                        <div className={styles.opis}>{post.description}</div>

                        {post.showComments && (
                            <div className={styles.commentsSection}>
                                {post.comments.map((comment, index) => (
                                    <div key={index} className={styles.comment}>
                                        <strong>{comment.user ?.username}</strong>: {comment.description}
                                    </div>
                                ))}
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const commentText = e.target.comment.value;
                                        addComment(post.id, commentText);
                                        e.target.comment.value = '';
                                    }}
                                    className={styles.commentForm}
                                >
                                    <input
                                        type="text"
                                        name="comment"
                                        placeholder="Add a comment..."
                                        className={styles.commentInput}
                                    />
                                    <button type="submit" className={styles.commentButton} >Post</button>
                                </form>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default PostsView;
