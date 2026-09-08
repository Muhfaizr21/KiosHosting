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

			// Public catalog routes (Landing page)
			v1.GET("/products/plans", superadmin.ListPublicHostingPlans)
			v1.GET("/products/domains", superadmin.ListDomainTLDs)

			auth := v1.Group("")
			auth.Use(middleware.AuthMiddleware())
			{
				auth.GET("/auth/me", controllers.Me)
				auth.GET("/me/invoices", controllers.MeInvoices)
				auth.GET("/me/services", controllers.MeServices)
				auth.GET("/me/services/:id", controllers.MeServiceDetail)
				auth.GET("/me/tickets", controllers.MeTickets)
				auth.POST("/me/tickets", controllers.MeCreateTicket)
				auth.POST("/me/tickets/:id/reply", controllers.MeReplyTicket)
				auth.GET("/me/settings", controllers.MeSettings)
				auth.PUT("/me/settings", controllers.MeUpdateSettings)

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
					admin.POST("/billing/invoices/:id/remind", superadmin.SendInvoiceReminder)

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

					// Security & WAF routes
					admin.GET("/security/overview", superadmin.GetSecurityOverview)
					admin.GET("/security/blocked-ips", superadmin.ListBlockedIPs)
					admin.POST("/security/ban-ip", superadmin.BanIP)
					admin.PUT("/security/unban/:id", superadmin.UnbanIP)
					admin.POST("/security/cf-cache-clear", superadmin.ClearCloudflareCache)
					admin.PUT("/security/toggle-under-attack", superadmin.ToggleUnderAttackMode)

					// Finance & Cash Flow routes
					admin.GET("/finance/overview", superadmin.GetFinanceOverview)
					admin.GET("/finance/coa", superadmin.ListCOA)
					admin.POST("/finance/coa", superadmin.CreateCOA)
					admin.GET("/finance/transactions", superadmin.ListCashflowTransactions)
					admin.POST("/finance/transactions", superadmin.CreateCashflowTransaction)
					admin.DELETE("/finance/transactions/:id", superadmin.DeleteCashflowTransaction)

					// Auto-Provisioning routes
					admin.GET("/provisioning/overview", superadmin.GetProvisioningOverview)
					admin.GET("/provisioning/servers", superadmin.ListServerConnectors)
					admin.POST("/provisioning/servers", superadmin.CreateServerConnector)
					admin.PUT("/provisioning/servers/:id", superadmin.UpdateServerConnector)
					admin.POST("/provisioning/servers/:id/test", superadmin.TestServerConnector)
					admin.DELETE("/provisioning/servers/:id", superadmin.DeleteServerConnector)
					admin.GET("/provisioning/services", superadmin.ListUserServices)
					admin.POST("/provisioning/services", superadmin.CreateManualService)
					admin.POST("/provisioning/services/:id/action", superadmin.ExecuteServiceAction)
					admin.GET("/provisioning/logs", superadmin.ListProvisioningLogs)

					// Dunning & Billing Lifecycle Automator routes
					admin.GET("/dunning/settings", superadmin.GetDunningSettings)
					admin.PUT("/dunning/settings", superadmin.UpdateDunningSettings)
					admin.POST("/dunning/run", superadmin.RunDunningManual)
					admin.GET("/dunning/logs", superadmin.ListDunningLogs)

					// Domain Registrar & DNS Manager routes
					admin.GET("/domains", superadmin.ListRegisteredDomains)
					admin.POST("/domains", superadmin.RegisterDomain)
					admin.PUT("/domains/:id/security", superadmin.ToggleDomainSecurity)
					admin.GET("/domains/:id/epp", superadmin.GetDomainEPP)
					admin.PUT("/domains/:id/nameservers", superadmin.UpdateNameservers)
					admin.GET("/domains/:id/dns", superadmin.ListDNSRecords)
					admin.POST("/domains/:id/dns", superadmin.CreateDNSRecord)
					admin.PUT("/domains/:id/dns/:record_id", superadmin.UpdateDNSRecord)
					admin.DELETE("/domains/:id/dns/:record_id", superadmin.DeleteDNSRecord)
					admin.POST("/domains/:id/dns/preset", superadmin.ApplyDNSPreset)
				}
			}
		}
	}
}
