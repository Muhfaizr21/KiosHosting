package services

import (
	"fmt"

	"kioshosting-backend/app/dto"
	"kioshosting-backend/app/models"
	"kioshosting-backend/bootstrap"
)

func GetDashboardStats() (dto.DashboardResponse, error) {
	var resp dto.DashboardResponse
	var activeClientsCount int64
	if err := bootstrap.DB.Model(&models.User{}).Where("role = ?", models.RoleUser).Count(&activeClientsCount).Error; err != nil {
		return resp, err
	}

	var recentUsers []models.User
	if err := bootstrap.DB.Order("created_at desc").Limit(5).Find(&recentUsers).Error; err != nil {
		return resp, err
	}

	var openTicketsCount int64
	bootstrap.DB.Model(&models.Ticket{}).Where("status = ?", models.TicketStatusOpen).Count(&openTicketsCount)

	safeRecentUsers := make([]dto.RecentUser, 0, len(recentUsers))
	for _, u := range recentUsers {
		safeRecentUsers = append(safeRecentUsers, dto.RecentUser{
			ID: u.ID, Name: u.Name, Email: u.Email, Role: string(u.Role),
		})
	}

	resp = dto.DashboardResponse{
		Metrics: dto.DashboardMetrics{
			TotalRevenue:  "Rp 0",
			ActiveClients: int(activeClientsCount),
			ServerNodes:   "0 Active",
			UptimeHealth:  "0%",
			OpenTickets:   fmt.Sprintf("%d", openTicketsCount),
			Conversion:    "0%",
		},
		Charts: dto.DashboardCharts{
			Revenue: []any{}, Clients: []any{}, Server: []any{}, Tickets: []any{}, Bandwidth: []any{},
		},
		RecentUsers:    safeRecentUsers,
		RecentActivity: []any{},
	}
	return resp, nil
}
