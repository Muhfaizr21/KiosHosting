package dto

type DashboardMetrics struct {
	TotalRevenue  string `json:"total_revenue"`
	ActiveClients int    `json:"active_clients"`
	ServerNodes   string `json:"server_nodes"`
	UptimeHealth  string `json:"uptime_health"`
	OpenTickets   string `json:"open_tickets"`
	Conversion    string `json:"conversion"`
}

type RecentUser struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type DashboardResponse struct {
	Metrics        DashboardMetrics `json:"metrics"`
	Charts         DashboardCharts  `json:"charts"`
	RecentUsers    []RecentUser     `json:"recent_users"`
	RecentActivity []any            `json:"recent_activity"`
}

type DashboardCharts struct {
	Revenue   []any `json:"revenue"`
	Clients   []any `json:"clients"`
	Server    []any `json:"server"`
	Tickets   []any `json:"tickets"`
	Bandwidth []any `json:"bandwidth"`
}
