import Image from 'next/image';
import Link from 'next/link';
import './postcard.css';
import PostActions from './PostActions';

export default function PostCard({ post, currentUser }) {
  return (
    <div id={`post-${post.id}`} className="card glass-panel postcard">
      <div className="post-header">
        <Link href={post.author.id ? `/user/${post.author.id}` : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="author-avatar" style={{ cursor: 'pointer' }}>
            {post.author.initials}
          </div>
        </Link>
        <div className="author-info">
          <Link href={post.author.id ? `/user/${post.author.id}` : '#'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h4 className="author-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexWrap: 'wrap' }}>
              {post.author.name}
              {post.author.isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: ['government', 'institution', 'agency'].includes(post.author.accountType?.toLowerCase()) ? 'var(--primary-orange)' : '#1DA1F2', color: 'white', fontSize: '0.6rem' }}>✓</span>
              )}
              {(post.author.accountType === 'government' || post.author.accountType === 'institution') && (
                <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,107,0,0.15)', color: 'var(--primary-orange)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  ✓ Official
                </span>
              )}
            </h4>
          </Link>
          <p className="author-title">{post.author.title} • {post.author.location}</p>
        </div>
        <div className="post-time">{post.time}</div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <div className="post-image-container" style={{ marginTop: '1rem' }}>
            {post.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '400px', display: 'block' }} />
            ) : (
              <div className="mock-image" style={{ backgroundColor: post.imageColor, borderRadius: '12px', height: '200px', width: '100%' }}></div>
            )}
          </div>
        )}
      </div>

      <PostActions 
        postId={post.id} 
        initialLikes={post.likes} 
        userHasLiked={post.userHasLiked} 
        initialCommentsCount={post.comments} 
        commentsList={post.commentsList} 
        currentUser={currentUser} 
      />
    </div>
  );
}
