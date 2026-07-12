package com.aima.service;

import java.time.LocalDateTime;

public interface EmailService {
    void sendForgotPasswordOtpEmail(String toEmail, String otpCode, String fullName);
    void sendChangePasswordOtpEmail(String toEmail, String otpCode, String fullName);
    void sendAccountSetupSuccessEmail(String toEmail, String fullName, LocalDateTime setupTime);
    /** Cảnh báo tài khoản còn `daysRemaining` ngày trước khi bị xóa vĩnh viễn (FR-80). */
    void sendAccountDeletionWarningEmail(String toEmail, String fullName, LocalDateTime deletionDate, long daysRemaining);
}