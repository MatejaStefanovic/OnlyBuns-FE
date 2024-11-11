import "./posts-view.module.css";
import red from '../../assets/images/redheart.png';
import empty from '../../assets/images/emptyheart.png';
import comm from '../../assets/images/com.png';
import sl from '../../assets/images/nature.jpg';
import trash from '../../assets/images/trash.png';
import { useState } from 'react';

function PostsView() {
    const [posts, setPosts] = useState([
        {
            id: 1,
            isLiked: false,
            showComments: false,
            comments: [
                { username: "user1", content: "This is a beautiful photo!" },
                { username: "user2", content: "Amazing shot!" }
            ]
        },
        {
            id: 2,
            isLiked: false,
            showComments: false,
            comments: [
                { username: "user3", content: "Stunning view!" },
                { username: "user4", content: "Love this place!" }
            ]
        },{
            id: 2,
            isLiked: false,
            showComments: false,
            comments: [
                { username: "user3", content: "Stunning view!" },
                { username: "user4", content: "Love this place!" }
            ]
        }
       
    ]);

    function toggleLike(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, isLiked: !post.isLiked } : post
        ));
    }

    // Toggle comments visibility for a specific post
    function toggleComments(postId) {
        setPosts(posts.map(post =>
            post.id === postId ? { ...post, showComments: !post.showComments } : post
        ));
    }

    return (
        <div className="divzaView">
            {posts.map((post) => (
                <div key={post.id} className="objava">
                    <button className="bbuton"><img className="tr" src={trash} alt="Trash Icon" /></button>
                    <div className="slika"><img className="photo" src={sl} alt="Nature" /></div>
                    <div className="lajkovi">
                        <p>15</p>
                        <div className="lajk">
                            <img
                                id={`myImage-${post.id}`}
                                className="heartR"
                                src={post.isLiked ? red : empty}
                                onClick={() => toggleLike(post.id)}
                                alt="Heart Icon"
                            />
                        </div>
                        <div className="com" onClick={() => toggleComments(post.id)}>
                            <img src={comm} className="coment" alt="Comment Icon" />
                        </div>
                    </div>
                    <div className="opis">OVde ide kao opis slikee</div>

                    {/* Comments section that appears when showComments is true for the specific post */}
                    {post.showComments && (
                        <div className="commentsSection">
                            {post.comments.map((comment, index) => (
                                <div key={index} className="comment">
                                    <strong>{comment.username}</strong>: {comment.content}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default PostsView;
