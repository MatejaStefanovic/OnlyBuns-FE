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
    
   
    // async function addComment(postId, commentText) {
    //     if (!commentText.trim()) return;

    //     try {
    //         await fetch(`http://localhost:8080/api/posts/${postId}/comment?username=${username}&description=${commentText}`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`, 
    //             }
    //         });

    //         setPosts(posts.map(post =>
    //             post.id === postId

    //                 ? {
    //                     ...post,
    //                     comments: [...post.comments, { description: commentText, user: { username } }],
    //                 }
    //                 : post
    //         ));
    //     } catch (error) {
    //         console.error("Error adding comment:", error);
    //     }
    // }
    async function addComment(postId, commentText) {
        if (!commentText.trim()) return;
    
        try {
            const response = await fetch(`http://localhost:8080/api/posts/${postId}/comment?username=${username}&description=${commentText}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 403) {
                alert("You have exceeded the comment limit for the last hour.");
                return;
            }
    
            if (response.status === 404) {
                alert("Post or user not found.");
                return;
            }
    
            if (!response.ok) throw new Error('Failed to add comment');
    
            const updatedPost = await response.json();
    
            // Ažuriramo stanje sa vraćenim postom
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
    

    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch("http://localhost:8080/api/posts/all", {
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch posts');
                const data = await response.json();
    
                // Debugging: Log each post's likesList to verify its structure
                data.forEach(post => {
                    console.log(`Post ID: ${post.id}, Likes List:`, post.likesList);
                });
    
                // Sort and map posts to include isLiked based on likesList
                const sortedPosts = data
                    .sort((a, b) => new Date(b.creationDateTime) - new Date(a.creationDateTime))
                    .map(post => {
                        const isLiked = post.likesList?.some(like => like.username === username);
                        console.log(`Post ID: ${post.id}, isLiked by ${username}: ${isLiked}`);
                        const isFollowed = post.user.followers?.some(follower => follower.username === username) ?? false;
                        post.user.followers.forEach(follower => {
                            console.log(`Follower username: ${follower.username}`);
                        });
                        return {
                            ...post,
                            isLiked,
                            isFollowed
                            };
                    });
    
                setPosts(sortedPosts); 
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        }
    
        fetchPosts();
    }, [token, username]);
    
    async function followUser(user){
        try {
            const response = await fetch(`http://localhost:8080/api/users/follow?usernameFollower=${username}&usernameFollowing=${user.username}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                }
            });

            if (response.ok) {
                setPosts(posts.map(post =>
                post.user.username === user.username
                    ? { ...post, isFollowed: true }
                    : post
                ));
            } else if (response.status === 429) {
                const errorMessage = await response.text(); 
                alert(errorMessage || "You have reached the follow limit. Try again later.");
            } else {
                alert("An error occurred while following the user.");
            }
          
        } catch (error) {
            console.error("Error in follow function:", error);
        }
    }

    async function unfollowUser(user){
        try {
            await fetch(`http://localhost:8080/api/users/unfollow?usernameFollower=${username}&usernameFollowing=${user.username}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                }
            });
            setPosts(posts.map(post =>
                post.user.username === user.username
                  ? { ...post, isFollowed: false }
                  : post
              ));
        } catch (error) {
            console.error("Error in follow function:", error);
        }
    }

    async function deletePost(postId) {
        try {
            await fetch(`http://localhost:8080/api/posts/${postId}/delete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, 
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
        function editPost(post) {
            navigate(`/edit`, { state: { post } });
        }

    // async function toggleLike(postId) {
    //     setPosts(posts.map(post =>
    //         post.id === postId ? { ...post, isLiked: !post.isLiked } : post
    //     ));

    //     const post = posts.find(p => p.id === postId);
    //     const hasLiked = post.isLiked;

    //     try {
    //         if (hasLiked) {

    //             await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=-1`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`, 
    //                 }
    //             });

    //             setPosts(posts.map(p =>
    //                 p.id === postId
    //                     ? {
    //                         ...p,
    //                         likes: p.likes - 1,
    //                         likesList: p.likesList.filter(like => like.username !== username),
    //                         isLiked: false,
    //                     }
    //                     : p
    //             ));
    //         } else {
    //             await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=1`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`, 
    //                 }
    //             });
    //             setPosts(posts.map(p =>
    //                 p.id === postId
    //                     ? {
    //                         ...p,
    //                         likes: p.likes + 1,
    //                         likesList: [...p.likesList, { username }],
    //                         isLiked: true,
    //                     }
    //                     : p
    //             ));
    //         }
    //     } catch (error) {
    //         console.error("Error toggling like:", error);
    //     }
    // }

    async function toggleLike(postId) {
        // Pronađi post iz stanja
        const post = posts.find(p => p.id === postId);
        const hasLiked = post.isLiked;
        const flag = hasLiked ? -1 : 1;
       
        try {
          // Pošalji zahtev backend-u
          
          const response = await fetch(`http://localhost:8080/api/posts/${postId}/like?username=${username}&flag=${flag}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
      
          if (!response.ok) {
            // Prikaz poruka za greške
            if (response.status === 400) {
              alert("You cannot like or unlike this post due to invalid conditions.");
            } else {
              alert("An error occurred while processing your request.");
            }
            throw new Error("Failed to toggle like");
          }
      
          // Dobij ažurirani post sa backend-a
          const updatedPost = await response.json();
      
          // Proveri da li je korisnik lajkovao post
        const isLiked = updatedPost.likesList.some(like => like.user.username === username);
      
          // Ažuriraj stanje sa ispravnom vrednošću `isLiked`
          setPosts(posts.map(p => 
            p.id === postId 
              ? { ...updatedPost, isLiked } // Dodaj `isLiked` bazirano na `likesList`
              : p
          ));
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
                        {post.user ?.username != username && (
                             <button
                             className={styles.buttonFollow}
                             onClick={() => (post.isFollowed ? unfollowUser(post.user) : followUser(post.user))}
                         >
                             {post.isFollowed ? "Unfollow" : "Follow"}
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
                            style={{ cursor: 'pointer' }} 
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
                                    src={post.isLiked ? red : empty} // Menja se na osnovu `post.isLiked`
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
                            {post.user?.username === username && (
                                <button className={styles.button2} onClick={() => editPost(post)}>
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
