package net.javaguides.ims_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "returns")
public class Return {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(name = "returned_date")
    private LocalDate returnedDate;

    @Column(name = "reason", nullable = false)
    private String reason;

    // Constructors
    public Return() {}

    public Return(String productId, LocalDate returnDate, LocalDate returnedDate, String reason) {
        this.productId = productId;
        this.returnDate = returnDate;
        this.returnedDate = returnedDate;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    // Getters and setters for returnDate and returnedDate
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public LocalDate getReturnedDate() { return returnedDate; }
    public void setReturnedDate(LocalDate returnedDate) { this.returnedDate = returnedDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}