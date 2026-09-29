from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from database import get_db
from models import User, ProblemAttempt
from dependencies import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/summary")
async def get_summary(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    from sqlalchemy import case
    
    # 1. Single efficient query for all aggregations
    query = (
        select(
            ProblemAttempt.pattern_tag,
            func.count(ProblemAttempt.id).label("attempts"),
            func.sum(case((ProblemAttempt.outcome == "solved", 1), else_=0)).label("solved")
        )
        .where(ProblemAttempt.user_id == current_user.id)
        .group_by(ProblemAttempt.pattern_tag)
    )
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    total_attempts = sum(row.attempts for row in rows)
    pattern_breakdown = []
    weak_patterns = []
    
    for row in rows:
        if not row.pattern_tag:
            continue
            
        solved_count = row.solved or 0
        pattern_breakdown.append({
            "pattern": row.pattern_tag,
            "attempts": row.attempts,
            "solved": solved_count
        })
        
        if row.attempts > 0 and (solved_count / row.attempts) < 0.5:
            weak_patterns.append(row.pattern_tag)
            
    return {
        "total_attempts": total_attempts,
        "pattern_breakdown": pattern_breakdown,
        "weak_patterns": weak_patterns
    }
