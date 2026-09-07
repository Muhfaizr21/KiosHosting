package routes

import (
	controllers "kioshosting-backend/app/http/controllers"
	"kioshosting-backend/app/http/controllers/superadmin"
	"kioshosting-backend/app/http/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/ping", controllers.Ping)

		v1 := api.Group("/v1")
		{
			v1.POST("/auth/register", controllers.Register)
			v1.POST("/auth/login", controllers.Login)

			auth := v1.Group("")
			auth.Use(middleware.AuthMiddleware())
			{
				auth.GET("/auth/me", controllers.Me)

				// Superadmin-only routes
				admin := auth.Group("/admin")
				admin.Use(middleware.RequireRole("superadmin"))
				{
					admin.GET("/dashboard", superadmin.GetDashboardStats)
					admin.GET("/clients", superadmin.ListClients)
					admin.POST("/clients", superadmin.CreateClient)
					admin.GET("/clients/:id", superadmin.GetClient)
					admin.PUT("/clients/:id", superadmin.UpdateClient)
					admin.PUT("/clients/:id/status", superadmin.UpdateClientStatus)
					admin.DELETE("/clients/:id", superadmin.DeleteClient)
					admin.GET("/billing/stats", superadmin.GetBillingStats)
					admin.GET("/billing/invoices", superadmin.ListInvoices)
					admin.POST("/billing/invoices", superadmin.CreateInvoice)
					admin.PUT("/billing/invoices/:id/status", superadmin.UpdateInvoiceStatus)
					admin.DELETE("/billing/invoices/:id", superadmin.DeleteInvoice)
					admin.POST("/billing/seed", superadmin.SeedInvoices)

					// Products & Domains routes
					admin.GET("/products/plans", superadmin.ListHostingPlans)
					admin.POST("/products/plans", superadmin.CreateHostingPlan)
					admin.PUT("/products/plans/:id", superadmin.UpdateHostingPlan)
					admin.DELETE("/products/plans/:id", superadmin.DeleteHostingPlan)

					admin.GET("/products/domains", superadmin.ListDomainTLDs)
					admin.POST("/products/domains", superadmin.CreateDomainTLD)
					admin.PUT("/products/domains/:id", superadmin.UpdateDomainTLD)
					admin.PUT("/products/domains/:id/toggle", superadmin.ToggleDomainTLD)
					admin.DELETE("/products/domains/:id", superadmin.DeleteDomainTLD)

					// Support Tickets routes
					admin.GET("/support/tickets", superadmin.ListTickets)
					admin.GET("/support/tickets/:id", superadmin.GetTicketDetail)
					admin.POST("/support/tickets", superadmin.CreateTicket)
					admin.POST("/support/tickets/:id/reply", superadmin.ReplyTicket)
					admin.PUT("/support/tickets/:id/status", superadmin.UpdateTicketStatus)
					admin.DELETE("/support/tickets/:id", superadmin.DeleteTicket)

					// System Settings & Integrations routes
					admin.GET("/settings", superadmin.GetSettings)
					admin.PUT("/settings", superadmin.UpdateSettings)
					admin.GET("/settings/webhooks", superadmin.ListWebhooks)
					admin.POST("/settings/webhooks", superadmin.CreateWebhook)
					admin.DELETE("/settings/webhooks/:id", superadmin.DeleteWebhook)
					admin.GET("/settings/staff", superadmin.ListStaff)
					admin.POST("/settings/staff", superadmin.CreateStaff)
					admin.PUT("/settings/staff/:id", superadmin.UpdateStaffRole)
					admin.DELETE("/settings/staff/:id", superadmin.DeleteStaff)
				}
			}
		}
	}
}
