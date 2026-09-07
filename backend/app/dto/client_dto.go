package dto

type ListClientsQuery struct {
	Page    int
	PerPage int
	Q       string
	Status  string
	SortBy  string
	SortDir string
}

type ClientResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

type PaginationMeta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

type ListClientsResponse struct {
	Data []ClientResponse `json:"data"`
	Meta PaginationMeta   `json:"meta"`
}

type CreateClientRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Status   string `json:"status"`
	Role     string `json:"role"`
}

type UpdateClientRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Status   string `json:"status"`
	Role     string `json:"role"`
}

type UpdateClientStatusRequest struct {
	Status string `json:"status"`
}
