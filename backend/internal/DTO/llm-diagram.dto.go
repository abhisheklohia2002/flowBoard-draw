package dto

type LLMDiagram struct {
	UserMessage string `json:"userMessage"`
	Diagram     uint   `json:"diagram"`
}

type LLMResponse struct {
	Title         string         `json:"title"`
	Description   string         `json:"description"`
	Entities      []Entity       `json:"entities"`
	Relationships []Relationship `json:"relationships"`
}

type Entity struct {
	ID         string      `json:"id"`
	Name       string      `json:"name"`
	Attributes []Attribute `json:"attributes"`
}

type Attribute struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	PrimaryKey bool   `json:"primaryKey"`
	Nullable   bool   `json:"nullable"`
}

type Relationship struct {
	From  string `json:"from"`
	To    string `json:"to"`
	Type  string `json:"type"`
	Label string `json:"label"`
}
