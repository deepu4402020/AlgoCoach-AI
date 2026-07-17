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
    # total problems attempted
    result = await db.execute(select(func.count(ProblemAttempt.id)).where(ProblemAttempt.user_id == current_user.id))
    total_attempts = result.scalar() or 0
    
    # breakdown by pattern
    result = await db.execute(
        select(ProblemAttempt.pattern_tag, func.count(ProblemAttempt.id))
        .where(ProblemAttempt.user_id == current_user.id)
        .group_by(ProblemAttempt.pattern_tag)
    )
    attempts_by_pattern = result.fetchall()
    
    # breakdown of solved by pattern
    result = await db.execute(
        select(ProblemAttempt.pattern_tag, func.count(ProblemAttempt.id))
        .where(ProblemAttempt.user_id == current_user.id, ProblemAttempt.outcome == "solved")
        .group_by(ProblemAttempt.pattern_tag)
    )
    solved_by_pattern = result.fetchall()
    
    solved_dict = {row[0]: row[1] for row in solved_by_pattern}
    
    pattern_breakdown = []
    weak_patterns = []
    for pattern, attempts in attempts_by_pattern:
        if not pattern:
            continue
        solved = solved_dict.get(pattern, 0)
        pattern_breakdown.append({
            "pattern": pattern,
            "attempts": attempts,
            "solved": solved
        })
        if attempts > 0 and (solved / attempts) < 0.5:
            weak_patterns.append(pattern)
            
    return {
        "total_attempts": total_attempts,
        "pattern_breakdown": pattern_breakdown,
        "weak_patterns": weak_patterns
    }
