package net.javaguides.ims_backend.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Payment {
    private int month;
    private int year;
    private boolean paid;

    // Getters and Setters
    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }
}