from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.db.session import get_db
from backend.app.models.note import Note, NoteCreate, NoteUpdate, NoteResponse
from backend.app.api.deps import get_current_user
from backend.app.models.user import User

router = APIRouter()


@router.get("/tags", response_model=dict)
def get_all_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    all_tags = set()
    for note in notes:
        if note.tags:
            for tag in note.tags:
                all_tags.add(tag)
    return {"tags": sorted(list(all_tags))}


@router.get("/", response_model=List[NoteResponse])
def get_notes(
    tag: Optional[str] = Query(None),
    folder_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Note).filter(Note.user_id == current_user.id)

    if folder_id is not None:
        query = query.filter(Note.folder_id == folder_id)

    if search:
        query = query.filter(
            Note.title.ilike(f"%{search}%") | Note.body.ilike(f"%{search}%")
        )

    if tag is not None:
        query = query.filter(Note.tags.contains([tag]))

    notes = query.all()
    return notes


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = Note(
        title=note_in.title,
        body=note_in.body,
        tags=note_in.tags or [],
        folder_id=note_in.folder_id,
        user_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = note_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    if note.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(note)
    db.commit()