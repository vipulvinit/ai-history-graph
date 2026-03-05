from pydantic import BaseModel, Field
from typing import List, Optional, Union

class Node(BaseModel):
    id: str = Field(..., description="The exact Name or Title of the entity.")
    group: str = Field(..., description="Must be 'Person', 'Event', or 'Concept'.")
    description: str = Field(..., description="A short summary or core principle.")
    
    # Rich Metadata (Now accepts both strings like "1095" AND integers like 1095)
    birth_year: Optional[Union[str, int]] = None
    death_year: Optional[Union[str, int]] = None
    start_year: Optional[Union[str, int]] = None
    end_year: Optional[Union[str, int]] = None
    
    location: Optional[str] = None
    origin_era: Optional[str] = None

class Edge(BaseModel):
    source: str = Field(...)
    target: str = Field(...)
    label: str = Field(..., description="CAUSED, INFLUENCED, or OPPOSED.")
    
    # New Analytical Fields
    confidence_score: float = Field(..., description="Score from 1.0 to 10.0 representing historical certainty.")
    snippet: Optional[str] = Field(default=None, description="The exact text snippet proving this connection.")

class GraphResponse(BaseModel):
    nodes: List[Node]
    links: List[Edge]

class SearchRequest(BaseModel):
    query: str