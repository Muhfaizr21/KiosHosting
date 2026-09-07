package superadmin

import (
	"net/http"
	"strconv"

	"kioshosting-backend/app/dto"
	"kioshosting-backend/app/services"

	"github.com/gin-gonic/gin"
)

func ListClients(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	q := c.Query("q")
	status := c.Query("status")
	sortBy := c.DefaultQuery("sort_by", "created_at")
	sortDir := c.DefaultQuery("sort_dir", "desc")

	res, err := services.ListClients(dto.ListClientsQuery{
		Page:    page,
		PerPage: perPage,
		Q:       q,
		Status:  status,
		SortBy:  sortBy,
		SortDir: sortDir,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil daftar client"})
		return
	}
	c.JSON(http.StatusOK, res)
}

func GetClient(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID client tidak valid"})
		return
	}

	client, err := services.GetClientByID(uint(id64))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Client tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, client)
}

func CreateClient(c *gin.Context) {
	var req dto.CreateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	client, err := services.CreateClient(req)
	if err != nil {
		if err == services.ErrEmailTaken {
			c.JSON(http.StatusConflict, gin.H{"message": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Client berhasil ditambahkan",
		"data":    client,
	})
}

func UpdateClient(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID client tidak valid"})
		return
	}

	var req dto.UpdateClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	client, err := services.UpdateClient(uint(id64), req)
	if err != nil {
		if err == services.ErrEmailTaken {
			c.JSON(http.StatusConflict, gin.H{"message": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data client berhasil diperbarui",
		"data":    client,
	})
}

func UpdateClientStatus(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID client tidak valid"})
		return
	}

	var req dto.UpdateClientStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Payload tidak valid"})
		return
	}

	client, err := services.UpdateClientStatus(uint(id64), req.Status)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Status client berhasil diubah",
		"data":    client,
	})
}

func DeleteClient(c *gin.Context) {
	id64, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID client tidak valid"})
		return
	}

	if err := services.DeleteClient(uint(id64)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Client berhasil dihapus",
	})
}
