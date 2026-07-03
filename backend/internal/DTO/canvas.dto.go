package dto

import "gorm.io/datatypes"

type SaveCanvasRequest struct {
	Nodes      []CanvasNode   `json:"nodes" binding:"required"`
	Edges      []CanvasEdge   `json:"edges" binding:"required"`
	Viewport   CanvasViewport `json:"viewport" binding:"required"`
	ChangeNote string         `json:"change_note"`
}

type CanvasNode struct {
	ID       string         `json:"id" binding:"required"`
	Type     string         `json:"type" binding:"required"`
	Position CanvasPosition `json:"position" binding:"required"`
	Width    float64        `json:"width"`
	Height   float64        `json:"height"`
	Data     datatypes.JSON `json:"data"`
	Style    datatypes.JSON `json:"style"`
}

type CanvasEdge struct {
	ID           string         `json:"id" binding:"required"`
	Source       string         `json:"source" binding:"required"`
	Target       string         `json:"target" binding:"required"`
	SourceHandle string         `json:"sourceHandle"`
	TargetHandle string         `json:"targetHandle"`
	Type         string         `json:"type"`
	Label        string         `json:"label"`
	Data         datatypes.JSON `json:"data"`
	Style        datatypes.JSON `json:"style"`
}

type CanvasPosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type CanvasViewport struct {
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Zoom float64 `json:"zoom"`
}

type SaveCanvasResponse struct {
	DiagramID     uint `json:"diagram_id"`
	NodeCount     int  `json:"node_count"`
	EdgeCount     int  `json:"edge_count"`
	VersionNumber uint `json:"version_number"`
}

type CanvasResponse struct {
	Diagram  DiagramCanvasMeta `json:"diagram"`
	Nodes    []CanvasNode      `json:"nodes"`
	Edges    []CanvasEdge      `json:"edges"`
	Viewport CanvasViewport    `json:"viewport"`
}

type DiagramCanvasMeta struct {
	ID        uint   `json:"id"`
	ProjectID uint   `json:"project_id"`
	Name      string `json:"name"`
}
