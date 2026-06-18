'use client'

import { useState, useEffect } from 'react'
import { likePost, unlikePost, addComment } from '@/app/actions'

const EMPTY_ARRAY = []

export default function PostActions({ postId, initialLikes, userHasLiked, initialCommentsCount, commentsList = EMPTY_ARRAY, currentUser }) {
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(userHasLiked)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(commentsList)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync local state with server props when they change
  useEffect(() => {
    setLikes(initialLikes)
    setHasLiked(userHasLiked)
    setComments(commentsList)
    setCommentsCount(initialCommentsCount)
  }, [postId, initialLikes, userHasLiked, initialCommentsCount, commentsList])

  const handleLike = async () => {
    if (!currentUser) {
      alert("Please sign in to like posts.")
      return
    }
    
    // Optimistic update
    setHasLiked(!hasLiked)
    setLikes(prev => hasLiked ? prev - 1 : prev + 1)

    // Server action
    if (hasLiked) {
      const res = await unlikePost(postId)
      if (res.error) {
        // Revert on error
        setHasLiked(true)
        setLikes(prev => prev + 1)
      }
    } else {
      const res = await likePost(postId)
      if (res.error) {
        // Revert on error
        setHasLiked(false)
        setLikes(prev => prev - 1)
      }
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !currentUser || isSubmitting) return

    setIsSubmitting(true)
    
    // Optimistic update
    const newComment = {
      id: Date.now().toString(),
      content: commentText,
      user_id: currentUser.id,
      profiles: {
        name: currentUser.name,
        avatar_url: currentUser.avatar_url
      },
      created_at: new Date().toISOString()
    }
    
    setComments(prev => [newComment, ...prev])
    setCommentsCount(prev => prev + 1)
    const textToSubmit = commentText
    setCommentText('')

    // Server action
    const res = await addComment(postId, textToSubmit)
    if (res.error) {
       // Ideally revert, but skipping for MVP
       console.error(res.error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="post-actions-container">
      <div className="post-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button 
          className="action-btn" 
          onClick={handleLike}
          style={{ background: 'none', border: 'none', color: hasLiked ? 'var(--primary-orange)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', transition: 'color 0.2s' }}
        >
          <span className="icon">{hasLiked ? '❤️' : '🤍'}</span> {likes}
        </button>
        <button 
          className="action-btn" 
          onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', transition: 'color 0.2s' }}
        >
          <span className="icon">💬</span> {commentsCount}
        </button>
        <button 
          className="action-btn"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
        >
          <span className="icon">🔄</span> Repost
        </button>
      </div>
      
      {showComments && (
        <div className="comments-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', padding: '0.6rem 1rem', borderRadius: '20px', color: 'white', outline: 'none' }}
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting || !commentText.trim()} style={{ background: 'transparent', border: 'none', color: 'var(--primary-orange)', fontWeight: 'bold', cursor: commentText.trim() ? 'pointer' : 'not-allowed', opacity: commentText.trim() ? 1 : 0.5 }}>Post</button>
            </form>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Sign in to comment.</p>
          )}

          <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {comments.map(comment => (
              <div key={comment.id} className="comment" style={{ display: 'flex', gap: '0.8rem' }}>
                {comment.profiles?.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={comment.profiles.avatar_url} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                    {comment.profiles?.name ? comment.profiles.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>{comment.profiles?.name || 'Anonymous User'}</p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-color)' }}>{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
